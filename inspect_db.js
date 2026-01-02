const pool = require('./backend/src/db/pool');

async function inspectSchema() {
    try {
        console.log("Connecting...");
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log("Tables:", tables.rows.map(r => r.table_name));

        const columns = await pool.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            ORDER BY table_name, ordinal_position;
        `);
        console.log("Columns:", JSON.stringify(columns.rows, null, 2));

        pool.end();
    } catch (err) {
        console.error("Error:", err);
    }
}

inspectSchema();
