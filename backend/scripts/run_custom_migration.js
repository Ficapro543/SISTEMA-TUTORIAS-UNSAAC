const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    try {
        const filePath = process.argv[2];
        if (!filePath) {
            console.error('Please provide the path to the SQL file relative to project root.');
            process.exit(1);
        }

        const sqlPath = path.resolve(process.cwd(), filePath);

        if (!fs.existsSync(sqlPath)) {
            console.error('File not found:', sqlPath);
            process.exit(1);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration from:', sqlPath);
        await pool.query(sql);
        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
