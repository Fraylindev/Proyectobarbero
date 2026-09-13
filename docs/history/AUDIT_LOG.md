# Audit Log (Registro de Auditorías)

Este documento mantiene un registro cronológico de las auditorías de seguridad, incidentes y remediaciones ejecutadas en el repositorio.

## [2026-09-12] - Remediación y Aseguramiento Crítico (Incidente P0)

**Contexto**: El repositorio contenía el archivo `.env` expuesto con credenciales de la base de datos y la API de Resend. El historial de commits incluía este archivo así como scripts de debug (`fix-passaword.sql`, `gpt.js`) que contenían hashes de contraseñas y correos reales (ej. admin@...).

**Acciones Tomadas**:
1. **Limpieza del Historial (Git)**: Se ejecutó `git filter-branch --index-filter 'git rm -rf --cached --ignore-unmatch ...'` para remover permanentemente el archivo `.env` y el viejo `db_schema.sql` contaminado de toda la historia del repositorio. Se forzó un `git push --force --all`.
2. **Recreación de `.gitignore`**: Añadido `.env`, `node_modules/`, etc.
3. **Rotación de Secretos**:
   - Contraseña de BD PostgreSQL reemplazada.
   - API de Resend revocada/actualizada en `.env` local.
   - Generación de nuevos `JWT_SECRET` y `JWT_REFRESH_SECRET` usando crypto.
4. **Hardening de Código**:
   - Eliminados `console.log` que exponían el password plano y hashes durante el proceso de login en `auth_controller.js`.
   - Modificados errores 200 en bloques catch en `booking_controller.js` para usar status 500 reales.

**Autor**: Fraylin / Assistant
**Estado**: Completado y Cerrado. El repositorio está limpio.
