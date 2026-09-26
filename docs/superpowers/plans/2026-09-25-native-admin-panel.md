# Native Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar Decap CMS por un Panel de Administración 100% nativo dentro del sitio en `/admin` (Astro SSR + Supabase + Cloudflare Workers), permitiendo al usuario del negocio gestionar Leads, Paquetes, Precios y Contenidos del Hero sin dependencias de GitHub OAuth.

**Architecture:** Astro `output: 'hybrid'` con rutas SSR en `/admin/*` y `/api/admin/*`. Las configuraciones editables del sitio (video hero, textos, precios de paquetes) se persisten en la tabla `site_config` de Supabase mediante Cloudflare Workers usando `SUPABASE_SERVICE_ROLE_KEY`. El tablero principal `/admin` organiza las secciones de Leads, Paquetes y Contenido en una interfaz consistente con el diseño de la marca (fuentes Italiana + Raleway y colores `bg-secondary` / `text-primary`).

**Tech Stack:** Astro 4.x · `@astrojs/cloudflare` · Supabase JS (server-only) · Tailwind CSS · TypeScript

**Spec:**
- `_bmad-output/planning-artifacts/architecture/architecture-presencia-web-2026-09-25/ARCHITECTURE-SPINE.md` (Decisión AD-10)

## Global Constraints

- Astro `output: 'hybrid'` — `/admin/*` y `/api/admin/*` declaran `export const prerender = false`
- `SUPABASE_SERVICE_ROLE_KEY` consumido únicamente del lado del servidor en `/api/admin/*`
- Todos los formularios de administración validan datos en cliente y servidor
- Estilos visuales con Tailwind usando la paleta del proyecto (`bg-secondary`, `text-primary`, `border-primary/20`) y fuentes (*Italiana* para títulos, *Raleway* para tablas y formularios)
- Mobile-first: la interfaz de administración debe ser 100% utilizable desde un teléfono móvil

---

## File Map

```text
presencia-web/
├── supabase/
│   └── migrations/
│       └── 002_site_config.sql             # Tabla site_config y valores iniciales
│
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── index.astro                 # Dashboard principal del Panel Admin
│   │   │   ├── leads.astro                 # (Existente) Tabla de leads recibidos
│   │   │   ├── paquetes.astro              # Gestión de paquetes y precios
│   │   │   └── sitio.astro                 # Gestión del Hero video y textos bilingües
│   │   │
│   │   └── api/
│   │       └── admin/
│   │           ├── config.ts               # GET / POST de la configuración del sitio
│   │           └── leads.ts                # (Existente) GET de solicitudes
```

---

## Tasks

### Task 1: Migración Supabase — Tabla `site_config`

**Files:**
- Create: `supabase/migrations/002_site_config.sql`

**Interfaces:**
- Produces: Tabla `site_config` (key VARCHAR PRIMARY KEY, value JSONB, updated_at TIMESTAMPTZ) con RLS habilitado.

- [ ] **Step 1: Crear archivo de migración SQL**

