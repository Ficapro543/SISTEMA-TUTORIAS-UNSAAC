const fs = require('fs');
const path = require('path');
// Usar el pool existente que ya está configurado correctamente
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
        // No cerramos el pool porque es compartido, pero en un script one-off está bien forzar exit
        process.exit(0);
    }
}

runMigration();
