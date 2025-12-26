require('dotenv').config();
const pool = require('../src/db/pool');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createAdmin() {
    try {
        const email = 'admin@unsaac.edu.pe';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if exists
        const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (res.rowCount > 0) {
            console.log(`⚠️  El usuario ${email} ya existe. Actualizando a Administrador...`);
            await pool.query(
                "UPDATE users SET roles = array_append(roles, 'administrador'), is_active = true WHERE email = $1 AND NOT ('administrador' = ANY(roles))",
                [email]
            );
        } else {
            await pool.query(
                `INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [uuidv4(), 'Admin', 'Test', email, hashedPassword, ['administrador', 'tutor'], true, 'ADM001']
            );
            console.log(`✅ Usuario creado: ${email}`);
        }

        console.log(`\n🔑 Credenciales: \nEmail: ${email}\nPassword: ${password}\n`);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

createAdmin();