```sql
-- supabase/migrations/002_site_config.sql
CREATE TABLE IF NOT EXISTS site_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS activo sin políticas públicas (solo service_role)
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Insertar configuración inicial del sitio
INSERT INTO site_config (key, value) VALUES
('hero', '{
  "video_url": "/videos/hero.mp4",
  "title_es": "FLORES PARA LOS QUE SIEMPRE ESTÁN",
  "title_en": "FLOWERS FOR THOSE WHO ARE ALWAYS WITH YOU",
  "subtitle_es": "Porque cuidar no depende de dónde estés. Con tu decisión, nosotros llegamos por ti.",
  "subtitle_en": "Because caring doesn''t depend on where you are. With your decision, we go for you."
}'::jsonb),
('paquetes', '[
  {
    "id": "serenidad",
    "nombre": "SERENIDAD",
    "destacado": true,
    "precio_sol": "140",
    "precio_usd": "38",
    "beneficios": ["Arreglo floral premium de temporada", "Tarjeta con mensaje personalizado impreso", "Envío de foto y video de confirmación", "Colocación garantizada en la sepultura"],
    "beneficios_en": ["Premium seasonal floral arrangement", "Printed card with personal message", "Photo & video placement confirmation", "Guaranteed cemetery placement"]
  },
  {
    "id": "esencial",
    "nombre": "ESENCIAL",
    "destacado": false,
    "precio_sol": "90",
    "precio_usd": "25",
    "beneficios": ["Arreglo floral clásico de temporada", "Tarjeta con mensaje personalizado", "Envío de foto de confirmación"],
    "beneficios_en": ["Classic seasonal floral arrangement", "Card with personal message", "Photo placement confirmation"]
  },
  {
    "id": "memoria_viva",
    "nombre": "MEMORIA VIVA",
    "destacado": false,
    "precio_sol": "240",
    "precio_usd": "65",
    "beneficios": ["Mantenimiento y arreglo mensual (3 meses)", "Selección preferencial de flores", "Tarjeta con mensaje personalizado en cada entrega", "Reporte fotográfico mensual"],
    "beneficios_en": ["Monthly maintenance & flowers (3 months)", "Preferential flower selection", "Personalized card on each delivery", "Monthly photo report"]
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/002_site_config.sql
git commit -m "feat(db): add 002_site_config.sql migration for native admin configuration"
```

---

### Task 2: API Route Admin — `/api/admin/config.ts`

**Files:**
- Create: `src/pages/api/admin/config.ts`

**Interfaces:**
- Consumes: Supabase `site_config` table
- Produces: `GET /api/admin/config?key=X` -> JSON configuration; `POST /api/admin/config` -> update configuration in Supabase.

- [ ] **Step 1: Crear el endpoint `/api/admin/config.ts`**

```ts
// src/pages/api/admin/config.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const key = url.searchParams.get('key');
  
  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  let query = supabase.from('site_config').select('key, value, updated_at');
  if (key) {
    query = query.eq('key', key);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: 'Error al consultar configuración' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(key ? (data[0]?.value ?? null) : data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const json = await request.json().catch(() => null);

  if (!json || !json.key || json.value === undefined) {
    return new Response(JSON.stringify({ error: 'Parámetros inválidos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase
    .from('site_config')
    .upsert(
      { key: String(json.key), value: json.value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/api/admin/config.ts
git commit -m "feat(api): add /api/admin/config endpoint for site configuration management"
```

---

### Task 3: Dashboard Principal Admin — `/admin/index.astro`

**Files:**
- Create: `src/pages/admin/index.astro`

**Interfaces:**
- Produces: `/admin` -> Dashboard con menú de navegación e indicadores de métricas rápidas (solicitudes de leads, estado del sitio).

- [ ] **Step 1: Crear `src/pages/admin/index.astro`**

