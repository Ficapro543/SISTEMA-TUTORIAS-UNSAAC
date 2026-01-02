const { Client } = require('pg');
require('dotenv').config();

async function diagnose() {
    const url = process.env.DATABASE_URL;
    console.log("🔍 Diagnóstico de conexión:");

    if (!url) {
        console.error("❌ DATABASE_URL no está definida en .env");
        return;
    }

    // Parsear URL para mostrar info (sin contraseña)
    try {
        const urlParts = new URL(url);
        console.log(`   Host: ${urlParts.hostname}`);
        console.log(`   Puerto: ${urlParts.port || 5432}`);
        console.log(`   Base de datos: ${urlParts.pathname.split('/')[1]}`);
        console.log(`   Usuario: ${urlParts.username}`);
        console.log(`   Contraseña: ${urlParts.password ? '******' : '(sin contraseña)'}`);
    } catch (e) {
        console.log("⚠️  DATABASE_URL no tiene formato estándar URL, intentando conectar igual...");
    }

    const client = new Client({ connectionString: url });

    try {
        console.log("\n⏳ Intentando conectar...");
        await client.connect();
        console.log("✅ ¡Conexión exitosa!");

        const res = await client.query("SELECT current_database(), current_user, version()");
        console.log(`   DB Actual: ${res.rows[0].current_database}`);
        console.log(`   Usuario DB: ${res.rows[0].current_user}`);
        console.log(`   Versión: ${res.rows[0].version}`);

    } catch (err) {
        console.error("\n❌ Falló la conexión:");
        console.error(`   Mensaje: ${err.message}`);
        console.error(`   Código: ${err.code}`);
        if (err.code === '28P01') console.error("   💡 Pista: Contraseña incorrecta");
        if (err.code === '3D000') console.error("   💡 Pista: La base de datos no existe");
        if (err.code === 'ECONNREFUSED') console.error("   💡 Pista: PostgreSQL no está corriendo en ese host/puerto");
    } finally {
        await client.end();
    }
}

diagnose();
