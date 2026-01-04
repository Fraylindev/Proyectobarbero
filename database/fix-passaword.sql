-- ============================================
-- FIX PASSWORD - Actualizar contraseña de Michael
-- ============================================

-- PASO 1: Genera el hash ejecutando en terminal:
--   node generate-hash.js barbero123
--
-- PASO 2: Copia el hash generado y reemplázalo abajo

-- Hash correcto para 'barbero123' (ejemplo - DEBES GENERAR EL TUYO)
-- Este hash es solo un ejemplo, NO lo uses tal cual
UPDATE professionals 
SET password_hash = '$2b$10$FAN4QLP65pZy1NowAKo0KuQAsWUdRQTQOf.ssKyRmXx6o.Vs0uuVK'
WHERE username = 'Fraylin';

-- PASO 3: Verificar que se actualizó
SELECT 
    username,
    name,
    email,
    role,
    LEFT(password_hash, 60) || '...' as password_hash_preview
FROM professionals 
WHERE username = 'dandiel';

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. El hash que ves arriba ($2b$10$92IXU...) es un EJEMPLO
-- 2. DEBES generar tu propio hash con: node generate-hash.js barbero123
-- 3. Cada vez que ejecutas bcrypt.hash(), genera un hash diferente (pero todos válidos)
-- 4. Por eso el hash en tu DB no coincide con ejemplos de internet

-- ============================================
-- ALTERNATIVA: Crear nuevo usuario desde cero
-- ============================================

-- Si prefieres, puedes crear un nuevo profesional:
-- (Reemplaza el hash con el generado por generate-hash.js)

/*
INSERT INTO professionals (
    name, 
    specialty, 
    description, 
    phone, 
    email, 
    username, 
    password_hash,
    role
) VALUES (
    'Michael García',
    'Especialista en degradados',
    'Más de 10 años de experiencia',
    '18091234567',
    'michael@michaelbarbershop.com',
    'michael',
    'PEGA_AQUI_TU_HASH_GENERADO',
    'PROFESSIONAL_ADMIN'
);
*/