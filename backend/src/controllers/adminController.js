// src/controllers/adminController.js
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendAdminApprovalEmail, sendUserActivationEmail } = require('../services/mailService');

async function createPendingUser(req, res, next) {
  try {
    const { first_name, last_name, email, password, roles } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO pending_users (id, first_name, last_name, email, password_hash, roles)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, first_name, last_name, email, hashed, roles]
    );

    // enviar notificación a un administrador
    const adminEmail = process.env.ADMIN_EMAIL;
    await sendAdminApprovalEmail(adminEmail, id);
     
    // === PARA PRODUCCION ===
    // const adminsQuery = await pool.query(`
    //   SELECT email
    //   FROM users
    //   WHERE is_active = true
    //   AND 'Administrador' = ANY(roles)
    // `);
    // if (adminsQuery.rowCount === 0){
    //   console.warn('⚠️ No hay administradores activos para notificar');
    // }else{
    //   //Enviar correo a cada administrador
    //   for(const admin of adminsQuery.rows){
    //     await sendAdminApprovalEmail(admin.email, id);
    //   }
    // }

    res.json({ message: 'Solicitud enviada, esperando aprobación' });
  } catch (err) {
    next(err);
  }
}

async function approvePendingUser(req, res, next) {
  try {
    const { pendingUserId } = req.body;

    const q = await pool.query(`SELECT * FROM pending_users WHERE id=$1`, [pendingUserId]);
    if (q.rowCount === 0)
      return res.status(404).json({ message: 'Solicitud no encontrada' });

    const pendingUser = q.rows[0];

    // Crear decisiones para todos los roles como aprobados
    const rolesDecisiones = pendingUser.roles.map(rol => ({
      rol,
      decision: 'aprobado'
    }));

    // Actualizar las decisiones antes de aprobar
    await pool.query(
      `UPDATE pending_users 
       SET roles_decisiones=$1 
       WHERE id=$2`, 
      [JSON.stringify(rolesDecisiones), pendingUserId]
    );

    const newUserId = uuidv4();

    await pool.query(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        newUserId,
        pendingUser.first_name,
        pendingUser.last_name,
        pendingUser.email,
        pendingUser.password_hash,
        pendingUser.roles,
        false
      ]
    );

    // Crear token de activación
    const activationToken = uuidv4();
    console.log("Token generado (UUID):", activationToken);
    const expiration = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 horas

    await pool.query(
      `INSERT INTO activation_tokens (id, user_id, token, expires_at)
      VALUES (gen_random_uuid(), $1, $2, $3)`,
      [newUserId, activationToken, expiration]
    );
    
    // Eliminar de pending_users
    await pool.query(`DELETE FROM pending_users WHERE id=$1`, [pendingUserId]);

    // Enviar correo con token, NO con userId
    await sendUserActivationEmail(pendingUser.email, activationToken);

    res.json({ 
      message: 'Usuario aprobado y correo de activación enviado',
      userId: newUserId,
      email: pendingUser.email
    });

  } catch (err) {
    console.error("Error en approvePendingUser:", err);
    next(err);
  }
}

async function getAllPendingUser(req, res, next){
  try {
    const q = await pool.query(`
      SELECT id, first_name, last_name, email, roles, created_at
      FROM pending_users
      ORDER BY created_at DESC
    `);
    res.json(q.rows);
  } catch (err) {
    next(err);
  }
}

async function getOnePendingUser(req, res, next){
  try {
    const { id } = req.params;
    const q = await pool.query(
      `SELECT id, first_name, last_name, email, roles, created_at, 
       roles_decisiones
       FROM pending_users WHERE id=$1`, 
      [id]
    );

    if (q.rowCount === 0)
      return res.status(404).json({ message: 'Solicitud no encontrada' });

    const user = q.rows[0];
    // Asegurarnos de que roles_decisiones sea un array
    if (!user.roles_decisiones) {
      user.roles_decisiones = [];
    }

    res.json(q.rows[0]);
  } catch (err) {
    console.error("Error en getOnePendingUser:", err);
    next(err);
  }
}

async function rejectOnePendingUser(req, res, next) {
  try {
    const { pendingUserId } = req.body;

    const q = await pool.query(`SELECT roles FROM pending_users WHERE id=$1`, [pendingUserId]);
    if (q.rowCount === 0)
      return res.status(404).json({ message: 'Solicitud no encontrada' });

    const pendingUser = q.rows[0];

    // Crear decisiones para todos los roles como rechazados
    const rolesDecisiones = pendingUser.roles.map(rol => ({
      rol,
      decision: 'rechazado'
    }));

    // Actualizar las decisiones antes de rechazar
    await pool.query(
      `UPDATE pending_users 
       SET roles_decisiones=$1 
       WHERE id=$2`, 
      [JSON.stringify(rolesDecisiones), pendingUserId]
    );

    await pool.query(`DELETE FROM pending_users WHERE id=$1`, [pendingUserId]);

    res.json({ message: 'Solicitud rechazada' });
  } catch (err) {
    next(err);
  }
}

// Aprobar o rechazar un rol específico
async function decideRol(req, res, next) {
  try {
    const { pendingUserId, rol } = req.params;
    const { decision } = req.body; // "aprobado" o "rechazado"

    // Obtener usuario pendiente
    const q = await pool.query(
      `SELECT roles, roles_decisiones FROM pending_users WHERE id=$1`, 
      [pendingUserId]
    );
    
    if (q.rowCount === 0) return res.status(404).json({ message: 'Solicitud no encontrada' });

    const user = q.rows[0];
    const roles = user.roles; // array de roles
    let rolesDecisiones = user.roles_decisiones || [];

    // Verificar si el rol existe en la solicitud
    if (!roles.includes(rol)) {
      return res.status(400).json({ message: `Rol ${rol} no fue solicitado` });
    }

    // Buscar si ya existe una decisión para este rol
    let rolEncontrado = false;
    let nuevasDecisiones = [];
    if (rolesDecisiones && rolesDecisiones.length > 0) {
        nuevasDecisiones = rolesDecisiones.map(item => {
        if (item.rol === rol) {
          rolEncontrado = true;
          return { rol, decision };
        }
        return item;
      });
    }

    // Si no existía, agregarlo
    if (!rolEncontrado) {
      nuevasDecisiones.push({ rol, decision });
    }

    // Actualizar en la DB
    await pool.query(
      `UPDATE pending_users 
       SET roles_decisiones=$1 
       WHERE id=$2`, 
      [JSON.stringify(nuevasDecisiones), pendingUserId]
    );

    res.json({ 
      message: `Rol ${rol} ${decision}`, 
      roles_decisiones: nuevasDecisiones 
    });
  } catch (err) {
    console.error("Error en decideRol:", err);
    next(err);
  }
}

async function getSemestresCerrados(req, res, next){
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre 
       FROM semestres 
       WHERE cerrado = true
       ORDER BY nombre DESC`
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getTutoriasPorSemestre(req, res, next){
  const { semestreId } = req.query;

  if (!semestreId) {
    return res.status(400).json({ message: 'semestreId requerido' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, estudiante, tutor, tipo, fecha
       FROM tutorias
       WHERE semestre_id = $1
       ORDER BY fecha DESC`,
      [semestreId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getTutoriaDetalle(req, res, next){
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM tutorias
       WHERE id = $1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Tutoría no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  createPendingUser,
  approvePendingUser,
  getAllPendingUser,
  getOnePendingUser,
  rejectOnePendingUser,
  decideRol,
  getSemestresCerrados,
  getTutoriasPorSemestre,
  getTutoriaDetalle,
};
