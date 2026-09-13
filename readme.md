# 💈 Barbershop App - Sistema de Reservas White-Label

Sistema completo de gestión de reservas para barbería con dashboard profesional, diseñado para uso real en producción.

---

## 🎯 Características Principales

### Para Clientes (Sin Registro)
- ✅ Reserva de citas en 4 pasos simples
- ✅ Selección de profesional preferido
- ✅ Visualización de horarios disponibles en tiempo real
- ✅ Selección de servicios con precios
- ✅ Confirmación por email y WhatsApp
- ✅ Página pública profesional con galería

### Para Profesionales (Dashboard)
- ✅ Gestión completa de reservas (pendientes, confirmadas, completadas)
- ✅ Control de disponibilidad con toggle simple
- ✅ Vista de citas del día en tiempo real
- ✅ Contacto directo con clientes vía WhatsApp
- ✅ Registro automático de pagos al completar cita
- ✅ Reportes financieros (día, mes, histórico)
- ✅ Estadísticas de servicios más solicitados

---

## 🛠️ Stack Tecnológico

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Nodemailer (emails)
- Bcrypt (seguridad)

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- React Query
- Axios
- React Hot Toast

---

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone <url-del-repo>
cd barbershop-app
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
createdb barbershop_db

# Ejecutar schema
psql -d barbershop_db -f database/init.sql
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

**Variables críticas en `.env`:**
```env
DB_HOST=localhost
DB_NAME=barbershop_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password

JWT_SECRET=tu_secret_muy_largo_y_seguro

EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
```

**Para Gmail:** Genera una "App Password" en tu cuenta de Google.

### 4. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo .env
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

---

## 🚀 Ejecutar en Desarrollo

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
El servidor estará en `http://localhost:5000`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
La app estará en `http://localhost:3000`

---

## 👤 Crear Primer Usuario (Profesional)

### Opción 1: Manualmente con SQL

```sql
-- Generar hash de contraseña (usa bcrypt online o Node.js)
-- Ejemplo: para "barbero123" con 10 rounds

INSERT INTO professionals (
  name, 
  specialty, 
  description, 
  phone, 
  email, 
  username, 
  password_hash
) VALUES (
  'Admin Barbero',
  'Especialista en degradados',
  'Más de 10 años de experiencia',
  '18091234567',
  'admin@tu-dominio.com',
  'admin',
  '$2b$10$XYZ...' -- Reemplaza con tu hash
);
```

### Opción 2: Script Node.js

```javascript
// create-user.js
const bcrypt = require('bcryptjs  ');

const password = 'tu_password_aqui';
bcrypt.hash(password, 10, (err, hash) => {
  console.log('Hash:', hash);
});
```

Ejecutar:
```bash
node create-user.js
```

---

## 📧 Configuración de Email

### Gmail (Recomendado para desarrollo)

1. Ir a https://myaccount.google.com/apppasswords
2. Crear nueva "App Password"
3. Usar esa contraseña en `EMAIL_PASSWORD`

### Mailgun / SendGrid (Producción)

Cambiar en `.env`:
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=tu_usuario
EMAIL_PASSWORD=tu_api_key
```

---

## 🔐 Credenciales de Prueba

Después de crear tu primer usuario:

```
Usuario: admin
Contraseña: tu_password
```

Acceso: `http://localhost:3000/login`

---

## 📱 Integración WhatsApp

El sistema usa **WhatsApp Web Links** (sin API):

```javascript
https://wa.me/18091234567?text=Mensaje
```

**Ventajas:**
- ✅ Sin costo
- ✅ Funciona inmediatamente
- ✅ Abre WhatsApp automáticamente

**Para cambiar el número:**
1. Backend: `.env` → `WHATSAPP_BUSINESS_PHONE`
2. Frontend: Actualizar en `emailService.js`

---

## 🗄️ Estructura del Proyecto

```
barbershop-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── professionalController.js
│   │   ├── paymentController.js
│   │   └── serviceController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── professionalRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── serviceRoutes.js
│   ├── services/
│   │   └── emailService.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── public/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Hero.jsx
│   │   │   │   └── ProfessionalsSection.jsx
│   │   │   └── dashboard/
│   │   │       └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── BookingFlow.jsx
│   │   │   ├── BookingSuccess.jsx
│   │   │   ├── Login.jsx
│   │   │   └── dashboard/
│   │   │       ├── BookingsDashboard.jsx
│   │   │       ├── AvailabilityDashboard.jsx
│   │   │       └── PaymentsDashboard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
├── database/
│   └── init.sql
└── README.md
```

