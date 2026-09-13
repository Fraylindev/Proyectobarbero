# Delivery Gates

Un Delivery Gate define el proceso paso a paso por el que pasa el código desde el equipo de desarrollo hasta los servidores en vivo de nuestros clientes.

## 1. Local Development Gate
- Cada desarrollador corre la app localmente.
- Deben levantar PostgreSQL con el `docker-compose.yml`.
- Requisito de pase: El código compila (`npm run build`) localmente sin errores en frontend y backend.

## 2. Staging / Review Gate
- Se despliega a un servidor de prueba (ej: Render, Vercel preview branches).
- La Base de Datos es de pruebas (nunca datos reales).
- Requisito de pase: QA o el Product Owner aprueba el comportamiento visual y los flujos en staging.

## 3. Production Gate
- Despliegue a la rama `main`.
- Rotación y verificación de variables de entorno (Secretos verdaderos de JWT y Resend).
- Post-Deployment: Verificar que el login y el agendamiento (haciendo una reserva falsa que luego se cancela) funcionen en el entorno en vivo.
