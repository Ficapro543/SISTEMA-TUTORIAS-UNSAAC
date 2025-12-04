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

    // enviar notificación a administradores
    const adminEmail = process.env.ADMIN_EMAIL; // ahora tomas del .env
    await sendAdminApprovalEmail(adminEmail, id);

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

    await pool.query(`DELETE FROM pending_users WHERE id=$1`, [pendingUserId]);

    await sendUserActivationEmail(pendingUser.email, newUserId);

    res.json({ message: 'Usuario aprobado y correo de activación enviado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createPendingUser, approvePendingUser };
