require('dotenv').config();
const pool = require('../src/db/pool');

async function deleteUser(email) {
    if (!email) {
        console.error('Uso: node scripts/delete_user.js correo@unsaac.edu.pe');
        process.exit(1);
    }

    try {
        console.log(`Buscando usuario con email: ${email}`);

        // Borrar de users
        const resUsers = await pool.query('DELETE FROM users WHERE email = $1 RETURNING id', [email]);
        if (resUsers.rowCount > 0) {
            console.log(`✅ Usuario eliminado de la tabla 'users' (ID: ${resUsers.rows[0].id})`);
        } else {
            console.log(`ℹ️ No se encontró el usuario en la tabla 'users'.`);
        }

        // Borrar de pending_users
        const resPending = await pool.query('DELETE FROM pending_users WHERE email = $1 RETURNING id', [email]);
        if (resPending.rowCount > 0) {
            console.log(`✅ Usuario eliminado de la tabla 'pending_users' (ID: ${resPending.rows[0].id})`);
        } else {
            console.log(`ℹ️ No se encontró el usuario en la tabla 'pending_users'.`);
        }

        console.log('Operación completada.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error al eliminar usuario:', err.message);
        process.exit(1);
    }
}

const targetEmail = process.argv[2];
deleteUser(targetEmail);
