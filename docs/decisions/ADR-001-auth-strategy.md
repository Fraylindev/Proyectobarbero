# ADR 001: Estrategia de Autenticación

**Status**: Aceptado
**Fecha**: 2026-09-12

## Contexto
El sistema necesita manejar el acceso de los profesionales y administradores a un dashboard privado para gestionar reservas, pagos y disponibilidad.

## Decisión
Se implementó un sistema de autenticación custom usando:
- **Bcrypt** para el hashing de contraseñas.
- **JWT (JSON Web Tokens)** para manejo de sesiones stateless.
- Implementación de **Access Token** (corta vida) y **Refresh Token** (larga vida, guardado en base de datos para revocación y en cookies HttpOnly en el cliente).

## Consecuencias
- **Positivas**: No dependemos de proveedores externos ni costos recurrentes para el auth. Control total sobre los JWT claims.
- **Negativas**: Mayor responsabilidad de seguridad sobre nuestro propio código, necesidad de auditorías constantes.
- **Futuro**: Está previsto en el Roadmap (Fase 4) una posible migración a **Clerk** o proveedores de identidad gestionados para reducir fricción técnica.
