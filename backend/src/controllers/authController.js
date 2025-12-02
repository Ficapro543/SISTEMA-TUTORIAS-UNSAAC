const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { signAccessToken, signRefreshToken } = require('../utils/tokens');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const q = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    if (q.rowCount === 0) return res.status(401).json({ message: 'Usuario no registrado' });

    const user = q.rows[0];
    if (!user.is_active) return res.status(403).json({ message: 'Cuenta no activada' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const payload = { userId: user.id, roles: user.roles };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await pool.query(`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)`,
      [user.id, refreshToken, new Date(Date.now() + 7*24*60*60*1000)]
    );

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7*24*60*60*1000 });
    // enviar roles como booleanos
    const rolesBoolean = {
      administrador: user.roles.includes('administrador') ? 1 : 0,
      tutor: user.roles.includes('tutor') ? 1 : 0,
      verificador: user.roles.includes('verificador') ? 1 : 0
    };

    res.json({ accessToken, roles: rolesBoolean });
  } catch (err) { next(err); }
}

async function activateAccount(req, res, next) {
  try {
    const { userId } = req.params;
    const q = await pool.query(`UPDATE users SET is_active=true WHERE id=$1 RETURNING *`, [userId]);
    if (q.rowCount === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Cuenta activada' });
  } catch (err) { next(err); }
}

module.exports = { login, activateAccount };
