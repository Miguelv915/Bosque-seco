# Flujo de trabajo (workflow)

## Ramas

| Rama | Propósito |
|---|---|
| `main` | Siempre estable y desplegable. Solo se actualiza mediante Pull Request. |
| `develop` | Integración del trabajo en curso (opcional si el equipo es pequeño: puede trabajarse directo contra `main` con PR). |
| `feat/<tema>` | Nueva funcionalidad. Ej.: `feat/mapa-leaflet` |
| `fix/<tema>` | Corrección de errores. Ej.: `fix/selector-idioma` |
| `docs/<tema>` | Documentación. |
| `chore/<tema>` | Configuración, dependencias, tareas internas. |

Reglas: una rama por tarea, cortas y de vida breve; nadie hace push directo a `main`.

## Commits (Conventional Commits)

Formato: `tipo(ámbito): descripción corta en imperativo`

```text
feat(destinations): añadir mapa esquemático con radar
fix(i18n): corregir clave faltante en inglés
docs: describir el flujo de trabajo
chore(deps): instalar fuentes con fontsource
refactor(home): extraer Ticker del Hero
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `chore`.

## Pull Requests

1. Crear la rama desde `main` (o `develop`) actualizada.
2. Antes de abrir el PR: `npm run lint` y `npm run build` sin errores.
3. Completar la plantilla del PR (`.github/pull_request_template.md`).
4. Al menos **una revisión** de otra persona del equipo antes de fusionar.
5. Fusionar con *squash* o *merge* y borrar la rama.

## Integración y despliegue

```text
rama → Pull Request → CI (lint + build) → revisión → merge a main → Cloudflare publica
```

- **CI:** `.github/workflows/ci.yml` corre `npm ci`, `npm run lint`, `npm test` y `npm run build` en cada PR y en cada push a `main`.
- **Pruebas:** junto al código (`*.test.js`), con Vitest. La lógica pura va en `lib/` para poder probarla sin red ni Supabase. Toda clave nueva de i18n debe existir en `es.json` y `en.json`: una prueba lo verifica.
- **Protección de `main`** (GitHub → Settings → Branches): exigir Pull Request y que el CI pase antes de fusionar.
- **Despliegue:** Cloudflare publica `main` en producción y genera una previsualización por cada rama/PR.
  - Build: `npm run build` · salida: `dist` · variable `NODE_VERSION=20`.
  - Variables de entorno (en Cloudflare, no en el repo): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_WHATSAPP_URL`, `VITE_APP_URL`.
    - `VITE_WHATSAPP_URL`: WhatsApp de contacto, como enlace (`https://wa.me/51987654321`) o solo el número. Es público.
    - `VITE_APP_URL`: descarga de la app móvil. Vacío, el botón lleva a la sección que la presenta.
  - `public/_redirects` hace que las rutas de React Router funcionen al recargar.
  - Nunca cargar la *service role* ni tokens con prefijo `VITE_`: quedan incrustados en el JavaScript público.

## Convenciones de código

- **Estructura por módulo** en `src/features/<módulo>/{components,data,hooks,lib}`; lo reutilizable va en `src/components/shared`.
- **Textos solo en i18n** (`src/i18n/locales/es.json` y `en.json`): nunca texto fijo en componentes. Toda clave nueva se agrega en **ambos** idiomas.
- **Datos separados de la vista:** los datos no traducibles van en `data/`; los componentes solo los presentan.
- **Estilos:** CSS Modules por componente y variables globales en `src/styles/global.css`.
- **Componentes:** funciones pequeñas con una sola responsabilidad; lógica con estado en *hooks*.
- **Accesibilidad:** HTML semántico, `aria-label` en controles sin texto, foco visible.
- **Seguridad:** solo la clave *publishable* de Supabase en el cliente; jamás `service_role`. No subir `.env.local`.

## Base de datos compartida (Supabase)

- Una sola persona ejecuta migraciones (`supabase db push`).
- Los nombres de tablas y columnas se acuerdan con el equipo móvil (Flutter) antes de crearlos.
- Todo cambio de esquema se versiona en `supabase/migrations/` y pasa por PR.