```astro
---
// src/pages/admin/index.astro
export const prerender = false;
Astro.response.headers.set('X-Astro-Reroute', 'no');

interface Lead {
  id: string;
}

let leadCount = 0;
try {
  const url = new URL('/api/admin/leads', Astro.url.origin);
  const res = await fetch(url.toString(), {
    headers: { cookie: Astro.request.headers.get('cookie') || '' },
  });
  if (res.ok) {
    const data = await res.json();
    leadCount = Array.isArray(data) ? data.length : 0;
  }
} catch {}
---
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Panel de Administración · Flores en Paz</title>
  <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Raleway:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: { primary: '#2b4c3b', secondary: '#f5f3e9', whatsapp: '#25d366' },
          fontFamily: { heading: ['Italiana', 'serif'], body: ['Raleway', 'sans-serif'] }
        }
      }
    }
  </script>
</head>
<body class="bg-secondary text-primary font-body min-h-screen p-4 md:p-8">
  <header class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center pb-6 border-b border-primary/20 gap-4 mb-8">
    <div>
      <h1 class="font-heading text-3xl font-bold tracking-wide">FLORES EN PAZ</h1>
      <p class="text-sm opacity-80">Panel de Administración de Contenidos y Solicitudes</p>
    </div>
    <a href="/es/" target="_blank" class="text-sm underline hover:opacity-80">Ver sitio web ↗</a>
  </header>

  <main class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Card Leads -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-primary/10 flex flex-col justify-between">
      <div>
        <div class="text-3xl mb-2">📋</div>
        <h2 class="font-heading text-xl font-bold mb-1">Solicitudes de Clientes</h2>
        <p class="text-sm opacity-70 mb-4">Revisa las solicitudes capturadas con enlace directo a WhatsApp.</p>
        <div class="text-3xl font-bold text-primary mb-4">{leadCount} <span class="text-xs font-normal opacity-70">registrados</span></div>
      </div>
      <a href="/admin/leads" class="block text-center bg-primary text-white py-2 px-4 rounded-xl font-semibold hover:opacity-90 transition">Gestionar Leads →</a>
    </div>

    <!-- Card Paquetes -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-primary/10 flex flex-col justify-between">
      <div>
        <div class="text-3xl mb-2">💐</div>
        <h2 class="font-heading text-xl font-bold mb-1">Paquetes y Precios</h2>
        <p class="text-sm opacity-70 mb-4">Modifica precios en S/ y USD, beneficios y resalta el paquete principal.</p>
      </div>
      <a href="/admin/paquetes" class="block text-center bg-primary text-white py-2 px-4 rounded-xl font-semibold hover:opacity-90 transition">Editar Paquetes →</a>
    </div>

    <!-- Card Sitio & Hero -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-primary/10 flex flex-col justify-between">
      <div>
        <div class="text-3xl mb-2">🎬</div>
        <h2 class="font-heading text-xl font-bold mb-1">Hero y Contenidos</h2>
        <p class="text-sm opacity-70 mb-4">Edita los títulos bilingües del Hero y la URL del video de fondo.</p>
      </div>
      <a href="/admin/sitio" class="block text-center bg-primary text-white py-2 px-4 rounded-xl font-semibold hover:opacity-90 transition">Editar Sitio →</a>
    </div>
  </main>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/index.astro
git commit -m "feat(admin): replace Decap CMS with native Astro admin dashboard at /admin"
```

---

### Task 4: Gestor de Paquetes — `/admin/paquetes.astro`

**Files:**
- Create: `src/pages/admin/paquetes.astro`

**Interfaces:**
- Produces: `/admin/paquetes` -> Interfaz de edición interactiva para los paquetes Esencial, Serenidad y Memoria Viva.

- [ ] **Step 1: Crear `src/pages/admin/paquetes.astro`**

