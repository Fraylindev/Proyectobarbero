# ADR 003: White-Label Architecture

**Status**: Aceptado
**Fecha**: 2026-09-12

## Contexto
Inicialmente la aplicación contenía textos estáticos y hardcodeados referentes a un único cliente ("Michael Barbershop"). A medida que el proyecto escala, se planea vender o desplegar este SaaS a múltiples barberías o negocios.

## Decisión
Refactorizar el proyecto para que soporte **White-Labeling**.
- **Frontend**: Se extraerán textos estáticos y nombres a `import.meta.env.VITE_BUSINESS_NAME`.
- **Backend**: Los emails transaccionales usarán `process.env.BUSINESS_NAME`.
- **Repositorio**: Se eliminarán los correos, hashes reales y secretos hardcodeados del repositorio para garantizar privacidad y seguridad al clonar.

## Consecuencias
- **Positivas**: Posibilidad de desplegar N instancias del proyecto simplemente cambiando el archivo `.env`. El proyecto puede open-sourcearse de manera segura.
- **Negativas**: Aumento ligero de la complejidad (tener que setear múltiples variables para que la app luzca bien).
