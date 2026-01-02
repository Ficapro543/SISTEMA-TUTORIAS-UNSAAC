require('dotenv').config();
const { Client } = require('pg');

async function cleanAndSeed() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log("🧹 Cleaning database tables...");

        // Truncate tables with cascade to clear all data
        await client.query(`
        TRUNCATE TABLE 
            derivaciones, 
            tutorias, 
            cronogramas, 
            tutor_asignacion, 
            tutores, 
            estudiante, 
            refresh_tokens, 
            activation_tokens, 
            password_reset_tokens,
            users 
        CASCADE;
    `);

        console.log("✅ Database cleaned.");

        console.log("🌱 Inserting fresh seed data...");
        const fs = require('fs');
        const path = require('path');
        const seedSql = fs.readFileSync(path.join(__dirname, '../sql/seed_data.sql'), 'utf8');
        await client.query(seedSql);

        console.log("✅ Fresh seed data inserted successfully!");

    } catch (err) {
        console.error("❌ Operation failed:", err.message);
    } finally {
        await client.end();
    }
}

cleanAndSeed();
