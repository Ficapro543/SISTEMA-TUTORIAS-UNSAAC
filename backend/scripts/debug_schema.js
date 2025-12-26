require('dotenv').config();
const pool = require('../src/db/pool');

async function debugSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log("Esquema de la tabla users:");
        res.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debugSchema();
