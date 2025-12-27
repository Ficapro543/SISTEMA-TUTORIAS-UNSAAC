const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL con SSL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL', err);
});

module.exports = pool;