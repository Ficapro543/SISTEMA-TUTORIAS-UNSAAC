require('dotenv').config();
const { Client } = require('pg');

async function createDatabase() {
    // Parse the current intended URL to extract credentials
    // Format: postgresql://user:pass@host:port/dbname
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("❌ No DATABASE_URL found in .env");
        process.exit(1);
    }

    // Dirty parsing to switch dbname to 'postgres'
    // We assume standard format.
    // We want to connect to 'postgres' database to create the new one.
    const urlParts = new URL(connectionString);
    const targetDbName = urlParts.pathname.split('/')[1]; // tutorias_db

    // Update pathname to postgres
    urlParts.pathname = "/postgres";
    const systemUrl = urlParts.toString();

    console.log(`Connecting to system DB to check/create '${targetDbName}'...`);

    const client = new Client({ connectionString: systemUrl });

    try {
        await client.connect();

        // Check if DB exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDbName]);
        if (res.rowCount === 0) {
            console.log(`Database '${targetDbName}' does not exist. Creating...`);
            // CREATE DATABASE cannot run in a transaction block, so we just run it.
            // Parameterized queries don't work for identifiers like DB name in CREATE DATABASE usually,
            // but strictly validating the name is good enough for a dev script.
            await client.query(`CREATE DATABASE "${targetDbName}"`);
            console.log(`✅ Database '${targetDbName}' created successfully.`);
        } else {
            console.log(`ℹ️ Database '${targetDbName}' already exists.`);
        }
    } catch (err) {
        console.error("❌ Error initializing database:", err.message);
    } finally {
        await client.end();
    }
}

createDatabase();