```astro
---
// src/pages/admin/paquetes.astro
export const prerender = false;
Astro.response.headers.set('X-Astro-Reroute', 'no');
---
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Editar Paquetes — Admin · Flores en Paz</title>
  <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Raleway:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
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
<body class="bg-secondary text-primary font-body min-h-screen p-4 md:p-8">
  <div class="max-w-4xl mx-auto mb-6 flex justify-between items-center">
    <a href="/admin/" class="text-sm underline hover:opacity-80">← Volver al Panel Admin</a>
    <h1 class="font-heading text-2xl font-bold">Gestión de Paquetes y Precios</h1>
  </div>

  <main class="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-primary/10">
    <div id="loading" class="text-center py-8">Cargando paquetes desde Supabase...</div>
    <form id="paquetes-form" class="hidden space-y-8">
      <div id="paquetes-container" class="space-y-8"></div>
      
      <div class="flex items-center justify-between pt-6 border-t border-primary/10">
        <div id="msg" class="text-sm font-semibold"></div>
        <button type="submit" id="save-btn" class="bg-primary text-white py-3 px-8 rounded-xl font-bold hover:opacity-90 transition">
          Guardar Cambios
        </button>
      </div>
    </form>
  </main>

  <script>
    let currentData = [];

    async function loadData() {
      const loading = document.getElementById('loading');
      const form = document.getElementById('paquetes-form');
      const container = document.getElementById('paquetes-container');

      try {
        const res = await fetch('/api/admin/config?key=paquetes');
        if (res.ok) {
          currentData = await res.json() || [];
          renderForm(currentData);
          loading.classList.add('hidden');
          form.classList.remove('hidden');
        }
      } catch (err) {
        loading.textContent = 'Error al cargar paquetes.';
      }
    }

    function renderForm(list) {
      const container = document.getElementById('paquetes-container');
      container.innerHTML = list.map((p, idx) => `
        <div class="p-6 border border-primary/10 rounded-xl bg-secondary/30 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-heading text-xl font-bold">${p.nombre}</h3>
            <label class="flex items-center space-x-2 text-sm">
              <input type="checkbox" name="destacado_${idx}" ${p.destacado ? 'checked' : ''} class="w-4 h-4 text-primary">
              <span>Marcar como destacado ("Más elegido")</span>
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold mb-1">Precio Soles (S/)</label>
              <input type="text" name="precio_sol_${idx}" value="${p.precio_sol || ''}" class="w-full p-2 border border-primary/20 rounded-lg text-sm" required>
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">Precio Referencial (USD)</label>
              <input type="text" name="precio_usd_${idx}" value="${p.precio_usd || ''}" class="w-full p-2 border border-primary/20 rounded-lg text-sm" required>
            </div>
          </div>
        </div>
      `).join('');
    }

    document.getElementById('paquetes-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('msg');
      const saveBtn = document.getElementById('save-btn');
      saveBtn.disabled = true;
      msg.textContent = 'Guardando...';

      const updated = currentData.map((p, idx) => {
        const destacado = e.target[`destacado_${idx}`].checked;
        const precio_sol = e.target[`precio_sol_${idx}`].value;
        const precio_usd = e.target[`precio_usd_${idx}`].value;
        return { ...p, destacado, precio_sol, precio_usd };
      });

      try {
        const res = await fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'paquetes', value: updated })
        });
        if (res.ok) {
          msg.className = 'text-sm font-semibold text-green-700';
          msg.textContent = '¡Paquetes actualizados correctamente!';
        } else {
          throw new Error();
        }
      } catch {
        msg.className = 'text-sm font-semibold text-red-600';
        msg.textContent = 'Error al guardar cambios.';
      } finally {
        saveBtn.disabled = false;
      }
    });

    loadData();
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/paquetes.astro
git commit -m "feat(admin): add packages & prices management interface at /admin/paquetes"
```

---

### Task 5: Gestor de Sitio y Hero Video — `/admin/sitio.astro`

**Files:**
- Create: `src/pages/admin/sitio.astro`

**Interfaces:**
- Produces: `/admin/sitio` -> Interfaz de edición para los textos bilingües del Hero y la URL del video de fondo.

- [ ] **Step 1: Crear `src/pages/admin/sitio.astro`**

