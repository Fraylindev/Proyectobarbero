# Estándares de Seguridad

Normas inflexibles de seguridad que todo desarrollador en el equipo de Barbershop App debe seguir.

## 1. Secrets Management
- **JAMÁS** agregar un archivo `.env` o similar al control de versiones.
- Las contraseñas, URIs de bases de datos, claves de JWT o APIs (como Resend) siempre se extraen del entorno del sistema (`process.env`).
- Si se agrega un nuevo secreto, documentarlo de manera segura y agregar una clave vacía al `.env.example`.

## 2. Autenticación y Criptografía
- Nunca almacenar contraseñas en texto plano. Usar **Bcrypt** con mínimo 10 rounds de salt.
- Los tokens JWT deben tener un tiempo de expiración (ej: Access token = 1 día, Refresh = 7 días).
- Los "Tokens de confirmación" que se envían por correo deben ser únicos (UUIDs) y marcarse como `token_used = true` tras su primer uso.

## 3. Protección de API (Backend)
- Mantener activado **Helmet** (CSP) para prevenir ataques XSS.
- Configurar adecuadamente los **CORS** especificando el origen (`FRONTEND_URL`) en lugar de `*` en entornos de producción.

## 4. Sanitización
- Manejar errores de DB globalmente; nunca devolver los Stack Traces o los errores de la librería PostgreSQL al cliente. Envolver las llamadas a DB en try/catch y enviar status 500 y un mensaje genérico.
