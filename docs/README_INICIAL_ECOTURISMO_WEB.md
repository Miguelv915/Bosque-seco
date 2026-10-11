# Ecoturismo Web — Guía de inicialización

> MVP de hackathon: una aplicación **React + Vite** para el portal público y el panel administrativo, conectada a **Supabase Cloud**. En esta etapa solo preparamos la estructura; los módulos y componentes se implementarán después.

## 1. Requisitos

- VS Code y terminal PowerShell (Windows).
- Node.js LTS y npm instalados. Compruébalos con `node -v` y `npm -v`.
- Acceso como integrante al proyecto Supabase de tu equipo.
- Carpeta del proyecto web ya creada. **Ejecutar los comandos dentro de ella**.

## 2. Inicializar React en la carpeta existente

> El comando con `.` usa la carpeta actual. Recomendado para una carpeta vacía. Si ya contiene archivos importantes, respáldalos antes de aceptar sustituciones.

```powershell
npm create vite@latest . -- --template react
npm install
```

Instalar solo lo necesario para el esqueleto y la conexión:

```powershell
npm install react-router-dom @supabase/supabase-js lucide-react
```

Arrancar el servidor:

```powershell
npm run dev
```

Abrir la dirección mostrada en la terminal (normalmente `http://localhost:5173`).

## 3. Arquitectura de carpetas propuesta

```text
ecoturismo-web/
├── public/
├── src/
│   ├── app/
│   │   └── AppRouter.jsx           # Declaración de rutas
│   ├── layouts/
│   │   ├── PublicLayout.jsx        # Estructura web turística
│   │   └── AdminLayout.jsx         # Estructura panel administrativo
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LugaresPage.jsx
│   │   │   └── RutasPage.jsx
│   │   └── admin/
│   │       ├── LoginPage.jsx
│   │       └── DashboardPage.jsx
│   ├── components/
│   │   ├── shared/
│   │   ├── public/
│   │   └── admin/
│   ├── features/                   # Vacío por ahora: módulos futuros
│   ├── services/                   # Consultas de datos futuras
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── supabase/                       # Solo si habilitan CLI/migraciones
├── .env.local                      # Credenciales locales; no subir
├── .env.example                    # Nombres de variables sin secretos
├── .gitignore
├── package.json
└── README.md
```

Las carpetas vacías se pueden crear conforme hagan falta. No es necesario implementar componentes ni servicios todavía. **Web pública y admin son secciones de la misma app**.

## 4. Conectar React con Supabase Cloud

1. Entra a https://supabase.com/dashboard y selecciona el proyecto del equipo.
2. En **Connect** obtén la **Project URL** y la **publishable key**.
3. Crea `.env.local` en la raíz:

```dotenv
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE
```

4. Crea `src/lib/supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en .env.local');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
```

5. Reinicia `npm run dev` después de crear/cambiar variables de entorno.

**Seguridad:** `VITE_` se expone en el navegador. La clave publicable está diseñada para uso cliente con RLS configurado; **nunca** uses `service_role`, `secret key`, contraseña de base de datos ni tokens personales allí. No subas `.env.local` a GitHub. Confirma que `.gitignore` contiene `.env.local` o al menos `*.local`.

Puedes dejar un `.env.example` sin credenciales reales:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

## 5. Rutas previstas (sin implementar módulos)

| Ruta | Uso |
|---|---|
| `/` | Portada pública |
| `/lugares` | Catálogo público |
| `/rutas` | Rutas ecoturísticas |
| `/admin/login` | Acceso administrativo |
| `/admin` | Dashboard administrativo (protegido en la siguiente etapa) |

En `src/app/AppRouter.jsx` se configurará React Router. Por ahora basta con crear carpetas y archivos placeholder; **no considerar `/admin` seguro hasta implementar autenticación y autorización**. Las políticas RLS en Supabase deben impedir escrituras no autorizadas aunque alguien llame directamente a la API.

## 6. Opcional: administrar migraciones de Supabase desde VS Code

**No hace falta usar el CLI para conectar la web al servicio.** La conexión de React funciona solo con el SDK y las variables `VITE_`. El CLI es útil si la persona responsable de BD va a crear/versionar migraciones SQL.

En la raíz de `ecoturismo-web`, una sola persona responsable puede ejecutar:

```powershell
npx supabase init
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
```

El `project-ref` figura en la URL de Supabase Dashboard: `https://supabase.com/dashboard/project/TU_PROJECT_REF`.

Si la base de datos **ya tiene tablas creadas en Cloud**, antes de preparar nuevas migraciones, coordinar con el responsable y considerar:

```powershell
npx supabase db pull
```

Para aplicar migraciones revisadas al proyecto remoto:

```powershell
npx supabase db push --dry-run
npx supabase db push
```

**Atención:** `db push` modifica la base de datos compartida. No ejecutar migraciones simultáneamente desde varias PCs; acordar un responsable. No duplicar en migraciones nuevas las tablas que ya existen en Cloud.

## 7. Validación rápida de la instalación

- [ ] `node -v` y `npm -v` muestran versiones.
- [ ] `npm run dev` abre la aplicación React.
- [ ] Están instalados `react-router-dom`, `@supabase/supabase-js` y `lucide-react`.
- [ ] Existe `.env.local` con la URL y clave publicable del proyecto.
- [ ] Existe `src/lib/supabaseClient.js`.
- [ ] `.env.local` no se subirá a Git.
- [ ] QA y Flutter conocen los nombres de tablas y campos que se definirán después.

## 8. Próxima etapa, aún no implementada

1. Crear layouts público y administrativo.
2. Configurar las rutas de React Router.
3. Añadir autenticación de administradores y autorización respaldada por RLS.
4. Definir `lugares`, `rutas` y `puntos_interes` con el compañero de Flutter.
5. Implementar servicios, módulos y componentes progresivamente.

### Fuentes oficiales

- [Supabase con React](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase CLI y proyecto Cloud](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Vite — Getting Started](https://vite.dev/guide/)
