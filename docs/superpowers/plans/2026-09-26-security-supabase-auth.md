# Seguridad del Panel Admin — Supabase Auth + Security Headers

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Proteger el Panel Admin de `presencia-web` con autenticación Supabase Auth via Magic Link y agregar cabeceras de seguridad HTTP para todo el sitio.

**Architecture:** Un middleware de Astro (`src/middleware.ts`) intercepta toda petición a `/admin/*` y `/api/admin/*`, valida la sesión con `@supabase/ssr`, y redirige a `/admin/login` si no existe sesión activa. La página `/admin/login` envía un Magic Link por email al propietario del negocio. Los Security Headers se definen en `public/_headers` y Cloudflare Pages los inyecta automáticamente en cada respuesta HTTP.

**Tech Stack:** Astro 4.x · `@astrojs/cloudflare` · `@supabase/ssr` (nuevo) · `@supabase/supabase-js` (existente) · Cloudflare Pages `_headers`

**Spec:** `_bmad-output/planning-artifacts/architecture/architecture-presencia-web-2026-09-25/ARCHITECTURE-SPINE.md` (AD-11, AD-12)

## Global Constraints

- Astro `output: 'hybrid'` — toda ruta admin declara `export const prerender = false`
- `SUPABASE_SERVICE_ROLE_KEY` solo en endpoints server-side de datos (`/api/admin/*`)
- `SUPABASE_URL` y `SUPABASE_ANON_KEY` son los únicos secrets necesarios para Auth
- Variable `PUBLIC_SKIP_AUTH=true` en `.env.local` desactiva el guard en desarrollo local
- Fuentes tipográficas: Italiana (headings) + Raleway (body)
- Colores de marca: `primary: #2b4c3b`, `secondary: #f5f3e9`
- Runtime: Cloudflare Workers — no usar APIs de Node.js (sin `fs`, sin `crypto.randomBytes`, etc.)
- Package manager: `npm`

---

## File Map

```text
presencia-web/
├── src/
│   ├── middleware.ts                        # NUEVO: Guard de autenticación (intercepta /admin/*)
│   ├── lib/
│   │   └── supabase.ts                      # NUEVO: Factory para cliente Supabase SSR
│   └── pages/
│       └── admin/
│           ├── login.astro                  # NUEVO: Página de Magic Link login
│           ├── auth-callback.astro          # NUEVO: Callback de confirmación del Magic Link
│           └── index.astro                  # MODIFICAR: Agregar botón de logout
├── public/
│   └── _headers                             # NUEVO: Security Headers para Cloudflare Pages
└── .env.local                               # MODIFICAR: Agregar SUPABASE_ANON_KEY y PUBLIC_SKIP_AUTH
```

---

## Tasks

### Task 1: Instalar `@supabase/ssr` y crear el cliente SSR

**Files:**
- Modify: `package.json` (npm install)
- Create: `src/lib/supabase.ts`
- Modify: `.env.local`

**Interfaces:**
- Produces:
  - `createSupabaseServerClient(cookies: AstroCookies): SupabaseClient` — función importable desde `'../lib/supabase'`
  - Variable de entorno: `SUPABASE_ANON_KEY` (string)

- [ ] **Step 1: Instalar el paquete `@supabase/ssr`**

```bash
npm install @supabase/ssr
```

Verificar que aparezca en `package.json` bajo `dependencies`.

- [ ] **Step 2: Agregar `SUPABASE_ANON_KEY` al `.env.local`**

Abre el panel de Supabase en https://supabase.com/dashboard → tu proyecto → Settings → API.
Copia el valor de **"anon public"** y agrégalo a `.env.local`:

```env
SUPABASE_URL=https://ugsoaousrkmhusfkskhm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
SUPABASE_ANON_KEY=<pega-aqui-el-anon-key>
PUBLIC_SKIP_AUTH=true
```

> **IMPORTANTE:** `PUBLIC_SKIP_AUTH=true` desactiva el guard en desarrollo local — quitar en producción.

- [ ] **Step 3: Crear `src/lib/supabase.ts`**

```ts
// src/lib/supabase.ts
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function createSupabaseServerClient(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookieHeader = cookies.toString();
          return parseCookieHeader(cookieHeader);
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: true,
              sameSite: 'lax',
            });
          });
        },
      },
    }
  );
}
```

- [ ] **Step 4: Verificar que el build sigue pasando**

```bash
npm run build
```

