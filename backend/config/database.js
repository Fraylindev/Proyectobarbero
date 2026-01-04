const { Pool } = require('pg');
require('dotenv').config();

let sslConfig = false;

// Si existe DATABASE_URL y contiene "render.com", fuerza SSL
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')) {
  sslConfig = { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
  } else {
    console.log('✅ PostgreSQL conectado correctamente');
    console.log(`📅 Server time: ${res.rows[0].now}`);
  }
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.log('🔍 Query ejecutado:', { text, duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
};

const getClient = async () => {
  const client = await pool.connect();
  const release = client.release;

  const timeout = setTimeout(() => {
    console.error('⚠️ Cliente no liberado después de 5 segundos');
  }, 5000);

  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release.apply(client);
  };

  return client;
};

module.exports = {
  pool,
  query,
  getClient,
};
