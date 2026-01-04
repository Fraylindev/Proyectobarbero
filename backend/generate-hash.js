/**
 * SCRIPT PARA GENERAR HASH DE CONTRASEÑA
 * Uso: node generate-hash.js <contraseña>
 */

const bcrypt = require('bcrypt');

const password = process.argv[2] || 'barbero123';

bcrypt.hash(password, 10, (error, hash) => {
  if (error) {
    console.error('❌ Error generando hash:', error);
    process.exit(1);
  }
  
  console.log('\n✅ Hash generado exitosamente:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Password: ${password}`);
  console.log(`Hash:     ${hash}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Copia el hash y úsalo en tu SQL UPDATE:');
  console.log(`\nUPDATE professionals SET password_hash = '${hash}' WHERE username = 'dandiel';\n`);
  
  // Verificar que el hash funciona
  bcrypt.compare(password, hash, (err, result) => {
    if (result) {
      console.log('✅ Verificación: El hash es válido\n');
    } else {
      console.log('❌ Verificación: Error en el hash\n');
    }
  });
});