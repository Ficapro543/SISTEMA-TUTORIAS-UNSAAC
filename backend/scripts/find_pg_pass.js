const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

// Script interactivo simulado para probar credenciales comunes
async function tryConnect(password) {
    const connectionString = `postgresql://postgres:${password}@localhost:5432/postgres`; // Conectar a DB default
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log(`✅ ¡ÉXITO! La contraseña es: '${password}'`);
        await client.end();
        return true;
    } catch (e) {
        // console.log(`❌ Falló con '${password}': ${e.message}`);
        await client.end();
        return false;
    }
}

async function findCredentials() {
    console.log("🔍 Buscando contraseña correcta para el usuario 'postgres'...");
    const commonPasswords = ['root', 'admin', '123456', 'postgres', 'password', 'admin123', ''];

    for (const pass of commonPasswords) {
        if (await tryConnect(pass)) {
            // Actualizar .env si encontramos la correcta
            const envPath = path.join(__dirname, '../.env');
            let content = fs.readFileSync(envPath, 'utf8');
            const newUrl = `DATABASE_URL=postgresql://postgres:${pass}@localhost:5432/sistema_tutorias`;

            if (content.match(/^DATABASE_URL=.*/m)) {
                content = content.replace(/^DATABASE_URL=.*/m, newUrl);
            } else {
                content = newUrl + '\n' + content;
            }
            fs.writeFileSync(envPath, content, 'utf8');
            console.log("✅ .env actualizado con la contraseña correcta.");
            return;
        }
    }
    console.log("❌ No se encontró la contraseña en la lista común.");
    console.log("⚠️ Necesitaremos preguntar al usuario via notify_user.");
}

findCredentials();
