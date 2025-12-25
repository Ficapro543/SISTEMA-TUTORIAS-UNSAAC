require('dotenv').config();
const pool = require('../src/db/pool');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    try {
        const sqlPath = path.join(__dirname, '../sql/create_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Running migration: create_tables.sql");
        await pool.query(sql);
        console.log("✅ Core tables created.");

    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        process.exit();
    }
}

runMigrations();
