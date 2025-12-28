const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? {rejectUnauthorized: false}
    : false,
  
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('connect', () => {
  if(process.env.NODE_ENV === 'development')
    console.log('✅ Nueva conexion a PostgreSQL creada');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL', err);
});

module.exports = pool;