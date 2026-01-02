const { Client } = require('pg');
require('dotenv').config();

async function checkDb() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("✅ Conexión exitosa a PostgreSQL");

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        if (res.rows.length === 0) {
            console.log("⚠️  La base de datos está vacía (no hay tablas).");
        } else {
            console.log("📊 Tablas encontradas:");
            res.rows.forEach(row => console.log(` - ${row.table_name}`));
        }

        // Verificar específicamente la tabla 'users'
        const usersTable = res.rows.find(r => r.table_name === 'users');
        if (!usersTable) {
            console.log("\n❌ CRÍTICO: La tabla 'users' NO existe. Esto causa el error de login.");
        } else {
            console.log("\n✅ La tabla 'users' existe.");
            // Contar usuarios
            const count = await client.query('SELECT count(*) FROM users');
            console.log(`👥 Número de usuarios en la tabla: ${count.rows[0].count}`);
        }

    } catch (err) {
        console.error("❌ Error de conexión:", err.message);
        if (err.message.includes("does not exist")) {
            console.error("   (Probablemente la base de datos especificada en la URL no existe)");
        }
    } finally {
        await client.end();
    }
}

checkDb();
