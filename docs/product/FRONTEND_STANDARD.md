# Frontend Standards

Normas de codificación para el frontend en React.

## Stack
- React 18, Vite.
- Tailwind CSS para el estilado.
- Lucide React para iconografía.

## Estructura de Componentes
- `components/common` o `components/public`: Elementos que se usan en múltiples páginas o en la landing (Headers, Footers, Modales base).
- `components/dashboard`: Componentes exclusivos de las áreas protegidas.
- `pages/`: Componentes que representan rutas en React Router DOM.
- `context/`: Para `AuthContext` o estados globales.

## Convenciones de Código
- **Functional Components**: Siempre utilizar componentes funcionales y Hooks.
- **Exportaciones**: Exportar por defecto (default export) en páginas completas (`pages/`).
- **Nomenclatura**: Nombres de archivos en PascalCase para componentes (ej: `ConfirmBooking.jsx`). Se pueden usar snake_case para páginas genéricas si el proyecto lo prefiere (ej: `home_page.jsx`), pero mantener consistencia dentro de la carpeta.
- **Tailwind**: Evitar clases en línea excesivas si se repiten; preferir la creación de pequeños componentes de UI (ej: `<Button />`) para reusar los estilos de Tailwind.

## Peticiones API
- Centralizar las peticiones en `src/services/api.js`.
- Utilizar `axios` pre-configurado para que inyecte el token JWT y maneje las llamadas al refresh token automáticamente.
