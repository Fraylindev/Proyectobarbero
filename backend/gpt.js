/**
 * TEST COMPLETO DE BCRYPT PARA DB
 * 1️⃣ Verifica hash existente
 * 2️⃣ Prueba varias contraseñas
 * 3️⃣ Genera y actualiza hash si está truncado
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testBcrypt(username, testPasswords) {
  try {
    console.log('\n🧪 INICIANDO TEST DE BCRYPT\n');

    // Obtener hash de la DB
    const result = await pool.query(
      'SELECT username, password_hash FROM professionals WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Usuario "${username}" no encontrado en DB`);
      process.exit(1);
    }

    let dbHash = result.rows[0].password_hash;
    console.log('Hash en DB:', dbHash);
    console.log('Longitud del hash:', dbHash.length);

    // Verificar longitud
    if (dbHash.length !== 60) {
      console.log('\n⚠️ Hash incorrecto, generando uno nuevo de 60 caracteres...');
      const newHash = await bcrypt.hash(testPasswords[0], 10); // usar primera contraseña como base
      dbHash = newHash;

      // Actualizar DB
      await pool.query(
        'UPDATE professionals SET password_hash = $1 WHERE username = $2',
        [newHash, username]
      );

      console.log('✅ Hash actualizado en DB:', newHash);
      console.log('Longitud del nuevo hash:', newHash.length);
    }

    console.log('\n🔑 Probando contraseñas:');
    for (const pwd of testPasswords) {
      const isMatch = await bcrypt.compare(pwd, dbHash);
      console.log(`- "${pwd}" → ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }

    console.log('\n🧪 TEST FINALIZADO');
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

// USO:
const usernameToTest = 'Fraylin';
const passwordsToTry = ['barbero123', 'Barbero123', 'BARBERO123', '']; // puedes agregar más
testBcrypt(usernameToTest, passwordsToTry);
