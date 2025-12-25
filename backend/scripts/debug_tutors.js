require('dotenv').config();
const pool = require('../src/db/pool');

async function debug() {
    try {
        const res = await pool.query("SELECT email, roles, is_active FROM users");
        console.log("Total usuarios:", res.rows.length);
        console.log("Lista de usuarios y sus roles:");
        res.rows.forEach(u => {
            console.log(`- ${u.email}: [${u.roles.join(', ')}] (Activo: ${u.is_active})`);
        });

        const tutors = await pool.query("SELECT email FROM users WHERE 'tutor' = ANY(roles) OR 'Tutor' = ANY(roles)");
        console.log("\nTutores encontrados con la query:", tutors.rows.length);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
