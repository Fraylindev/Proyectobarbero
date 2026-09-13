# UI Patterns

Este documento describe patrones de diseño de interfaz usados en el proyecto.

## 1. Modales (Dialogs)
- **Fondo oscuro transparente** (Overlay) con `backdrop-blur`.
- **Botón de cierre (X)** en la esquina superior derecha o cancelar en el footer del modal.
- Siempre impedir el scroll del body cuando un modal está abierto.

## 2. Botones y Llamados a la Acción (CTAs)
- **Primarios**: Colores fuertes (Solid Primary Background) para acciones principales (ej: "Reservar Cita", "Iniciar Sesión").
- **Secundarios/Outline**: Para cancelar o acciones menos críticas.
- **Peligro (Danger)**: Rojos (`bg-red-500`) para acciones destructivas (Cancelar Reserva, Eliminar Bloqueo).

## 3. Empty States (Estados vacíos)
- En el dashboard, si el barbero no tiene citas hoy, en lugar de una tabla vacía mostrar:
  - Un icono amigable.
  - Un texto claro: "No tienes citas para hoy".
  - (Opcional) Sugerencia de acción.

## 4. Indicadores de Carga (Loading States)
- En páginas completas: Spinner centrado o Skeleton Loading (preferible Skeleton para tablas).
- En botones: Cambiar el texto a "Cargando..." o incluir un mini-spinner en el botón deshabilitándolo temporalmente.
