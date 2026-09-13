# Auditoría y Estabilización

Este documento registra los problemas conocidos y puntos a revisar durante la fase de auditoría del proyecto.

## 🐞 Errores Identificados (Pendientes de Revisión)

1. **Error de carga infinita en Home**: Al entrar a la aplicación, aparece un pop-up o mensaje en bucle indicando "Problemas cargando profesionales". Posiblemente un error en el fetch inicial o problemas de CORS/ruta en la API.
2. **Fallo en Login de Panel**: No permite iniciar sesión en el panel de administrador a pesar de colocar las credenciales correctas. Puede deberse a un problema con el cifrado/descifrado de bcrypt, error en el token JWT o rutas no actualizadas.

## 📝 Siguientes Pasos

### 1. Resolución de Bugs Core
- Revisar los logs del backend durante el intento de inicio de sesión.
- Inspeccionar la consola del navegador en la vista pública para rastrear la falla al cargar los profesionales.

### 2. Estructuración de Documentos de Control y Contexto
Crear la estructura base de documentación técnica (basado en estándares de proyectos anteriores). Se irán creando y llenando conforme se disponga de la información:

**📁 docs/architecture**
- [ ] `DATA_MODEL.md`
- [ ] `TRD.md`

**📁 docs/decisions**
- [ ] `ADR-001-authentication-strategy.md`
- [ ] `ADR-002-infraestructura-docker.md`

**📁 docs/features**
- [ ] `FEATURE_BRIEF_TEMPLATE.md`
- [ ] (Y briefs específicos según funcionalidades)

**📁 docs/product**
- [ ] `PRD.md`
- [ ] `APP_FLOWS.md`
- [ ] `FRONTEND_STANDARD.md`
- [ ] `PRODUCT_STANDARD.md`
- [ ] `UI_PATTERNS.md`

**📁 docs/quality**
- [ ] `DEFINITION_OF_DONE.md`
- [ ] `DELIVERY_GATES.md`
- [ ] `SECURITY_STANDARD.md`

**📁 docs/history**
- [ ] (Logs de auditoría y cambios mayores)
