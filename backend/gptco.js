/**
 * VERIFICACIÓN FINAL DE HASHES BCRYPT (PRODUCCIÓN READY)
 * - No rompe hashes válidos
 * - Detecta hashes truncados o corruptos
 * - Verifica bcrypt.compare REAL
 * - Corrige solo lo necesario
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Valida formato bcrypt
function isValidBcryptFormat(hash) {
  return (
    typeof hash === 'string' &&
    hash.length === 60 &&
    /^\$2[aby]\$\d{2}\$/.test(hash)
  );
}

async function verifyAndFixHashes() {
  console.log('\n🧪 VERIFICACIÓN FINAL DE HASHES BCRYPT\n');

  const { rows: users } = await pool.query(
    'SELECT username, password_hash FROM professionals'
  );

  if (users.length === 0) {
    console.log('❌ No hay usuarios en la base de datos');
    process.exit(1);
  }

  for (const user of users) {
    const { username, password_hash } = user;

    console.log(`👤 Usuario: ${username}`);
    console.log(`- Hash: ${password_hash}`);
    console.log(`- Longitud: ${password_hash?.length}`);

    let needsFix = false;

    // 1️⃣ Validar formato
    if (!isValidBcryptFormat(password_hash)) {
      needsFix = true;
      console.log('⚠️ Hash con formato inválido');
    } else {
      // 2️⃣ Test real bcrypt (con try/catch)
      try {
        await bcrypt.compare('test_dummy_password', password_hash);
        console.log('✅ Hash válido y compatible con bcrypt');
      } catch {
        needsFix = true;
        console.log('⚠️ Hash corrupto (bcrypt.compare falló)');
      }
    }

    // 3️⃣ Corregir solo si es necesario
    if (needsFix) {
      const tempPassword = 'ResetSeguro123!';
      const newHash = await bcrypt.hash(tempPassword, 10);

      await pool.query(
        'UPDATE professionals SET password_hash = $1 WHERE username = $2',
        [newHash, username]
      );

      console.log('🔧 HASH CORREGIDO');
      console.log(`- Nuevo hash: ${newHash}`);
      console.log(`- Password temporal: "${tempPassword}"`);
    }

    console.log('──────────────────────────────────\n');
  }

  console.log('✅ VERIFICACIÓN COMPLETA FINALIZADA');
  await pool.end();
}

// Ejecutar
verifyAndFixHashes().catch(err => {
  console.error('❌ ERROR CRÍTICO:', err);
  process.exit(1);
});
