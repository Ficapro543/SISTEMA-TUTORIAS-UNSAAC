const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    console.log('Starting single migration run with SSL...');
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();

        const filePath = process.argv[2];
        if (!filePath) {
            throw new Error('No file path provided');
        }

        const sqlPath = path.resolve(process.cwd(), filePath);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing sql from:', sqlPath);
        await client.query(sql);
        console.log('Migration succeeded!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
