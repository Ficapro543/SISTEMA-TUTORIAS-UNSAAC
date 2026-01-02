require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
        console.error("❌ No DATABASE_URL found in .env");
        process.exit(1);
    }

    // Parse URL to get database name
    const urlParts = new URL(connectionString);
    const targetDbName = urlParts.pathname.split('/')[1];
    
    // Connect to postgres database to create target database
    urlParts.pathname = "/postgres";
    const systemUrl = urlParts.toString();
    
    console.log(`\n🔧 Step 1: Connecting to system database...`);
    const systemClient = new Client({ connectionString: systemUrl });
    
    try {
        await systemClient.connect();
        
        // Check if database exists
        const res = await systemClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`, 
            [targetDbName]
        );
        
        if (res.rowCount === 0) {
            console.log(`📦 Creating database '${targetDbName}'...`);
            await systemClient.query(`CREATE DATABASE "${targetDbName}"`);
            console.log(`✅ Database '${targetDbName}' created successfully.`);
        } else {
            console.log(`ℹ️  Database '${targetDbName}' already exists.`);
        }
        
        await systemClient.end();
        
        // Now connect to the target database to create tables
        console.log(`\n🔧 Step 2: Connecting to '${targetDbName}' database...`);
        const dbClient = new Client({ connectionString });
        await dbClient.connect();
        
        // Read and execute create_tables.sql
        console.log(`📋 Step 3: Creating tables...`);
        const createTablesSQL = fs.readFileSync(
            path.join(__dirname, '../sql/create_tables.sql'),
            'utf8'
        );
        await dbClient.query(createTablesSQL);
        console.log(`✅ Tables created successfully.`);
        
        // Read and execute seed_data.sql
        console.log(`\n🌱 Step 4: Seeding initial data...`);
        const seedDataSQL = fs.readFileSync(
            path.join(__dirname, '../sql/seed_data.sql'),
            'utf8'
        );
        await dbClient.query(seedDataSQL);
        console.log(`✅ Seed data inserted successfully.`);
        
        console.log(`\n✨ Database setup completed successfully!`);
        console.log(`\n📝 You can now login with:`);
        console.log(`   Email: admin@unsaac.edu.pe`);
        console.log(`   Password: Admin123!`);
        
        await dbClient.end();
        
    } catch (err) {
        console.error("\n❌ Error setting up database:", err.message);
        console.error(err);
        process.exit(1);
    }
}

setupDatabase();
