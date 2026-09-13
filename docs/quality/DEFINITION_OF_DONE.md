# Definition of Done (DoD)

Antes de que un Pull Request o Feature pueda considerarse "Terminado" y listo para producción, debe cumplir con los siguientes criterios:

## Código
- [ ] No existen `console.log` o `debugger` que expongan datos sensibles.
- [ ] El código pasa la revisión de ESLint o linter de turno.
- [ ] No se están incluyendo variables estáticas/hardcodeadas de nombres de negocios o contraseñas.

## Testing & Calidad
- [ ] Las funcionalidades principales (Booking flow, login) fueron probadas manualmente.
- [ ] Los casos borde de UI (campos vacíos, envíos duplicados) están manejados con Toast/Mensajes de error.

## Seguridad
- [ ] Ningún secreto nuevo fue commiteado (usar `.env.example`).
- [ ] Las nuevas rutas protegidas utilizan el middleware de autenticación (Ej. `requireAuth`).

## UX y UI
- [ ] Responsive Design verificado (Se ve bien en pantallas pequeñas).
- [ ] Los componentes nuevos siguen los lineamientos de Tailwind y colores estándar.
