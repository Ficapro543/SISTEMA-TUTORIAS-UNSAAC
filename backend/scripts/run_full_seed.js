require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSeed() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log("🌱 Inserting full seed data...");

        const seedSql = fs.readFileSync(path.join(__dirname, '../sql/seed_data.sql'), 'utf8');
        await client.query(seedSql);

        console.log("✅ Seed data inserted successfully!");
    } catch (err) {
        console.error("❌ Seed failed:", err.message);
    } finally {
        await client.end();
    }
}

runSeed();
