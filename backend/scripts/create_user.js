/**
 * scripts/create_user.js
 * 
 * Uso: node scripts/create_user.js "Nombre" "Apellido" "email@ejemplo.com" "password123" "ADMIN,TUTOR" "CODIGO123"
 */

const pool = require('../src/db/pool');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createUser() {
    const args = process.argv.slice(2);

    if (args.length < 4) {
        console.log('\n❌ Faltan argumentos.');
        console.log('Uso: node scripts/create_user.js <Nombre> <Apellido> <Email> <Password> [Roles] [Codigo]');
        console.log('Ejemplo: node scripts/create_user.js "Juan" "Perez" "juan@unsaac.edu.pe" "miPass123" "administrador,tutor" "123456"\n');
        process.exit(1);
    }

    const [first_name, last_name, email, password, rolesRaw, code] = args;

    // Procesar roles
    const roles = rolesRaw
        ? rolesRaw.split(',').map(r => r.trim().toLowerCase())
        : ['tutor']; // Rol por defecto

    try {
        console.log(`\n⏳ Creando usuario ${email}...`);

        // Verificar si existe
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rowCount > 0) {
            console.log('❌ Error: El correo ya está registrado.');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        await pool.query(
            `INSERT INTO users (id, first_name, last_name, email, password_hash, roles, is_active, code)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, first_name, last_name, email, hashedPassword, roles, true, code || null]
        );

        console.log('✅ Usuario creado exitosamente.');
        console.log('-------------------------------');
        console.log(`Nombre: ${first_name} ${last_name}`);
        console.log(`Email:  ${email}`);
        console.log(`Roles:  ${roles.join(', ')}`);
        console.log(`Código: ${code || 'N/A'}`);
        console.log('-------------------------------\n');

    } catch (err) {
        console.error('❌ Error fatal:', err.message);
    } finally {
        await pool.end();
    }
}

createUser();
