// src/controllers/authController.js
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/tokens');

async function login(req, res, next) {
  try {
    console.log('🔍 Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    // 1. Validar entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'Completa tus datos.' });
    }

    //2. Buscar Usuario
    console.log('🔍 Buscando usuario en BD...');
    const userQuery = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    console.log(`🔍 Resultado BD: ${userQuery.rowCount} usuarios encontrados`);
    if (userQuery.rowCount === 0)
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });

    const user = userQuery.rows[0];
    console.log('🔍 Usuario encontrado:', { 
      id: user.id, 
      email: user.email, 
      is_active: user.is_active,
      roles: user.roles 
    });
    //3. Verificar si está activo
    if (!user.is_active)
      return res.status(403).json({ message: 'Cuenta no activada' });

    //4. Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    console.log(`🔍 Contraseña válida: ${validPassword}`);
    //5. Crear payload para los tokens
    const payload = { 
      id: user.id,
      email: user.email,
      roles: user.roles,
      first_name: user.first_name,
      last_name: user.last_name
    };
    console.log('🔍 Payload creado:', payload);

    //6. Generar tokens
    console.log('🔍 Generando tokens...');
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    //7. Guardar refresh token en la bdd
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate()+7); //7 Dias
    console.log('🔍 Guardando refresh token en BD...');
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1,$2,$3)`,
      [user.id, refreshToken, expiresAt]
    );

    //8. Enviar respuesta
    const rolesBoolean = {
      administrador: user.roles.includes('administrador'),
      tutor: user.roles.includes('tutor'),
      verificador: user.roles.includes('verificador')
    };

    console.log('🔍 Roles booleanos:', rolesBoolean);
    res.json({
      message: 'Login exitoso',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: rolesBoolean
      }
    })

  } catch (err) {
    console.error('🔥 ERROR en login:', err);
    next(err);
  }
}

async function activateAccount(req, res, next) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); //Iniciar Transaccion

    const { token } = req.params;

    console.log("=== ACTIVATE ACCOUNT DEBUG ===");
    console.log("Token recibido:", token);

    //1. Verificamos token en la tabla
    const q = await client.query(
      `SELECT at.user_id, at.expires_at, at.used, at.used_at, 
              u.id as user_id_exists, u.is_active, u.first_name, u.last_name, u.email, u.roles
       FROM activation_tokens at
       INNER JOIN users u ON at.user_id = u.id
       WHERE at.token=$1
       FOR UPDATE`,
      [token]
    );

    console.log("Resultado de la query:", q.rowCount, "registros encontrados");

    if (q.rowCount === 0) {
      await client.query('ROLLBACK');
      console.log("❌ Token NO encontrado en la base de datos");
      return res.status(404).json({ 
        message: 'Token inválido o expirado'
      });
    }

    const tokenData = q.rows[0];

    // 2. Verificar si el token ya fue usado
    if (tokenData.used) {
      console.log("⚠️ Token ya usado anteriormente");
      await client.query('ROLLBACK');

      return res.status(200).json({ 
        message: 'La cuenta ya fue activada anteriormente con este enlace.',
        user: {
          id: tokenData.user_id_exists,
          email: tokenData.email,
          nombre: `${tokenData.first_name} ${tokenData.last_name}`,
          roles: tokenData.roles,
          approvedRoles: tokenData.roles,
          rejectedRoles: []
        }
      });
    }

    // 3. Verificar expiracion
    if (tokenData.expires_at < new Date()) {
      console.log("⚠️ Token expirado");
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'Token expirado. Solicite un nuevo enlace de activación.' 
      });
    }

    // 4. Verificar si ya está activo
    if (tokenData.is_active) {
      console.log("ℹ️ Cuenta ya activada anteriormente");
      // Marcar token como usado
      await client.query(
        `UPDATE activation_tokens 
         SET used = true, used_at = NOW() 
         WHERE token=$1`,
        [token]
      );
      await client.query('COMMIT');
      
      return res.status(200).json({ 
        message: 'La cuenta ya estaba activada anteriormente',
        user: {
          id: tokenData.user_id_exists,
          email: tokenData.email,
          nombre: `${tokenData.first_name} ${tokenData.last_name}`,
          roles: tokenData.roles,
          approvedRoles: tokenData.roles,
          rejectedRoles: []
        }
      });
    }

    // 5. Activar usuario y marcar token como usado en una sola operación
    const updateResult = await client.query(
      `WITH updated_user AS (
         UPDATE users 
         SET is_active = true 
         WHERE id = $1 AND is_active = false
         RETURNING id, first_name, last_name, email, roles
       ),
       updated_token AS (
         UPDATE activation_tokens 
         SET used = true, used_at = NOW() 
         WHERE token = $2 AND used = false
         RETURNING token
       )
       SELECT * FROM updated_user`,
      [tokenData.user_id, token]
    );

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      console.log("⚠️ No se pudo activar el usuario (posible condición de carrera)");
      return res.status(409).json({ 
        message: 'No se pudo activar la cuenta. Intente nuevamente.' 
      });
    }
    await client.query('COMMIT');
    
    const user = updateResult.rows[0];
    console.log("✅ Cuenta activada exitosamente para:", user.email);

    res.json({ 
      message: '¡Cuenta activada exitosamente!',
      user: {
        id: user.id,
        email: user.email,
        nombre: `${user.first_name} ${user.last_name}`,
        roles: user.roles,
        approvedRoles: user.roles,
        rejectedRoles: []
      }
    });

  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{}); //Rollback
    console.error("Error en activateAccount:", err);

    // Manejar deadlocks
    if (err.code === '40P01') { // deadlock_detected
      return res.status(409).json({ 
        message: 'Intente nuevamente en unos segundos.' 
      });
    }

    next(err);
  }finally{
    client.release(); //Liberar conexion siempre
  }
}

// Refresh Token
async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token requerido' });
    }

    // 1. Verificar que el refresh token exista en la base de datos
    const tokenQuery = await pool.query(
      `SELECT * FROM refresh_tokens 
       WHERE token = $1 AND expires_at > NOW()`,
      [refreshToken]
    );

    if (tokenQuery.rowCount === 0) {
      return res.status(403).json({ message: 'Refresh token inválido o expirado' });
    }

    const storedToken = tokenQuery.rows[0];

    // 2. Verificar el token JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      // Si el token JWT es inválido, eliminarlo de la base de datos
      await pool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [refreshToken]);
      return res.status(403).json({ message: 'Refresh token inválido' });
    }

    // 3. Buscar usuario
    const userQuery = await pool.query(`SELECT * FROM users WHERE id = $1`, [decoded.id]);
    if (userQuery.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userQuery.rows[0];

    // 4. Crear nuevo payload
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles,
      first_name: user.first_name,
      last_name: user.last_name
    };

    // 5. Generar nuevo access token
    const newAccessToken = signAccessToken(payload);

    // 6. Opcional: rotar refresh token (mejor seguridad)
    const newRefreshToken = signRefreshToken(payload);
    
    // Actualizar refresh token en BD
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
      `UPDATE refresh_tokens 
       SET token = $1, expires_at = $2, created_at = NOW()
       WHERE id = $3`,
      [newRefreshToken, expiresAt, storedToken.id]
    );

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next){
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({message: 'Refresh token requerido'})
    }

    // Eliminamos refresh token de la bdd
    await pool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [refreshToken]);

    res.json({ message: 'Logout exitoso' });
  } catch (err) {
    next(err);
  }
}

// Obtener perfil del usuario actual
async function getProfile(req, res, next) {
  try {
    const rolesBoolean = {
      administrador: user.roles.includes('administrador'),
      tutor: user.roles.includes('tutor'),
      verificador: user.roles.includes('verificador')
    };

    // El usuario ya está adjunto por el middleware authenticateToken
    res.json({
      user:{
        ...req.user,
        roles: rolesBoolean
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  login, 
  activateAccount,
  refreshToken,
  logout,
  getProfile
};
