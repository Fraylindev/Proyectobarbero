# 📝 API Reference

Esta documentación describe todos los endpoints disponibles en el backend de la aplicación Barbershop (White-Label). El backend está construido en **Node.js / Express** y todas las respuestas usan formato JSON.

## Base URL
En desarrollo: `http://localhost:5000/api`
En producción: Dependerá de tu variable `VITE_API_URL`.

---

## 🔒 Autenticación (`/auth`)

### Login (Unificado)
- **POST** `/auth/unified-login`
- **Body**: `{ "username": "admin", "password": "password123" }`
- **Response**: JWT Token + Refresh Token + Datos de usuario.

### Refresh Token
- **POST** `/auth/refresh`
- **Cookies requeridas**: `refreshToken` (HttpOnly).
- **Response**: Nuevo JWT Token.

### Logout
- **POST** `/auth/logout`
- **Response**: Limpia la cookie del refreshToken.

### Mi Perfil (Me)
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: Retorna la información del usuario autenticado actual.

---

## 💈 Profesionales (`/professionals`)

### Listar Profesionales (Público)
- **GET** `/professionals`
- **Response**: Lista de todos los profesionales activos.

### Detalle del Profesional (Público)
- **GET** `/professionals/:id`
- **Response**: Información completa de un profesional específico.

### Disponibilidad del Profesional (Público)
- **GET** `/professionals/:id/available-slots?date=YYYY-MM-DD`
- **Response**: Lista de franjas horarias (slots) disponibles para reservas en la fecha seleccionada.

### Actualizar Disponibilidad (Privado)
- **PUT** `/professionals/availability`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Body**: `{ "is_available": boolean }`
- **Response**: Actualiza el estado global de disponibilidad del profesional.

### Bloquear Horario Manualmente (Privado)
- **POST** `/professionals/block-time`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Body**: `{ "blocked_date": "YYYY-MM-DD", "start_time": "HH:MM", "end_time": "HH:MM", "reason": "Almuerzo" }`
- **Response**: Crea un bloqueo de horario para que los clientes no puedan reservar en esa franja.

---

## ✂️ Servicios (`/services`)

### Listar Servicios (Público)
- **GET** `/services`
- **Response**: Lista de servicios disponibles con sus precios estimados y duraciones.

### Detalle del Servicio (Público)
- **GET** `/services/:id`
- **Response**: Detalles de un servicio en particular.

---

## 📅 Reservas (`/bookings`)

### Crear Reserva (Público)
- **POST** `/bookings`
- **Body**: 
  ```json
  {
    "professional_id": "uuid",
    "service_id": "uuid",
    "client_name": "Nombre",
    "client_email": "correo@ejemplo.com",
    "client_phone": "18091234567",
    "booking_date": "YYYY-MM-DD",
    "booking_time": "HH:MM:SS"
  }
  ```
- **Response**: Crea la reserva en estado `PENDING` y envía email al profesional.

### Confirmar Reserva vía Email (Público - usa Token)
- **PUT** `/bookings/confirm/:token`
- **Response**: Cambia estado a `CONFIRMED` y notifica al cliente (Webhook usado por los links de los correos).

### Rechazar/Cancelar Reserva vía Email (Público - usa Token)
- **PUT** `/bookings/reject/:token`
- **Response**: Cambia estado a `CANCELLED` y notifica al cliente.

### Obtener mis Reservas (Privado)
- **GET** `/bookings/my-bookings`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: Lista de reservas filtradas por el profesional autenticado.

### Completar Reserva (Privado)
- **PUT** `/bookings/:id/complete`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Body**: `{ "amount": 500, "notes": "Pago en efectivo" }`
- **Response**: Cambia el estado a `COMPLETED` y registra el pago automáticamente.

### Cancelar Reserva manualmente (Privado)
- **PUT** `/bookings/:id/cancel`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: Cancela una reserva desde el dashboard del profesional.

---

## 💰 Pagos y Reportes (`/payments`)
*(Todos requieren `Authorization: Bearer <jwt_token>`)*

### Pagos de Hoy
- **GET** `/payments/today`
- **Response**: Sumatoria y lista de servicios completados en el día actual.

### Pagos del Mes
- **GET** `/payments/month`
- **Response**: Sumatoria de servicios completados en el mes en curso.

### Historial de Pagos
- **GET** `/payments/history`
- **Response**: Listado histórico paginado de todos los pagos registrados.

### Estadísticas Mensuales
- **GET** `/payments/monthly-stats`
- **Response**: Datos agregados por mes (útil para gráficos y proyección).
