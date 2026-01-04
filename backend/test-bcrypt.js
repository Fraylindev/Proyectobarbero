/**
 * TEST DIRECTO DE BCRYPT
 * Prueba con el hash de tu base de datos
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

async function testBcrypt() {
  try {
    console.log('\n🧪 TEST DE BCRYPT\n');
    
    // Obtener hash de la DB
    const result = await pool.query(
      "SELECT username, password_hash FROM professionals WHERE username = 'Fraylin';"
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado en DB');
      process.exit(1);
    }

    const dbHash = result.rows[0].password_hash;
    console.log('Hash en DB:', dbHash);
    console.log('Longitud del hash:', dbHash.length);
    console.log('');

    // Probar con diferentes contraseñas
    const passwords = ['barbero123', 'Barbero123', 'BARBERO123', ''];
    const user = ['Fraylin'];

    for (const pwd of passwords) {
      console.log(`Probando: "${pwd}"`);
      const isMatch = await bcrypt.compare(pwd, dbHash);
      console.log(`Resultado: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      console.log('');
    }

    // Generar nuevo hash y comparar
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Generando nuevo hash para "barbero123"...');
    const newHash = await bcrypt.hash('barbero123', 10);
    console.log('Nuevo hash:', newHash);
    
    const testMatch = await bcrypt.compare('barbero123', newHash);
    console.log('Test con nuevo hash:', testMatch ? '✅ FUNCIONA' : '❌ NO FUNCIONA');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SOLUCIÓN:');
    console.log('Si el hash de la DB no funciona, ejecuta este UPDATE:');
    console.log('');
    console.log(`UPDATE professionals SET password_hash = '${newHash}' WHERE username = '${user}';`);
    console.log('');

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

testBcrypt();