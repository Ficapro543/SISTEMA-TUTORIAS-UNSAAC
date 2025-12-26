const pool = require('../src/db/pool');

async function checkDB() {
    try {
        const res = await pool.query('SELECT * FROM pending_users');
        console.log('Pending Users:', res.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
