require('dotenv').config();
const pool = require('./src/db/pool');

async function check() {
    try {
        console.log('--- Estructura de refresh_tokens ---');
        const cols = await pool.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'refresh_tokens'");
        console.log(JSON.stringify(cols.rows, null, 2));

        console.log('\n--- Restricciones ---');
        const constraints = await pool.query("SELECT * FROM information_schema.table_constraints WHERE table_name = 'refresh_tokens'");
        console.log(JSON.stringify(constraints.rows, null, 2));

        console.log('\n--- Triggers ---');
        const triggers = await pool.query("SELECT * FROM information_schema.triggers WHERE event_object_table = 'refresh_tokens'");
        console.log(JSON.stringify(triggers.rows, null, 2));

        console.log('\n--- Probando inserción dummy ---');
        const userId = '293004a3-c2ac-411f-9594-f1342eacccc6';
        const token = 'test_' + Date.now();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const result = await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
            [userId, token, expiresAt]
        );
        console.log('✅ Inserción exitosa:', result.rows[0]);

    } catch (err) {
        console.error('❌ ERROR:', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            hint: err.hint,
            position: err.position
        });
    } finally {
        process.exit();
    }
}

check();
