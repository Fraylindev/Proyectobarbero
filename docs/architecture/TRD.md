# Technical Reference Document (TRD)

## Stack Tecnológico

El proyecto está dividido en dos aplicaciones principales usando una arquitectura cliente-servidor tradicional.

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management / Data Fetching**: React Query, Context API (Auth)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 12+ (Driver: `pg`)
- **Authentication**: JWT (JSON Web Tokens) con access token y refresh token.
- **Mailing**: `resend` (Reemplazando Nodemailer histórico)
- **Security**: Helmet (CSP), CORS, Bcrypt.

---

## Patrones Arquitectónicos

1. **MVC (Backend)**: Separación en Controllers (`controllers/`), Rutas (`routes/`) y Lógica de Datos. Las consultas a la BD se realizan generalmente dentro de los controladores, pero la lógica de terceros (emails) está extraída en `services/`.
2. **Component-Based Architecture (Frontend)**: División en `pages/` (Vistas completas) y `components/` (Fragmentos reutilizables, UI genérica y componentes específicos del dashboard).

## Gestión del Entorno
- La aplicación ha sido configurada como **White-Label**. El código evita hardcodeos ("Michael Barbershop").
- Los nombres, colores principales y URL se inyectan a través de variables de entorno `.env` tanto en backend como frontend (`VITE_BUSINESS_NAME`, `BUSINESS_NAME`, etc.).