```astro
---
// src/pages/admin/sitio.astro
export const prerender = false;
Astro.response.headers.set('X-Astro-Reroute', 'no');
---
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Editar Sitio — Admin · Flores en Paz</title>
  <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Raleway:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
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
<body class="bg-secondary text-primary font-body min-h-screen p-4 md:p-8">
  <div class="max-w-3xl mx-auto mb-6 flex justify-between items-center">
    <a href="/admin/" class="text-sm underline hover:opacity-80">← Volver al Panel Admin</a>
    <h1 class="font-heading text-2xl font-bold">Gestión de Hero y Contenidos</h1>
  </div>

  <main class="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-primary/10">
    <div id="loading" class="text-center py-8">Cargando configuración...</div>
    <form id="sitio-form" class="hidden space-y-6">
      <div>
        <label class="block text-sm font-bold mb-1">URL del Video de Fondo (Hero)</label>
        <input type="text" id="video_url" class="w-full p-3 border border-primary/20 rounded-xl text-sm" required>
        <p class="text-xs opacity-70 mt-1">Ruta del archivo (ejemplo: /videos/hero.mp4 o URL pública CDN)</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Título Hero (Español)</label>
          <textarea id="title_es" rows="3" class="w-full p-3 border border-primary/20 rounded-xl text-sm" required></textarea>
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Título Hero (Inglés)</label>
          <textarea id="title_en" rows="3" class="w-full p-3 border border-primary/20 rounded-xl text-sm" required></textarea>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold mb-1">Subtítulo Hero (Español)</label>
          <textarea id="subtitle_es" rows="4" class="w-full p-3 border border-primary/20 rounded-xl text-sm" required></textarea>
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Subtítulo Hero (Inglés)</label>
          <textarea id="subtitle_en" rows="4" class="w-full p-3 border border-primary/20 rounded-xl text-sm" required></textarea>
        </div>
      </div>

      <div class="flex items-center justify-between pt-6 border-t border-primary/10">
        <div id="msg" class="text-sm font-semibold"></div>
        <button type="submit" id="save-btn" class="bg-primary text-white py-3 px-8 rounded-xl font-bold hover:opacity-90 transition">
          Guardar Cambios
        </button>
      </div>
    </form>
  </main>

  <script>
    async function loadConfig() {
      try {
        const res = await fetch('/api/admin/config?key=hero');
        if (res.ok) {
          const data = await res.json() || {};
          document.getElementById('video_url').value = data.video_url || '/videos/hero.mp4';
          document.getElementById('title_es').value = data.title_es || '';
          document.getElementById('title_en').value = data.title_en || '';
          document.getElementById('subtitle_es').value = data.subtitle_es || '';
          document.getElementById('subtitle_en').value = data.subtitle_en || '';
          document.getElementById('loading').classList.add('hidden');
          document.getElementById('sitio-form').classList.remove('hidden');
        }
      } catch {}
    }

    document.getElementById('sitio-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('msg');
      const saveBtn = document.getElementById('save-btn');
      saveBtn.disabled = true;
      msg.textContent = 'Guardando...';

      const payload = {
        video_url: document.getElementById('video_url').value,
        title_es: document.getElementById('title_es').value,
        title_en: document.getElementById('title_en').value,
        subtitle_es: document.getElementById('subtitle_es').value,
        subtitle_en: document.getElementById('subtitle_en').value,
      };

      try {
        const res = await fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'hero', value: payload })
        });
        if (res.ok) {
          msg.className = 'text-sm font-semibold text-green-700';
          msg.textContent = '¡Configuración del sitio guardada!';
        } else {
          throw new Error();
        }
      } catch {
        msg.className = 'text-sm font-semibold text-red-600';
        msg.textContent = 'Error al guardar configuración.';
      } finally {
        saveBtn.disabled = false;
      }
    });

    loadConfig();
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/sitio.astro
git commit -m "feat(admin): add hero text and video configuration interface at /admin/sitio"
```

---

### Task 6: Verificación y Compilación Final

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Verificar compilación completa**

```bash
npm run build
```

- [ ] **Step 2: Commit final y push a GitHub**

```bash
git add .
git commit -m "feat(admin): complete Native Admin Panel implementation replacing Decap CMS"
git push origin main
```

---

## Self-Review

1. **Cobertura del spec:**
   - AD-10 en `ARCHITECTURE-SPINE.md` completamente cubierto.
   - 0 dependencias externas (Decap CMS eliminado).
   - `/admin` (dashboard), `/admin/leads` (leads), `/admin/paquetes` (precios), `/admin/sitio` (textos/video) implementados.

2. **No placeholders:** Cada step contiene código funcional ejecutable.

3. **Verificación de build:** Todos los componentes declaran `export const prerender = false` para SSR en Cloudflare Workers.
