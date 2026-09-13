# Product Standards

Principios de Producto para la aplicación Barbershop.

1. **Fricción Cero para el Cliente Final**
   - El cliente de una barbería rara vez quiere crear una cuenta y recordar contraseñas solo para cortarse el pelo. Por lo tanto, el flujo de reserva es 100% público usando únicamente Email y Teléfono.

2. **Mobile-First para Profesionales**
   - Los barberos usan la aplicación en el trabajo, usualmente desde su teléfono móvil.
   - El Dashboard y la vista de reservas del día deben estar totalmente optimizados para pantallas pequeñas (Botones grandes, tablas adaptativas a tarjetas o listas).

3. **White-Label Design**
   - El producto no debe tener colores, logos ni nombres quemados en el código.
   - Tailwind debe configurarse con colores genéricos (ej: `primary-500`, `secondary-500`) de modo que si un cliente quiere cambiar su tema a rojo, solo altere la paleta en el `tailwind.config.js`.

4. **Feedback Instantáneo**
   - Siempre usar Toast notifications (`react-hot-toast`) para acciones CRUD (creación de bloqueos, finalización de reservas, logins fallidos).