---

## 🔄 Flujos Principales

### Flujo de Reserva (Cliente)

1. Cliente visita página pública
2. Selecciona profesional → fecha → hora → servicio
3. Ingresa sus datos (nombre, email, teléfono)
4. Reserva se crea con estado **PENDING**
5. Email enviado al profesional con botones

### Flujo de Confirmación (Profesional)

1. Profesional recibe email con detalles
2. Click en "Confirmar" o "Rechazar"
3. Si confirma: estado → **CONFIRMED** + email al cliente
4. Cliente recibe confirmación con botón WhatsApp

### Flujo de Pago (Profesional)

1. Cliente llega a la cita
2. Profesional completa el servicio
3. Dashboard: Click "Completar" + ingresar monto
4. Estado → **COMPLETED**
5. Pago registrado automáticamente

---

## 🎨 Personalización

### Colores y Branding

Editar `tailwind.config.js`:

```javascript
colors: {
  primary: {
    600: '#tu-color-principal',
    // ...
  }
}
```

### Logo

Reemplazar en `Header.jsx`:
```jsx
<img src="/tu-logo.png" alt="Logo" />
```

### Información de Contacto

Editar en `Home.jsx` sección `#contact`

---

## 📊 API Endpoints

### Públicos (Sin Auth)

**Profesionales:**
```
GET    /api/professionals
GET    /api/professionals/:id
GET    /api/professionals/:id/available-slots?date=YYYY-MM-DD
```

**Servicios:**
```
GET    /api/services
GET    /api/services/:id
```

**Reservas:**
```
POST   /api/bookings
PUT    /api/bookings/confirm/:token
PUT    /api/bookings/reject/:token
```

### Protegidos (Requieren JWT)

**Auth:**
```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
```

**Reservas:**
```
GET    /api/bookings/my-bookings
PUT    /api/bookings/:id/complete
PUT    /api/bookings/:id/cancel
```

**Disponibilidad:**
```
PUT    /api/professionals/availability
POST   /api/professionals/block-time
```

**Pagos:**
```
GET    /api/payments/today
GET    /api/payments/month
GET    /api/payments/history
GET    /api/payments/monthly-stats
```

---

## 🚢 Deploy a Producción

### Backend (Railway / Render / Heroku)

1. Crear base de datos PostgreSQL en cloud
2. Configurar variables de entorno
3. Deploy del código backend
4. Ejecutar migraciones

### Frontend (Vercel / Netlify)

1. Build del proyecto:
```bash
npm run build
```

2. Configurar `VITE_API_URL` apuntando a backend

3. Deploy de carpeta `dist/`

---

## ✅ Checklist Pre-Producción

- [ ] Cambiar todos los secretos y passwords
- [ ] Configurar email production (Mailgun/SendGrid)
- [ ] Verificar variables de entorno
- [ ] Probar flujo completo de reserva
- [ ] Probar notificaciones por email
- [ ] Configurar dominio personalizado
- [ ] SSL/HTTPS habilitado
- [ ] Backup de base de datos configurado
- [ ] Rate limiting activado
- [ ] Logs y monitoring

---

## 🐛 Troubleshooting

### Error de conexión a DB
```bash
# Verificar que PostgreSQL esté corriendo
pg_isready

# Verificar credenciales en .env
```

### Emails no se envían
```bash
# Verificar configuración SMTP
# Para Gmail, usar App Password (no password normal)
```

### JWT Token expirado
```bash
# El sistema auto-refresca tokens
# Si falla, hacer logout y login nuevamente
```

### CORS errors
```bash
# Verificar CORS_ORIGIN en backend .env
# Debe coincidir con URL del frontend
```

---

## 📈 Próximas Funcionalidades (Roadmap)

- [ ] Panel de administrador central
- [ ] Múltiples barberías (SaaS)
- [ ] Chat interno en tiempo real
- [ ] Notificaciones push
- [ ] Pagos online (Stripe/PayPal)
- [ ] Calendario visual interactivo
- [ ] App móvil nativa
- [ ] Sistema de puntos/fidelidad
- [ ] Reviews y calificaciones

---

## 🤝 Soporte

Para problemas o preguntas:
- Email: soporte@tu-dominio.com
- WhatsApp: +1 809-123-4567

---

## 📄 Licencia

MIT License - Uso libre para proyectos comerciales y personales.

---

**Desarrollado con ❤️ - White Label Edition**