Esperado: `Server built in X.XXs` sin errores TypeScript.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase.ts .env.local package.json package-lock.json
git commit -m "feat(auth): install @supabase/ssr and add SSR client factory"
```

---

### Task 2: Middleware Astro — Guard de autenticación

**Files:**
- Create: `src/middleware.ts`

**Interfaces:**
- Consumes: `createSupabaseServerClient(cookies)` de `./lib/supabase`
- Produces: Middleware de Astro que protege `/admin/*` y `/api/admin/*`; redirige a `/admin/login` o responde 401 según el tipo de ruta.

- [ ] **Step 1: Crear `src/middleware.ts`**

```ts
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase';

const ADMIN_ROUTES = /^\/admin(\/|$)/;
const API_ADMIN_ROUTES = /^\/api\/admin(\/|$)/;

// Rutas públicas dentro de /admin que no requieren sesión
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/auth-callback'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Saltar guard en desarrollo local cuando PUBLIC_SKIP_AUTH=true
  if (import.meta.env.PUBLIC_SKIP_AUTH === 'true') {
    return next();
  }

  // Solo actúa en rutas /admin/* y /api/admin/*
  const isAdminRoute = ADMIN_ROUTES.test(pathname);
  const isApiAdminRoute = API_ADMIN_ROUTES.test(pathname);

  if (!isAdminRoute && !isApiAdminRoute) {
    return next();
  }

  // Rutas públicas de autenticación no necesitan guard
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return next();
  }

  // Validar sesión
  const supabase = createSupabaseServerClient(context.cookies);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // API routes responden 401 JSON
    if (isApiAdminRoute) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Admin pages redirigen al login
    return context.redirect('/admin/login');
  }

  return next();
});
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: Build completo sin errores. El middleware se compila como parte del bundle de Workers.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): add Astro middleware guard for /admin/* routes using Supabase session"
```

---

### Task 3: Página de Login — Magic Link

**Files:**
- Create: `src/pages/admin/login.astro`

**Interfaces:**
- Consumes: `createSupabaseServerClient(cookies)` de `../../lib/supabase` para detectar sesión activa y enviar el Magic Link.
- Produces: Ruta `GET /admin/login` (formulario de email) y `POST /admin/login` (envía Magic Link via `supabase.auth.signInWithOtp`).

- [ ] **Step 1: Crear `src/pages/admin/login.astro`**

```astro
---
// src/pages/admin/login.astro
export const prerender = false;

import { createSupabaseServerClient } from '../../lib/supabase';

const supabase = createSupabaseServerClient(Astro.cookies);

// Si ya hay sesión activa, redirigir al panel
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  return Astro.redirect('/admin/');
}

let message = '';
let error = '';

// Manejar POST: enviar Magic Link
if (Astro.request.method === 'POST') {
  const form = await Astro.request.formData();
  const email = form.get('email')?.toString().trim() ?? '';

  if (!email || !email.includes('@')) {
    error = 'Ingresa un email válido.';
  } else {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${Astro.url.origin}/admin/auth-callback`,
        shouldCreateUser: false,  // Solo usuarios ya registrados en Supabase Auth
      },
    });

    if (otpError) {
      error = 'No se pudo enviar el enlace. Verifica que el email esté registrado.';
    } else {
      message = `Enlace mágico enviado a ${email}. Revisa tu bandeja de entrada.`;
    }
  }
}
---
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Acceso Admin · Flores en Paz</title>
  <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Raleway:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script is:inline>
    tailwind.config = {
      theme: {
        extend: {
          colors: { primary: '#2b4c3b', secondary: '#f5f3e9' },
          fontFamily: { heading: ['Italiana', 'serif'], body: ['Raleway', 'sans-serif'] }
        }
      }
    }
  </script>
</head>
<body class="bg-secondary text-primary font-body min-h-screen flex items-center justify-center p-6">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <h1 class="font-heading text-4xl font-bold tracking-wide mb-2">FLORES EN PAZ</h1>
      <p class="text-sm opacity-70">Acceso exclusivo al Panel de Administración</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-primary/10 p-8">
      {error && (
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div class="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          {message}
        </div>
      )}

      {!message && (
        <form method="POST" class="space-y-5">
          <div>
            <label class="block text-sm font-bold mb-2">Email de acceso</label>
            <input
              type="email"
              name="email"
              placeholder="tucorreo@ejemplo.com"
              required
              class="w-full p-3 border border-primary/20 rounded-xl text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-sm"
          >
            Enviar Enlace Mágico
          </button>
        </form>
      )}

      {message && (
        <div class="text-center text-sm opacity-70 mt-4">
          <p>El enlace expira en 1 hora.</p>
          <button onclick="location.reload()" class="mt-3 text-primary underline text-sm">
            Enviar de nuevo
          </button>
        </div>
      )}
    </div>

    <p class="text-center text-xs opacity-50 mt-6">
      Solo administradores autorizados pueden acceder.
    </p>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: Build limpio. La ruta `/admin/login` aparece como endpoint SSR en el bundle.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/login.astro
git commit -m "feat(auth): add /admin/login page with Supabase Magic Link flow"
```

---

### Task 4: Callback de autenticación — Exchange del token

**Files:**
- Create: `src/pages/admin/auth-callback.astro`

**Interfaces:**
- Consumes: URL params `?code=...` enviados por Supabase en el redirect del Magic Link. `createSupabaseServerClient(cookies)` para intercambiar el code por sesión.
- Produces: Ruta `GET /admin/auth-callback` que completa el handshake OAuth y redirige a `/admin/` con sesión activa.

- [ ] **Step 1: Crear `src/pages/admin/auth-callback.astro`**

```astro
---
// src/pages/admin/auth-callback.astro
export const prerender = false;

import { createSupabaseServerClient } from '../../lib/supabase';

const code = Astro.url.searchParams.get('code');
const error_description = Astro.url.searchParams.get('error_description');

if (error_description) {
  return Astro.redirect(`/admin/login?error=${encodeURIComponent(error_description)}`);
}

if (!code) {
  return Astro.redirect('/admin/login');
}

const supabase = createSupabaseServerClient(Astro.cookies);
const { error } = await supabase.auth.exchangeCodeForSession(code);

if (error) {
  return Astro.redirect('/admin/login');
}

return Astro.redirect('/admin/');
---
```

- [ ] **Step 2: Habilitar PKCE en Supabase Dashboard**

Ir a Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `http://localhost:4321` (para dev local)
- **Redirect URLs:** agrega `http://localhost:4321/admin/auth-callback` y `https://presencia-website.pages.dev/admin/auth-callback` (tu URL de producción).

> Sin esta configuración, el Magic Link no redirige correctamente y el callback fallará.

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Esperado: Build limpio sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/auth-callback.astro
git commit -m "feat(auth): add /admin/auth-callback for Supabase Magic Link token exchange"
```

---

### Task 5: Logout — Botón de cierre de sesión en el panel

**Files:**
- Create: `src/pages/api/admin/logout.ts`
- Modify: `src/pages/admin/index.astro`

**Interfaces:**
- Produces: `POST /api/admin/logout` — invalida la sesión de Supabase y redirige a `/admin/login`.

- [ ] **Step 1: Crear `src/pages/api/admin/logout.ts`**

```ts
// src/pages/api/admin/logout.ts
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const supabase = createSupabaseServerClient(context.cookies);
  await supabase.auth.signOut();
  return context.redirect('/admin/login');
};
```

- [ ] **Step 2: Agregar botón de logout en `/admin/index.astro`**

En el `<header>` del archivo `src/pages/admin/index.astro`, reemplaza:

```html
<a href="/es/" target="_blank" class="text-sm underline hover:opacity-80">Ver sitio web ↗</a>
```

Por:

```html
<div class="flex items-center gap-4">
  <a href="/es/" target="_blank" class="text-sm underline hover:opacity-80">Ver sitio web ↗</a>
  <form method="POST" action="/api/admin/logout">
    <button type="submit" class="text-sm bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-semibold">
      Cerrar sesión
    </button>
  </form>
</div>
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Esperado: Build limpio.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/admin/logout.ts src/pages/admin/index.astro
git commit -m "feat(auth): add POST /api/admin/logout endpoint and logout button in admin dashboard"
```

---

### Task 6: Configurar usuario administrador en Supabase Auth

> Esta tarea es de configuración en el Dashboard de Supabase — no toca código.

**Interfaces:**
- Produce: Usuario admin activo en Supabase Auth con el email del propietario del negocio.

- [ ] **Step 1: Ir a Supabase Dashboard**

Abre https://supabase.com/dashboard → proyecto `ugsoaousrkmhusfkskhm` → **Authentication** → **Users**.

- [ ] **Step 2: Crear el usuario administrador**

Haz click en **"Add user"** → **"Create new user"**.
- Email: el correo del propietario del negocio (p. ej. `admin@floresdepaz.pe`)
- Password: puedes poner cualquiera — no se usará porque el flujo es Magic Link.
- Marcar **"Auto Confirm User"** para que no requiera verificación adicional.

- [ ] **Step 3: Verificar el registro**

El usuario debe aparecer en la tabla de Users con estado **"Confirmed"**.

> Solo este email podrá recibir Magic Links porque `shouldCreateUser: false` en el código.

---

### Task 7: Security Headers — `public/_headers`

**Files:**
- Create: `public/_headers`

**Interfaces:**
- Produce: Cloudflare Pages inyecta las cabeceras definidas en cada respuesta HTTP del sitio.

- [ ] **Step 1: Crear `public/_headers`**

```
# Cloudflare Pages Security Headers
# Aplica a todas las rutas del sitio
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; media-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'

# Panel Admin — cabeceras adicionales de no-indexado
/admin/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-store, no-cache, must-revalidate
```

- [ ] **Step 2: Verificar build (el archivo `_headers` se copia a `dist/` automáticamente)**

```bash
npm run build
```

Luego verifica:

```bash
ls dist/_headers
```

El archivo debe existir en `dist/`.

- [ ] **Step 3: Commit**

```bash
git add public/_headers
git commit -m "feat(security): add Cloudflare Pages _headers with CSP, HSTS, and X-Frame-Options"
```

---

### Task 8: Agregar variables de entorno en Cloudflare Pages y prueba E2E

> Esta tarea finaliza el despliegue en producción.

**Interfaces:**
- Produce: Sitio en producción con autenticación activa y security headers verificados.

- [ ] **Step 1: Agregar `SUPABASE_ANON_KEY` en el panel de Cloudflare Pages**

Ir a Cloudflare Dashboard → `presencia-website` project → **Settings** → **Environment Variables**.
Agregar en **Production**:
- `SUPABASE_ANON_KEY` = `<valor anon key de Supabase>`

> `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya deben estar configurados.
> **NO** agregar `PUBLIC_SKIP_AUTH` en producción — debe estar ausente o `false`.

- [ ] **Step 2: Push para desplegar**

```bash
git push origin main
```

Esperar que Cloudflare Pages complete el deploy (~1-2 minutos).

- [ ] **Step 3: Verificar Security Headers en producción**

```bash
curl -I https://presencia-website.pages.dev/
```

Buscar en la respuesta:
- `x-frame-options: DENY`
- `x-content-type-options: nosniff`
- `strict-transport-security: max-age=31536000; includeSubDomains; preload`
- `content-security-policy: ...`

Alternativamente usar https://securityheaders.com con tu URL de producción.

- [ ] **Step 4: Verificar que `/admin` redirige a `/admin/login` sin sesión**

```bash
curl -I https://presencia-website.pages.dev/admin/
```

Esperado: `HTTP/2 302` con `location: /admin/login`.

- [ ] **Step 5: Verificar flujo completo de login**

1. Abrir `https://presencia-website.pages.dev/admin/` en modo incógnito.
2. Debe redirigir a `/admin/login`.
3. Ingresar el email del admin configurado en Task 6.
4. Revisar email y hacer click en el Magic Link.
5. Debe redirigir a `/admin/auth-callback` y luego a `/admin/` con el panel visible.
6. Verificar que el botón **"Cerrar sesión"** funciona y devuelve a `/admin/login`.

- [ ] **Step 6: Commit final de documentación**

```bash
git add .
git commit -m "feat(security): complete Supabase Auth + Security Headers implementation — production ready"
git push origin main
```

---

## Self-Review

### Cobertura del Spec

| Requisito (AD-11 / AD-12) | Tarea que lo implementa |
|---|---|
| Middleware Astro intercepta `/admin/*` y `/api/admin/*` | Task 2 |
| Sesión validada via `supabase.auth.getSession()` | Task 2 |
| Redirige a `/admin/login` si no hay sesión | Task 2 |
| API routes responden 401 JSON sin sesión | Task 2 |
| Página `/admin/login` con formulario Magic Link | Task 3 |
| `shouldCreateUser: false` — solo usuarios registrados | Task 3 |
| Callback `/admin/auth-callback` intercambia code por sesión | Task 4 |
| `@supabase/ssr` para gestión de cookies server-side | Task 1 |
| `SUPABASE_ANON_KEY` separado de `SERVICE_ROLE_KEY` | Task 1 + Task 8 |
| `PUBLIC_SKIP_AUTH=true` desactiva guard en dev local | Task 2 |
| Botón de logout en dashboard | Task 5 |
| Security Headers en `public/_headers` | Task 7 |
| `X-Frame-Options: DENY` | Task 7 |
| `X-Content-Type-Options: nosniff` | Task 7 |
| `Content-Security-Policy` con allowlist | Task 7 |
| `Strict-Transport-Security` | Task 7 |
| `X-Robots-Tag: noindex` en `/admin/*` | Task 7 |
| Variable de entorno `SUPABASE_ANON_KEY` en Cloudflare | Task 8 |
| Verificación E2E del flujo completo | Task 8 |

### Scan de Placeholders: ✅ Limpio
### Consistencia de tipos: ✅ `createSupabaseServerClient(cookies: AstroCookies)` usada uniformemente en Tasks 1, 2, 3, 4, 5
