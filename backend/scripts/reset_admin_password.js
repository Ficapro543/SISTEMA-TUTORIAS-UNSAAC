require('dotenv').config();
const pool = require('../src/db/pool');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
    try {
        const email = 'admin@unsaac.edu.pe';
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const res = await pool.query(
            "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email",
            [hashedPassword, email]
        );

        if (res.rowCount > 0) {
            console.log(`✅ Contraseña de ${email} restablecida a: ${newPassword}`);
        } else {
            console.log(`❌ No se encontró al usuario ${email}`);
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        process.exit();
    }
}

resetAdminPassword();
