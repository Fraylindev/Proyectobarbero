# Guía de Despliegue White-Label

El sistema Barbershop App está diseñado para ser desplegado como una solución de "Marca Blanca". Esto significa que con el mismo código base, puedes lanzar N barberías distintas simplemente cambiando sus variables de entorno.

## Pre-requisitos de Despliegue
- Servidor para Frontend (Vercel, Netlify, Cloudflare Pages).
- Servidor para Backend (Render, Railway, Heroku, VPS).
- Base de datos PostgreSQL alojada (Supabase, Render DB, RDS).
- Cuenta en Resend para el envío de correos.

## Pasos para el Despliegue

### 1. Variables Críticas (White-Label)
Dependiendo del negocio que vas a lanzar, ajusta estos valores en tu servidor.

**Backend (`.env`)**:
```env
# El nombre de la Barbería, aparecerá en Asuntos de email y textos transaccionales
BUSINESS_NAME="Barbería Los Muchachos"

# La base de datos y credenciales específicas de este cliente
DATABASE_URL=postgresql://user:pass@host/db_muchachos

# Claves Únicas por cliente
JWT_SECRET=generado_unico
JWT_REFRESH_SECRET=generado_unico

# Dominio del cliente
FRONTEND_URL=https://losmuchachosbarbershop.com
```

**Frontend (`.env`)**:
```env
VITE_BUSINESS_NAME="Barbería Los Muchachos"
VITE_API_URL=https://api.losmuchachosbarbershop.com/api
```

### 2. Branding y Colores (Opcional por Cliente)
Si quieres que cada cliente tenga colores distintos:
1. Clona el proyecto.
2. Abre `frontend/tailwind.config.js`.
3. Cambia la paleta `primary` a los colores del logo de este negocio particular.
4. Reemplaza `scissors.svg` y cualquier logo del cliente en la carpeta `frontend/public/`.
5. Ejecuta `npm run build` y despliega la carpeta `dist/`.

### 3. Migración de DB e Inicio
Una vez desplegado el Backend y DB:
1. Conéctate a la DB en la nube.
2. Ejecuta el archivo `database/db_schema.sql` (que ahora viene con datos de prueba genéricos `admin@tu-dominio.com`).
3. Inicia sesión en el panel de administrador y cambia las contraseñas.
