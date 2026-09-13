# ADR 002: Infraestructura con Docker

**Status**: Aceptado

## Contexto
El desarrollo y despliegue del proyecto requiere de una base de datos PostgreSQL y un entorno para el backend, los cuales pueden tener fricciones por diferentes SO de desarrollo.

## Decisión
Utilizar `docker-compose.yml` para orquestar la infraestructura local (y potencialmente producción). 
- El contenedor expone el puerto estándar o configurado (ej: 5434).
- Persistencia de datos configurada a través de volúmenes de Docker (`barbershop_pgdata`).

## Consecuencias
- **Positivas**: Entorno determinista. Cualquiera puede levantar la BD con un solo comando (`docker-compose up -d`).
- **Negativas**: Curva de aprendizaje para quienes no usan Docker. La rotación de contraseñas locales requiere destruir volúmenes o comandos de `psql` dentro del contenedor.
