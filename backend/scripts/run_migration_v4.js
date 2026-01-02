const fs = require('fs');
const path = require('path');

// 1. Cargar dotenv ANTES de importar pool.js para que process.env.DATABASE_URL exista
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 2. Importar el pool configurado de la aplicación
const pool = require('../src/db/pool');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, '../sql/add_hora_fin.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration from:', sqlPath);
        await pool.query(sql);
        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        // Forzar cierre ya que el pool puede mantenerse abierto
        process.exit(0);
    }
}

runMigration();
