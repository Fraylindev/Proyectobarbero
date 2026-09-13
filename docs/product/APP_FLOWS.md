# App Flows (Flujos de la Aplicación)

Este documento mapea el comportamiento principal esperado de la plataforma.

## 1. Flujo de Reserva (Cliente Público)
1. **Punto de Entrada**: Cliente visita la landing page principal (`/`).
2. **Selección**: Elige un barbero de la lista.
3. **Calendario**: El sistema muestra los días de trabajo (según `availability_schedule`) y los bloques vacíos restando las `bookings` existentes y los `blocked_times`.
4. **Servicio**: Cliente selecciona corte clásico, barba, etc.
5. **Formulario**: Cliente ingresa `Nombre`, `Email`, `Teléfono`.
6. **Submit**: Se crea la reserva con status `PENDING`.
7. **Email al Profesional**: El barbero recibe un email (Resend) con botones de acción (Confirmar/Rechazar) y un link al WhatsApp del cliente.

## 2. Flujo de Aprobación (Profesional vía Email)
1. Barbero hace clic en "✅ Confirmar Cita" en el correo.
2. Es redirigido al frontend público (`/confirm/:token`).
3. El frontend llama al backend. Si el token es válido, se cambia estado a `CONFIRMED`.
4. **Email al Cliente**: El cliente recibe un correo diciendo "Tu cita está confirmada" junto con el WhatsApp del barbero.

## 3. Flujo de Completado y Pago (Dashboard)
1. Barbero ingresa a `/login` con sus credenciales.
2. En la pestaña de citas del día (`/dashboard`), ve la cita `CONFIRMED`.
3. El cliente llega y es atendido.
4. El barbero pulsa el botón "Completar".
5. Se abre un modal solicitando el `Monto cobrado` (amount).
6. Al confirmar, la cita pasa a estado `COMPLETED` y se genera un registro en la tabla `payments`.
7. El dashboard financiero (`/dashboard/payments`) se actualiza reflejando la ganancia.
