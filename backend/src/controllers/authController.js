// src/controllers/authController.js
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const { signAccessToken, signRefreshToken } = require('../utils/tokens');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const q = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    if (q.rowCount === 0)
      return res.status(401).json({ message: 'Usuario no registrado' });

    const user = q.rows[0];

    if (!user.is_active)
      return res.status(403).json({ message: 'Cuenta no activada' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ message: 'Contraseña incorrecta' });

    const payload = { userId: user.id, roles: user.roles };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1,$2,$3)`,
      [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const rolesBoolean = {
      administrador: user.roles.includes('administrador'),
      tutor: user.roles.includes('tutor'),
      verificador: user.roles.includes('verificador')
    };

    res.json({ accessToken, roles: rolesBoolean });
  } catch (err) {
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

module.exports = { login, activateAccount };
