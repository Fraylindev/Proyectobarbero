# Product Requirements Document (PRD)

## Visión del Producto
El sistema de Reservas de Barbería ("Barbershop App") es una plataforma web dual (Público + Dashboard) diseñada para que barberías y profesionales independientes puedan automatizar su agendamiento, manejo de disponibilidad y seguimiento de ganancias diarias.

## Usuarios (Personas)
1. **Cliente Final (Usuario Público)**
   - Quiere reservar una cita rápido sin tener que crear una cuenta o bajar una app.
   - Necesita confirmación y recordatorios por email/WhatsApp.
2. **Profesional (Barbero)**
   - Necesita visualizar su agenda diaria en tiempo real.
   - Quiere confirmar, cancelar o completar citas desde su celular o PC.
   - Quiere ver cuánto dinero ha ganado hoy y este mes.
3. **Administrador**
   - Crea cuentas para nuevos barberos.
   - Gestiona el negocio de forma global.

## Alcance del MVP (Fase Actual)
- Landing page pública con listado de barberos, servicios y galería de ejemplo.
- Flujo de reserva de 4 pasos sin registro para clientes.
- Sistema de confirmación vía Email (Tokens de un solo uso).
- Botones de contacto por WhatsApp.
- Dashboard de barberos (Protegido por JWT).
- Gestión de pagos (registro de `amount` cobrado al completar la cita).
- White-label (configurable mediante `.env`).

## Fuera de Alcance (MVP)
- Pasarela de pagos online (Stripe/PayPal) al momento de reservar.
- Aplicación móvil nativa en tiendas de apps (iOS/Android).
- Sistema de fidelización por puntos.
- Múltiples locales/sucursales para una misma cuenta (SaaS multi-tenant completo).
