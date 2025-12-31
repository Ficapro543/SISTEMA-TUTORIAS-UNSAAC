require('dotenv').config();
const pool = require('../src/db/pool');

async function addAllRoles() {
    try {
        const email = 'admin@unsaac.edu.pe';
        
        // Actualizar usuario para tener todos los roles
        const result = await pool.query(
            `UPDATE users 
             SET roles = ARRAY['administrador', 'tutor', 'verificador']::VARCHAR[] 
             WHERE email = $1 
             RETURNING *`,
            [email]
        );

        if (result.rowCount > 0) {
            console.log(`✅ Usuario ${email} actualizado con todos los roles:`);
            console.log(`   - Administrador`);
            console.log(`   - Tutor`);
            console.log(`   - Verificador`);
            console.log(`\n🔑 Credenciales: \nEmail: ${email}\nPassword: password123\n`);
            console.log(`Por favor, cierra sesión y vuelve a iniciar sesión para ver los cambios.`);
        } else {
            console.log(`⚠️  No se encontró el usuario ${email}`);
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

addAllRoles();
