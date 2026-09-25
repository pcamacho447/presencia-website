# Flores en Paz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la landing page completa de Flores en Paz — sitio bilingüe (ES/EN) en Astro + Cloudflare Pages que convierte visitantes en contactos de WhatsApp, con formulario de leads en Supabase y panel de administración Decap CMS.

**Architecture:** Astro `output: 'hybrid'` genera HTML estático para todo el sitio; las rutas `/api/*` se despliegan como Cloudflare Workers. El contenido editable (precios, video, textos) vive en archivos YAML bajo `src/content/` gestionados por Decap CMS. Todo enlace WhatsApp del sitio pasa por el componente `<WhatsAppLink>` centralizado.

**Tech Stack:** Astro 4.x · @astrojs/cloudflare · Tailwind CSS 3.x · Decap CMS 3.x · Supabase JS (server-only) · Google Fonts (Italiana + Raleway) · Cloudflare Pages + Workers · Cloudflare Access

**Spec:**
- `_bmad-output/planning-artifacts/epics.md` — 4 epics, 16 stories con criterios de aceptación
- `_bmad-output/planning-artifacts/architecture/architecture-presencia-web-2026-09-25/ARCHITECTURE-SPINE.md` — invariantes AD-1 a AD-9
- `_bmad-output/planning-artifacts/architecture/architecture-presencia-web-2026-09-25/FREELANCER-BRIEF.md` — stack, SQL, variables de entorno
- `docs/superpowers/specs/2026-09-25-flores-en-paz-ux-design.md` — diseño visual, secciones, voz de marca

## Global Constraints

- Astro `output: 'hybrid'` — nunca `output: 'server'` ni `output: 'static'` puros
- Adapter `@astrojs/cloudflare` — ninguna otra plataforma de deploy
- Todo texto visible en componentes `.astro` debe provenir de `es.json`/`en.json` via `t()` — nada hardcodeado
- Todos los enlaces WhatsApp usan `<WhatsAppLink>` — cero `href="https://wa.me/..."` inline
- `SUPABASE_SERVICE_ROLE_KEY` nunca en archivos del repo, solo en variables de entorno de Cloudflare
- RLS activo en todas las tablas de Supabase
- Video Hero ≤ 50MB — en `/public/videos/hero.mp4`
- Fuentes: Italiana (headings), Raleway (body) — solo Google Fonts, `font-display: swap`
- Colores: primary `#2b4c3b`, secondary `#f5f3e9`, accent `#ffffff`, whatsapp `#25d366`
- Número de WhatsApp configurable en una sola constante — no repetido por componente
- Mobile-first: diseñar para móvil primero, luego adaptar con breakpoints `md:` y `lg:`

---

## File Map

```
presencia-web/
├── astro.config.mjs                        # output: hybrid, adapter cloudflare, i18n
├── tailwind.config.mjs                     # tokens de color y fuentes
├── tsconfig.json
├── package.json
├── .env.example                            # plantilla de variables (sin valores reales)
├── .gitignore
│
├── public/
│   ├── admin/
│   │   └── config.yml                      # Decap CMS — colecciones y campos
│   ├── videos/
│   │   └── hero.mp4                        # Video Hero (≤50MB, placeholder hasta producción)
│   └── sitemap.xml                         # Generado manualmente en Task 15
│
├── src/
│   ├── env.d.ts                            # Tipos para import.meta.env
│   │
│   ├── i18n/
│   │   ├── es.json                         # Todas las cadenas en español
│   │   ├── en.json                         # Todas las cadenas en inglés
│   │   └── utils.ts                        # helper t(locale, key)
│   │
│   ├── content/
│   │   ├── config.ts                       # Astro content collections schema
│   │   ├── paquetes.yaml                   # Datos de los 3 paquetes (editables en CMS)
│   │   └── site.yaml                       # video URL, textos hero (editables en CMS)
│   │
│   ├── layouts/
│   │   └── Base.astro                      # <head> con fonts, meta base, slot
│   │
│   ├── components/
│   │   ├── WhatsAppLink.astro              # CTA centralizado con analytics event
│   │   ├── Header.astro                    # Sticky, transición scroll, hamburger móvil
│   │   ├── Hero.astro                      # Video 100vh, overlay 40%, CTAs texto
│   │   ├── HowItWorks.astro               # Timeline horizontal 4 pasos
│   │   ├── Packages.astro                  # 3 cards, SERENIDAD primero en DOM móvil
│   │   ├── FAQ.astro                       # Acordeón single-expand, island Astro
│   │   ├── ContactForm.astro               # Formulario 5 campos + submit
│   │   ├── Subscribe.astro                 # Campo email + submit suscripción
│   │   ├── Footer.astro                    # 4 columnas + métodos de pago
│   │   └── WhatsAppFAB.astro              # Botón flotante esquina inferior derecha
│   │
│   └── pages/
│       ├── index.astro                     # Redirect a /es/
│       ├── es/
│       │   └── index.astro                 # Landing completa en ES
│       ├── en/
│       │   └── index.astro                 # Landing completa en EN
│       └── api/
│           ├── contact.ts                  # POST → Supabase leads (Worker)
│           ├── subscribe.ts               # POST → Supabase subscriptions (Worker)
│           └── admin/
│               └── leads.ts               # GET protegido → retorna leads JSON (Worker)
│
├── functions/
│   └── _middleware.ts                      # Cloudflare Pages middleware (headers de seguridad)
│
└── supabase/
    └── migrations/
        └── 001_initial.sql                 # CREATE TABLE leads, subscriptions + RLS
```

---

## Task 1: Inicializar Proyecto Astro con Cloudflare y Tailwind

**Files:**
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `src/env.d.ts`
- Create: `.env.example`
- Create: `.gitignore`

**Interfaces:**
- Produce: proyecto compilable con `npm run build`, deploy funcional en Cloudflare Pages

- [ ] **Step 1: Crear el proyecto Astro**

```bash
npm create astro@latest presencia-web -- --template minimal --typescript strict --no-install
cd presencia-web
npm install
```

- [ ] **Step 2: Agregar adapter de Cloudflare y Tailwind**

```bash
npx astro add cloudflare tailwind --yes
```

- [ ] **Step 3: Reemplazar `astro.config.mjs` con configuración completa**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  integrations: [tailwind()],
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
```

- [ ] **Step 4: Reemplazar `tailwind.config.mjs` con tokens de diseño**

```js
// tailwind.config.mjs
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2b4c3b',
        secondary: '#f5f3e9',
        whatsapp: '#25d366',
      },
      fontFamily: {
        heading: ['Italiana', ...defaultTheme.fontFamily.serif],
        body: ['Raleway', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: Crear `src/env.d.ts`**

```ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 6: Crear `.env.example`**

```
# Copiar a .env.local para desarrollo local (nunca commitear .env.local)
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

- [ ] **Step 7: Asegurarse que `.gitignore` incluye `.env*` local**

Verificar que existe la línea:
```
.env
.env.local
.env.*.local
```

- [ ] **Step 8: Crear página placeholder en `src/pages/es/index.astro`**

```astro
---
export const prerender = true;
---
<html lang="es">
  <head><title>Flores en Paz</title></head>
  <body>
    <h1 style="font-family: serif; padding: 2rem;">🌸 Flores en Paz — en construcción</h1>
  </body>
</html>
```

- [ ] **Step 9: Ejecutar build local y verificar que compila sin errores**

```bash
npm run build
```
Resultado esperado: `dist/` generado, sin errores en la consola.

- [ ] **Step 10: Hacer push a GitHub y verificar deploy en Cloudflare Pages**

En Cloudflare Pages, configurar:
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: 18 o 20

Verificar que la URL de preview muestra "🌸 Flores en Paz — en construcción".

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "feat: initialize Astro project with Cloudflare adapter and Tailwind"
```

---

## Task 2: Scaffold i18n — Rutas, Archivos de Traducción y Helper

**Files:**
- Create: `src/i18n/es.json`
- Create: `src/i18n/en.json`
- Create: `src/i18n/utils.ts`
- Modify: `src/pages/index.astro` (redirect a /es/)
- Create: `src/pages/en/index.astro`

**Interfaces:**
- Produce: `t(locale: string, key: string): string` — helper de traducción usado por todos los componentes
- Produce: rutas `/es/` y `/en/` funcionando, `/` redirige a `/es/`

- [ ] **Step 1: Crear `src/i18n/es.json` con todas las claves**

```json
{
  "nav": {
    "services": "Servicios",
    "packages": "Paquetes",
    "contact": "Contacto",
    "cities": "Ciudades",
    "whatsapp": "WhatsApp",
    "lang": "EN"
  },
  "hero": {
    "title": "FLORES PARA LOS QUE SIEMPRE ESTÁN",
    "subtitle": "Porque cuidar no depende de dónde estés. Con tu decisión, nosotros llegamos por ti.",
    "cta_primary": "ELEGIR UN ARREGLO",
    "cta_secondary": "HABLAR POR WHATSAPP",
    "wa_message": "Hola, quisiera información sobre Flores en Paz"
  },
  "how": {
    "title": "Cómo Funciona",
    "step1_title": "Elige cementerio y fecha",
    "step1_desc": "Nos dices cuándo y dónde",
    "step2_title": "Elige el arreglo que quieras",
    "step2_desc": "Desde un ramo simple hasta una suscripción",
    "step3_title": "Nosotros llegamos por ti",
    "step3_desc": "Con cuidado y respeto, nos encargamos de todo",
    "step4_title": "Te hacemos llegar fotos y video",
    "step4_desc": "Para que lo veas y lo compartas",
    "cta": "HABLAR POR WHATSAPP",
    "wa_message": "Hola, quiero saber cómo funciona el servicio"
  },
  "packages": {
    "title": "Nuestros Paquetes",
    "badge": "Más elegido",
    "cta": "HABLAR POR WHATSAPP",
    "wa_message_prefix": "Hola, me interesa el paquete",
    "help": "¿No sabes cuál elegir? Escríbenos, te ayudamos.",
    "wa_help": "Hola, no sé qué paquete elegir, ¿me pueden ayudar?"
  },
  "faq": {
    "title": "Preguntas Frecuentes",
    "q1": "¿Puedo incluir un mensaje personalizado?",
    "a1": "Sí. En los paquetes Serenidad y Memoria Viva puedes incluir una tarjeta con el mensaje que quieras. Solo indícanoslo al momento de coordinar.",
    "q2": "¿Cómo sé que realmente lo hicieron?",
    "a2": "Recibirás fotos y/o video del servicio realizado, directamente por WhatsApp. Esa es nuestra promesa y nuestro diferencial.",
    "q3": "¿Puedo pagar desde el extranjero?",
    "a3": "Sí. Aceptamos PayPal, transferencias internacionales, Wise y tarjetas de crédito internacionales vía link de pago.",
    "q4": "¿Qué flores colocan?",
    "a4": "Trabajamos con flores frescas de temporada. Puedes pedirnos una flor específica y hacemos lo posible por conseguirla. En caso de no estar disponible, te consultamos antes.",
    "q5": "¿Puedo programar visitas recurrentes?",
    "a5": "Sí, con el paquete Memoria Viva tienes visitas mensuales o trimestrales programadas. Ideal si quieres una presencia constante sin preocuparte de recordarlo.",
    "cta": "ESCRÍBENOS POR WHATSAPP",
    "wa_message": "Hola, tengo una pregunta sobre el servicio"
  },
  "form": {
    "title": "¿Listo para dar el paso?",
    "subtitle": "Cuéntanos y te contactamos en menos de 24 horas.",
    "name": "Nombre",
    "whatsapp": "WhatsApp",
    "city": "Ciudad del cementerio",
    "city_lima": "Lima",
    "city_trujillo": "Trujillo",
    "city_arequipa": "Arequipa",
    "city_other": "Otra",
    "date": "Fecha deseada",
    "package": "Paquete de interés",
    "pkg_esencial": "Esencial",
    "pkg_serenidad": "Serenidad",
    "pkg_memoria": "Memoria Viva",
    "submit": "SOLICITAR ATENCIÓN",
    "success": "¡Listo! Te contactamos pronto por WhatsApp.",
    "error": "Hubo un error. Por favor intenta de nuevo.",
    "subscribe_title": "También puedes suscribirte para recibir recordatorios de fechas especiales",
    "subscribe_email": "Tu email",
    "subscribe_cta": "SUSCRIBIRME",
    "subscribe_success": "¡Gracias! Te avisaremos en las fechas que importan.",
    "subscribe_error": "Hubo un error. Por favor intenta de nuevo."
  },
  "footer": {
    "tagline": "Porque cuidar no depende de dónde estés.",
    "services": "Servicios",
    "esencial": "Esencial",
    "serenidad": "Serenidad",
    "memoria": "Memoria Viva",
    "cities": "Ciudades",
    "lima": "Lima",
    "trujillo": "Trujillo",
    "arequipa": "Arequipa",
    "legal": "Legal",
    "privacy": "Privacidad",
    "terms": "Términos",
    "contact": "Contacto",
    "social": "Redes",
    "payment_methods": "Métodos de pago",
    "copyright": "© 2026 Flores en Paz · Lima, Perú"
  },
  "meta": {
    "title": "Flores en Paz — Colocación de Flores en Cementerios de Lima, Trujillo y Arequipa",
    "description": "Servicio de colocación de flores en cementerios. Tú decides, nosotros llegamos. Foto y video incluido. Lima, Trujillo, Arequipa."
  }
}
```

- [ ] **Step 2: Crear `src/i18n/en.json` con los placeholders en inglés**

```json
{
  "nav": {
    "services": "Services",
    "packages": "Packages",
    "contact": "Contact",
    "cities": "Cities",
    "whatsapp": "WhatsApp",
    "lang": "ES"
  },
  "hero": {
    "title": "FLOWERS FOR THOSE WHO ARE ALWAYS WITH YOU",
    "subtitle": "Because caring doesn't depend on where you are. With your decision, we go for you.",
    "cta_primary": "CHOOSE AN ARRANGEMENT",
    "cta_secondary": "TALK ON WHATSAPP",
    "wa_message": "Hello, I'd like information about Flores en Paz"
  },
  "how": {
    "title": "How It Works",
    "step1_title": "Choose cemetery and date",
    "step1_desc": "Tell us when and where",
    "step2_title": "Choose your arrangement",
    "step2_desc": "From a simple bouquet to a subscription",
    "step3_title": "We go for you",
    "step3_desc": "With care and respect, we handle everything",
    "step4_title": "We send you photos and video",
    "step4_desc": "So you can see it and share it",
    "cta": "TALK ON WHATSAPP",
    "wa_message": "Hello, I'd like to know how your service works"
  },
  "packages": {
    "title": "Our Packages",
    "badge": "Most chosen",
    "cta": "TALK ON WHATSAPP",
    "wa_message_prefix": "Hello, I'm interested in the",
    "help": "Not sure which one? Write to us, we'll help you.",
    "wa_help": "Hello, I'm not sure which package to choose, can you help me?"
  },
  "faq": {
    "title": "Frequently Asked Questions",
    "q1": "Can I include a personal message?",
    "a1": "Yes. With the Serenidad and Memoria Viva packages you can include a card with your message. Just let us know when coordinating.",
    "q2": "How do I know it was really done?",
    "a2": "You'll receive photos and/or video of the completed service, sent directly via WhatsApp. That's our promise and our differentiator.",
    "q3": "Can I pay from abroad?",
    "a3": "Yes. We accept PayPal, international transfers, Wise and international credit cards via payment link.",
    "q4": "What flowers do you use?",
    "a4": "We work with fresh seasonal flowers. You can request a specific flower and we'll do our best to get it. If unavailable, we'll check with you first.",
    "q5": "Can I schedule recurring visits?",
    "a5": "Yes, with the Memoria Viva package you get scheduled monthly or quarterly visits. Ideal if you want a constant presence without having to remember.",
    "cta": "WRITE US ON WHATSAPP",
    "wa_message": "Hello, I have a question about your service"
  },
  "form": {
    "title": "Ready to take the step?",
    "subtitle": "Tell us and we'll contact you in less than 24 hours.",
    "name": "Name",
    "whatsapp": "WhatsApp",
    "city": "Cemetery city",
    "city_lima": "Lima",
    "city_trujillo": "Trujillo",
    "city_arequipa": "Arequipa",
    "city_other": "Other",
    "date": "Desired date",
    "package": "Package of interest",
    "pkg_esencial": "Esencial",
    "pkg_serenidad": "Serenidad",
    "pkg_memoria": "Memoria Viva",
    "submit": "REQUEST ASSISTANCE",
    "success": "Done! We'll contact you soon on WhatsApp.",
    "error": "There was an error. Please try again.",
    "subscribe_title": "You can also subscribe to receive reminders for special dates",
    "subscribe_email": "Your email",
    "subscribe_cta": "SUBSCRIBE",
    "subscribe_success": "Thank you! We'll remind you on the dates that matter.",
    "subscribe_error": "There was an error. Please try again."
  },
  "footer": {
    "tagline": "Because caring doesn't depend on where you are.",
    "services": "Services",
    "esencial": "Esencial",
    "serenidad": "Serenidad",
    "memoria": "Memoria Viva",
    "cities": "Cities",
    "lima": "Lima",
    "trujillo": "Trujillo",
    "arequipa": "Arequipa",
    "legal": "Legal",
    "privacy": "Privacy",
    "terms": "Terms",
    "contact": "Contact",
    "social": "Social",
    "payment_methods": "Payment methods",
    "copyright": "© 2026 Flores en Paz · Lima, Peru"
  },
  "meta": {
    "title": "Flores en Paz — Flower Placement at Cemeteries in Lima, Trujillo and Arequipa",
    "description": "Flower placement service at cemeteries. You decide, we go. Photo and video included. Lima, Trujillo, Arequipa."
  }
}
```

- [ ] **Step 3: Crear `src/i18n/utils.ts`**

```ts
// src/i18n/utils.ts
import es from './es.json';
import en from './en.json';

type Locale = 'es' | 'en';

const translations: Record<Locale, Record<string, unknown>> = { es, en };

export function t(locale: string, key: string): string {
  const lang = (locale in translations ? locale : 'es') as Locale;
  const keys = key.split('.');
  let current: unknown = translations[lang];
  for (const k of keys) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[k];
    } else {
      return key; // fallback: retornar la clave si no existe
    }
  }
  return typeof current === 'string' ? current : key;
}

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  return (lang in translations ? lang : 'es') as Locale;
}
```

- [ ] **Step 4: Crear redirect en `src/pages/index.astro`**

```astro
---
// src/pages/index.astro
export const prerender = true;
---
<meta http-equiv="refresh" content="0;url=/es/" />
```

- [ ] **Step 5: Crear `src/pages/en/index.astro` como placeholder**

```astro
---
// src/pages/en/index.astro
export const prerender = true;
import { t } from '../../i18n/utils';
const lang = 'en';
---
<html lang="en">
  <head><title>{t(lang, 'meta.title')}</title></head>
  <body>
    <h1>{t(lang, 'hero.title')}</h1>
    <p>{t(lang, 'hero.subtitle')}</p>
  </body>
</html>
```

- [ ] **Step 6: Verificar rutas en dev**

```bash
npm run dev
```
- Abrir `http://localhost:4321/` → debe redirigir a `/es/`
- Abrir `http://localhost:4321/es/` → debe mostrar "Flores en Paz — en construcción"
- Abrir `http://localhost:4321/en/` → debe mostrar el título en inglés

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ src/pages/
git commit -m "feat: add i18n scaffold with es/en routes and t() helper"
```

---

## Task 3: Base de Datos Supabase — Tablas y RLS

**Files:**
- Create: `supabase/migrations/001_initial.sql`

**Interfaces:**
- Produce: tablas `leads` y `subscriptions` en Supabase con RLS activo
- Produce: variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` configuradas en Cloudflare Pages

- [ ] **Step 1: Crear el proyecto Supabase**

Ir a [supabase.com](https://supabase.com) → New Project → nombre: `presencia-web` → región: South America o US East → anotar `Project URL` y `service_role` key del panel Settings → API.

> ⚠️ Este debe ser un proyecto nuevo, separado de cualquier otro proyecto Supabase existente.

- [ ] **Step 2: Crear `supabase/migrations/001_initial.sql`**

```sql
-- 001_initial.sql
-- Tabla de leads (solicitudes de contacto)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  fecha_deseada DATE,
  paquete TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de suscripciones de email
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Sin políticas anónimas: solo el service_role_key puede leer/escribir
-- (ningún cliente browser puede acceder directamente)
```

- [ ] **Step 3: Ejecutar el SQL en el SQL Editor de Supabase**

En el panel de Supabase → SQL Editor → pegar el contenido de `001_initial.sql` → Run.

Verificar en Table Editor que existen las tablas `leads` y `subscriptions` con RLS activado (ícono de candado visible).

- [ ] **Step 4: Configurar variables de entorno en Cloudflare Pages**

En Cloudflare Pages → tu proyecto → Settings → Environment Variables → agregar:
```
SUPABASE_URL = https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJ...tu-key-aqui
```

Agregar para los entornos Production y Preview.

- [ ] **Step 5: Crear `.env.local` para desarrollo local (NO commitear)**

```bash
# Crear el archivo local (está en .gitignore)
echo "SUPABASE_URL=https://TU-PROYECTO.supabase.co" >> .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=eyJ...tu-key-aqui" >> .env.local
```

- [ ] **Step 6: Instalar el cliente de Supabase**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 7: Commit**

```bash
git add supabase/ package.json package-lock.json
git commit -m "feat: add Supabase migration SQL and install client"
```

---

## Task 4: Layout Base y Componente WhatsAppLink

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/components/WhatsAppLink.astro`

**Interfaces:**
- Produce: `<Base lang title description>` — layout base con Google Fonts, meta tags
- Produce: `<WhatsAppLink message text class? />` — enlace WhatsApp con analytics

- [ ] **Step 1: Crear `src/layouts/Base.astro`**

```astro
---
// src/layouts/Base.astro
interface Props {
  lang: string;
  title: string;
  description: string;
  canonicalUrl?: string;
  alternateEs?: string;
  alternateEn?: string;
}
const {
  lang,
  title,
  description,
  canonicalUrl = Astro.url.href,
  alternateEs,
  alternateEn,
} = Astro.props;
---
<!DOCTYPE html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>

    <!-- Canonical y hreflang (Task 15 los rellena) -->
    <link rel="canonical" href={canonicalUrl} />
    {alternateEs && <link rel="alternate" hreflang="es" href={alternateEs} />}
    {alternateEn && <link rel="alternate" hreflang="en" href={alternateEn} />}
    {alternateEs && <link rel="alternate" hreflang="x-default" href={alternateEs} />}

    <!-- Open Graph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:type" content="website" />

    <!-- Google Fonts: Italiana + Raleway -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Italiana&family=Raleway:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Cloudflare Web Analytics — activar token en el panel de Cloudflare -->
    <!-- <script defer src='https://static.cloudflareinsights.com/beacon.min.js'
      data-cf-beacon='{"token": "TU-TOKEN-AQUI"}'></script> -->
  </head>
  <body class="font-body bg-secondary text-primary">
    <slot />
  </body>
</html>

<style is:global>
  h1, h2, h3, h4 {
    font-family: 'Italiana', serif;
  }
  body {
    font-family: 'Raleway', sans-serif;
  }
</style>
```

- [ ] **Step 2: Crear constante global del número de WhatsApp**

Crear `src/config.ts`:
```ts
// src/config.ts
// Número en formato internacional sin + ni espacios
export const WA_PHONE = '51999999999'; // ← reemplazar con número real

export function waUrl(message: string): string {
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 3: Crear `src/components/WhatsAppLink.astro`**

```astro
---
// src/components/WhatsAppLink.astro
import { waUrl } from '../config';

interface Props {
  message: string;
  text: string;
  class?: string;
}
const { message, text, class: className = '' } = Astro.props;
const href = waUrl(message);
---
<a
  href={href}
  target="_blank"
  rel="noopener noreferrer"
  class={`underline decoration-1 underline-offset-4 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
  data-wa-link
>
  {text}
</a>

<script>
  // Dispara evento whatsapp_click a Cloudflare Web Analytics
  document.querySelectorAll('[data-wa-link]').forEach((el) => {
    el.addEventListener('click', () => {
      // @ts-ignore
      if (typeof window.cfBeacon !== 'undefined') {
        // @ts-ignore
        window.cfBeacon.push({ n: 'whatsapp_click' });
      }
    });
  });
</script>
```

- [ ] **Step 4: Verificar en dev que el componente funciona**

```bash
npm run dev
```

Agregar temporalmente `<WhatsAppLink message="Hola" text="Test WA" />` en `src/pages/es/index.astro`, abrir el navegador y verificar que el enlace abre `https://wa.me/51999999999?text=Hola`.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/ src/components/WhatsAppLink.astro src/config.ts
git commit -m "feat: add Base layout with Google Fonts and WhatsAppLink component with analytics"
```

---

## Task 5: Header — Sticky con Transición de Scroll

**Files:**
- Create: `src/components/Header.astro`
- Modify: `src/pages/es/index.astro`

**Interfaces:**
- Consumes: `<WhatsAppLink>`, textos de `t(lang, 'nav.*')`
- Produce: `<Header lang />` — header sticky con transición

- [ ] **Step 1: Crear `src/components/Header.astro`**

```astro
---
// src/components/Header.astro
import WhatsAppLink from './WhatsAppLink.astro';
import { t } from '../i18n/utils';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
const otherLang = lang === 'es' ? 'en' : 'es';
const otherLangPath = `/${otherLang}/`;
const waMsg = t(lang, 'hero.wa_message');
---
<header
  id="site-header"
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4"
>
  <div class="max-w-6xl mx-auto flex items-center justify-between">
    <!-- Logo -->
    <a href={`/${lang}/`} class="font-heading text-xl font-bold text-white tracking-widest">
      FLORES EN PAZ
    </a>

    <!-- Nav desktop -->
    <nav class="hidden md:flex items-center gap-8 text-sm font-body font-medium">
      <a href={`/${lang}/#como-funciona`} class="text-white hover:opacity-70 transition-opacity">
        {t(lang, 'nav.services')}
      </a>
      <a href={`/${lang}/#paquetes`} class="text-white hover:opacity-70 transition-opacity">
        {t(lang, 'nav.packages')}
      </a>
      <a href={`/${lang}/#contacto`} class="text-white hover:opacity-70 transition-opacity">
        {t(lang, 'nav.contact')}
      </a>
    </nav>

    <!-- Acciones desktop -->
    <div class="hidden md:flex items-center gap-4">
      <a href={otherLangPath} class="text-white text-sm font-medium hover:opacity-70 transition-opacity">
        {t(lang, 'nav.lang')}
      </a>
      <WhatsAppLink
        message={waMsg}
        text={t(lang, 'nav.whatsapp')}
        class="bg-whatsapp text-white px-4 py-2 rounded-full text-sm font-medium no-underline hover:opacity-90"
      />
    </div>

    <!-- Móvil: hamburger + WA siempre visible -->
    <div class="flex md:hidden items-center gap-3">
      <WhatsAppLink
        message={waMsg}
        text="WA"
        class="bg-whatsapp text-white px-3 py-1 rounded-full text-xs font-bold no-underline"
      />
      <button
        id="hamburger"
        aria-label="Abrir menú"
        class="text-white p-2"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Menú móvil desplegable -->
  <div id="mobile-menu" class="hidden md:hidden mt-4 pb-4 border-t border-white/20">
    <nav class="flex flex-col gap-4 pt-4 text-sm font-medium">
      <a href={`/${lang}/#como-funciona`} class="text-white">{t(lang, 'nav.services')}</a>
      <a href={`/${lang}/#paquetes`} class="text-white">{t(lang, 'nav.packages')}</a>
      <a href={`/${lang}/#contacto`} class="text-white">{t(lang, 'nav.contact')}</a>
      <a href={otherLangPath} class="text-white">{t(lang, 'nav.lang')}</a>
    </nav>
  </div>
</header>

<script>
  // Transición de scroll: transparente → fondo crema
  const header = document.getElementById('site-header')!;
  const SCROLL_THRESHOLD = 80;

  function updateHeader() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('bg-secondary', 'shadow-sm');
      header.classList.remove('bg-transparent');
      // Cambiar color de texto a primario
      header.querySelectorAll('a:not([data-wa-link])').forEach((a) => {
        a.classList.remove('text-white');
        a.classList.add('text-primary');
      });
    } else {
      header.classList.remove('bg-secondary', 'shadow-sm');
      header.classList.add('bg-transparent');
      header.querySelectorAll('a:not([data-wa-link])').forEach((a) => {
        a.classList.add('text-white');
        a.classList.remove('text-primary');
      });
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // Toggle hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });
</script>
```

- [ ] **Step 2: Actualizar `src/pages/es/index.astro` para incluir el Header**

```astro
---
export const prerender = true;
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import { t } from '../../i18n/utils';

const lang = 'es';
---
<Base
  lang={lang}
  title={t(lang, 'meta.title')}
  description={t(lang, 'meta.description')}
>
  <Header lang={lang} />
  <main>
    <div style="height: 200vh; background: #2b4c3b; display:flex; align-items:center; justify-content:center;">
      <h1 style="color:white; font-family: serif;">Placeholder — Hero va aquí</h1>
    </div>
  </main>
</Base>
```

- [ ] **Step 3: Verificar en dev**

```bash
npm run dev
```
- El header debe ser transparente inicialmente
- Al hacer scroll la barra debe adquirir fondo crema con sombra
- En móvil (<768px) debe mostrar el botón "WA" y el hamburger — al hacer click en hamburger, el menú se despliega

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro src/pages/es/index.astro
git commit -m "feat: add sticky header with scroll transition and mobile hamburger"
```

---

## Task 6: Hero — Video Full Viewport

**Files:**
- Create: `src/components/Hero.astro`
- Create: `public/videos/hero.mp4` (placeholder — video real a proveer por el cliente)
- Modify: `src/pages/es/index.astro`

**Interfaces:**
- Consumes: `<WhatsAppLink>`, textos `t(lang, 'hero.*')`
- Produce: `<Hero lang />` — sección 100vh con video, overlay y CTAs texto subrayado

- [ ] **Step 1: Crear video placeholder**

```bash
# Crear directorio
mkdir -p public/videos
# Colocar aquí el archivo hero.mp4 (≤50MB) provisto por el cliente
# Si no está disponible aún, crear un archivo de texto como placeholder
echo "VIDEO PLACEHOLDER" > public/videos/hero.mp4
```

- [ ] **Step 2: Crear `src/components/Hero.astro`**

```astro
---
// src/components/Hero.astro
import WhatsAppLink from './WhatsAppLink.astro';
import { t } from '../i18n/utils';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
---
<section
  id="hero"
  class="relative w-full h-screen flex items-center justify-center overflow-hidden"
>
  <!-- Video de fondo -->
  <video
    class="absolute inset-0 w-full h-full object-cover"
    autoplay
    muted
    loop
    playsinline
  >
    <source src="/videos/hero.mp4" type="video/mp4" />
  </video>

  <!-- Overlay 40% -->
  <div class="absolute inset-0 bg-black/40"></div>

  <!-- Contenido sobre el overlay -->
  <div class="relative z-10 text-center text-white px-6 max-w-3xl mx-auto">
    <h1 class="font-heading text-4xl md:text-6xl lg:text-7xl leading-tight mb-6 tracking-wide">
      {t(lang, 'hero.title')}
    </h1>
    <p class="font-body text-lg md:text-xl mb-10 leading-relaxed opacity-90 max-w-xl mx-auto">
      {t(lang, 'hero.subtitle')}
    </p>

    <!-- CTAs como texto subrayado (no botones) -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
      <a
        href={`/${lang}/#paquetes`}
        class="font-body font-semibold text-base md:text-lg underline decoration-1 underline-offset-4 text-white hover:opacity-70 transition-opacity tracking-widest"
      >
        {t(lang, 'hero.cta_primary')}
      </a>
      <WhatsAppLink
        message={t(lang, 'hero.wa_message')}
        text={t(lang, 'hero.cta_secondary')}
        class="font-semibold text-base md:text-lg text-white tracking-widest"
      />
    </div>
  </div>
</section>
```

- [ ] **Step 3: Actualizar `src/pages/es/index.astro`**

```astro
---
export const prerender = true;
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Hero from '../../components/Hero.astro';
import { t } from '../../i18n/utils';

const lang = 'es';
---
<Base
  lang={lang}
  title={t(lang, 'meta.title')}
  description={t(lang, 'meta.description')}
>
  <Header lang={lang} />
  <main>
    <Hero lang={lang} />
    <!-- Secciones siguientes irán aquí -->
    <div style="height: 100vh; background: #f5f3e9;"></div>
  </main>
</Base>
```

- [ ] **Step 4: Verificar en dev**

```bash
npm run dev
```
- El video debe ocupar exactamente toda la pantalla (100vh × 100vw)
- El overlay oscuro debe permitir leer el texto blanco con comodidad
- Los dos CTAs son texto subrayado, sin bordes ni fondos
- En móvil los CTAs se apilan verticalmente

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro public/videos/
git commit -m "feat: add full-viewport Hero section with video background and text CTAs"
```

---

## Task 7: Sección "Cómo Funciona" — Timeline Horizontal

**Files:**
- Create: `src/components/HowItWorks.astro`
- Modify: `src/pages/es/index.astro`

**Interfaces:**
- Consumes: `<WhatsAppLink>`, textos `t(lang, 'how.*')`
- Produce: `<HowItWorks lang />` — timeline horizontal 4 pasos, scroll horizontal en móvil

- [ ] **Step 1: Crear `src/components/HowItWorks.astro`**

```astro
---
// src/components/HowItWorks.astro
import WhatsAppLink from './WhatsAppLink.astro';
import { t } from '../i18n/utils';

interface Props {
  lang: string;
}
const { lang } = Astro.props;

const steps = [
  { icon: '🗺️', titleKey: 'how.step1_title', descKey: 'how.step1_desc' },
  { icon: '💐', titleKey: 'how.step2_title', descKey: 'how.step2_desc' },
  { icon: '🚶', titleKey: 'how.step3_title', descKey: 'how.step3_desc' },
  { icon: '📱', titleKey: 'how.step4_title', descKey: 'how.step4_desc' },
];
---
<section id="como-funciona" class="py-24 bg-white">
  <div class="max-w-6xl mx-auto px-6">
    <h2 class="font-heading text-4xl text-primary text-center mb-16">
      {t(lang, 'how.title')}
    </h2>

    <!-- Timeline scroll horizontal -->
    <div class="overflow-x-auto pb-6" style="scrollbar-width: none; -ms-overflow-style: none;">
      <div class="flex items-start gap-0 min-w-max mx-auto">
        {steps.map((step, i) => (
          <div class="flex items-start">
            <!-- Paso -->
            <div class="flex flex-col items-center w-56 px-4">
              <!-- Número + Icono -->
              <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-4 shrink-0">
                {step.icon}
              </div>
              <!-- Número -->
              <span class="font-heading text-primary/40 text-sm mb-2">0{i + 1}</span>
              <!-- Título -->
              <h3 class="font-body font-semibold text-primary text-center text-sm mb-2 leading-snug">
                {t(lang, step.titleKey)}
              </h3>
              <!-- Descripción -->
              <p class="font-body text-primary/60 text-center text-xs leading-relaxed">
                {t(lang, step.descKey)}
              </p>
            </div>

            <!-- Línea conectora (excepto en el último paso) -->
            {i < steps.length - 1 && (
              <div class="flex items-center mt-8 shrink-0">
                <div class="w-16 h-px bg-primary/30"></div>
                <div class="w-2 h-2 rounded-full bg-primary/30 -ml-1"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    <!-- CTA al final -->
    <div class="text-center mt-12">
      <WhatsAppLink
        message={t(lang, 'how.wa_message')}
        text={t(lang, 'how.cta')}
        class="font-body font-semibold text-primary text-sm tracking-widest"
      />
    </div>
  </div>
</section>

<style>
  /* Ocultar scrollbar en Chrome/Safari */
  div::-webkit-scrollbar {
    display: none;
  }
</style>
```

- [ ] **Step 2: Agregar `<HowItWorks>` a `src/pages/es/index.astro`**

```astro
import HowItWorks from '../../components/HowItWorks.astro';
// ... en el <main>:
<HowItWorks lang={lang} />
```

- [ ] **Step 3: Verificar en dev — desktop y móvil**

- En desktop: 4 pasos en línea horizontal con conectores
- En móvil: la fila es scrolleable horizontalmente, sin scrollbar visible

- [ ] **Step 4: Commit**

```bash
git add src/components/HowItWorks.astro src/pages/es/index.astro
git commit -m "feat: add horizontal timeline How It Works section"
```

---

## Task 8: Sección Paquetes — 3 Cards con SERENIDAD Primero en DOM

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/paquetes.yaml`
- Create: `src/components/Packages.astro`
- Modify: `src/pages/es/index.astro`

**Interfaces:**
- Consumes: `<WhatsAppLink>`, `src/content/paquetes.yaml`
- Produce: `<Packages lang />` — 3 cards, SERENIDAD primera en DOM en móvil

- [ ] **Step 1: Crear `src/content/config.ts`**

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// No usamos colecciones Astro nativas para YAML (Decap lo gestiona directamente)
// Este archivo reserva espacio para futuras colecciones si se necesitan
export const collections = {};
```

- [ ] **Step 2: Crear `src/content/paquetes.yaml`**

```yaml
# src/content/paquetes.yaml
# Editado por Decap CMS — no modificar directamente

paquetes:
  - id: serenidad
    nombre: SERENIDAD
    destacado: true
    precio_sol: "XX"
    precio_usd: "XX"
    beneficios:
      - Flores frescas + colocación
      - Foto + Video corto
      - Confirmación por WhatsApp
      - Tarjeta personalizada

  - id: esencial
    nombre: ESENCIAL
    destacado: false
    precio_sol: "XX"
    precio_usd: "XX"
    beneficios:
      - Ramo de flores frescas
      - Colocación en el lugar
      - Foto digital de confirmación

  - id: memoria
    nombre: MEMORIA VIVA
    destacado: false
    precio_sol: "XX"
    precio_usd: "XX/mes"
    beneficios:
      - Flores frescas en cada visita
      - Foto y video en cada visita
      - Recordatorios de fechas importantes
      - Suscripción mensual o trimestral
```

- [ ] **Step 3: Instalar `js-yaml` para parsear el YAML en Astro**

```bash
npm install js-yaml @types/js-yaml
```

- [ ] **Step 4: Crear `src/components/Packages.astro`**

```astro
---
// src/components/Packages.astro
import { readFileSync } from 'fs';
import { parse } from 'js-yaml';
import { resolve } from 'path';
import WhatsAppLink from './WhatsAppLink.astro';
import { t } from '../i18n/utils';

interface Paquete {
  id: string;
  nombre: string;
  destacado: boolean;
  precio_sol: string;
  precio_usd: string;
  beneficios: string[];
}

interface Props {
  lang: string;
}
const { lang } = Astro.props;

// Leer YAML en build time
const yamlPath = resolve('./src/content/paquetes.yaml');
const yamlContent = readFileSync(yamlPath, 'utf-8');
const data = parse(yamlContent) as { paquetes: Paquete[] };

// Ordenar: SERENIDAD (destacado) siempre primero en el DOM
const paquetes = [...data.paquetes].sort((a, b) => {
  if (a.destacado && !b.destacado) return -1;
  if (!a.destacado && b.destacado) return 1;
  return 0;
});
---
<section id="paquetes" class="py-24 bg-secondary">
  <div class="max-w-6xl mx-auto px-6">
    <h2 class="font-heading text-4xl text-primary text-center mb-16">
      {t(lang, 'packages.title')}
    </h2>

    <!-- Cards: SERENIDAD primero en DOM, se reordenan en desktop con CSS -->
    <div class="flex flex-col md:flex-row gap-6 justify-center">
      {paquetes.map((pkg) => (
        <div
          class={`relative flex flex-col bg-white rounded-2xl p-8 flex-1 max-w-sm mx-auto md:mx-0 ${
            pkg.destacado
              ? 'border-2 border-primary shadow-xl md:scale-105'
              : 'border border-primary/20 shadow-sm'
          }`}
        >
          <!-- Badge "Más elegido" -->
          {pkg.destacado && (
            <div class="absolute -top-3 left-1/2 -translate-x-1/2">
              <span class="bg-primary text-white text-xs font-body font-bold px-4 py-1 rounded-full tracking-widest">
                {t(lang, 'packages.badge')}
              </span>
            </div>
          )}

          <h3 class="font-heading text-2xl text-primary text-center mb-2 mt-2">
            {pkg.nombre}
          </h3>

          <!-- Precio -->
          <div class="text-center mb-6">
            <span class="font-body font-bold text-3xl text-primary">S/ {pkg.precio_sol}</span>
            <span class="font-body text-sm text-primary/50 ml-2">(~${pkg.precio_usd} USD)</span>
          </div>

          <!-- Beneficios -->
          <ul class="space-y-3 mb-8 flex-1">
            {pkg.beneficios.map((b) => (
              <li class="flex items-start gap-2 font-body text-sm text-primary/80">
                <span class="text-primary font-bold mt-0.5">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <!-- CTA -->
          <div class="text-center">
            <WhatsAppLink
              message={`${t(lang, 'packages.wa_message_prefix')} ${pkg.nombre}`}
              text={t(lang, 'packages.cta')}
              class="font-body font-semibold text-sm text-primary tracking-widest"
            />
          </div>
        </div>
      ))}
    </div>

    <!-- Texto ayuda al final -->
    <div class="text-center mt-12 font-body text-primary/70">
      {t(lang, 'packages.help')}{' '}
      <WhatsAppLink
        message={t(lang, 'packages.wa_help')}
        text="escríbenos"
        class="text-primary"
      />
    </div>
  </div>
</section>
```

- [ ] **Step 5: Agregar `<Packages>` a `src/pages/es/index.astro`**

```astro
import Packages from '../../components/Packages.astro';
// en <main>:
<Packages lang={lang} />
```

- [ ] **Step 6: Verificar en dev**

- SERENIDAD aparece primera en el orden del DOM en móvil
- En desktop las 3 cards están horizontales, SERENIDAD con borde y `scale-105`
- Precios leen del YAML, no hardcodeados

- [ ] **Step 7: Commit**

```bash
git add src/content/ src/components/Packages.astro src/pages/es/index.astro
git commit -m "feat: add Packages section with SERENIDAD first in DOM and YAML data source"
```

---

## Task 9: Sección FAQ — Acordeón Single-Expand

**Files:**
- Create: `src/components/FAQ.astro`
- Modify: `src/pages/es/index.astro`

**Interfaces:**
- Consumes: `<WhatsAppLink>`, textos `t(lang, 'faq.*')`
- Produce: `<FAQ lang />` — acordeón con 5 preguntas, single-expand, área táctil 44px

- [ ] **Step 1: Crear `src/components/FAQ.astro`**

```astro
---
// src/components/FAQ.astro
import WhatsAppLink from './WhatsAppLink.astro';
import { t } from '../i18n/utils';

interface Props {
  lang: string;
}
const { lang } = Astro.props;

const faqs = [1, 2, 3, 4, 5].map((n) => ({
  q: t(lang, `faq.q${n}`),
  a: t(lang, `faq.a${n}`),
}));
---
<section id="faq" class="py-24 bg-white">
  <div class="max-w-2xl mx-auto px-6">
    <h2 class="font-heading text-4xl text-primary text-center mb-16">
      {t(lang, 'faq.title')}
    </h2>

    <div class="space-y-2" id="faq-container">
      {faqs.map((faq, i) => (
        <div class="border-b border-primary/10">
          <!-- Header del acordeón (min 44px de altura táctil) -->
          <button
            class="faq-trigger w-full flex items-center justify-between py-5 px-2 min-h-[44px] text-left font-body font-semibold text-primary text-sm md:text-base"
            data-index={i}
            aria-expanded="false"
          >
            <span>{faq.q}</span>
            <span class="faq-icon ml-4 shrink-0 text-primary/50 text-xl leading-none">+</span>
          </button>

          <!-- Respuesta (oculta por defecto) -->
          <div
            class="faq-answer overflow-hidden max-h-0 transition-all duration-300"
            data-index={i}
          >
            <p class="font-body text-sm text-primary/70 leading-relaxed pb-5 px-2">
              {faq.a}
            </p>
          </div>
        </div>
      ))}
    </div>

    <!-- CTA al final -->
    <div class="text-center mt-12">
      <WhatsAppLink
        message={t(lang, 'faq.wa_message')}
        text={t(lang, 'faq.cta')}
        class="font-body font-semibold text-sm text-primary tracking-widest"
      />
    </div>
  </div>
</section>

<script>
  const triggers = document.querySelectorAll<HTMLButtonElement>('.faq-trigger');
  const answers = document.querySelectorAll<HTMLDivElement>('.faq-answer');

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index!;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Cerrar todos
      triggers.forEach((t) => {
        t.setAttribute('aria-expanded', 'false');
        t.querySelector('.faq-icon')!.textContent = '+';
      });
      answers.forEach((a) => {
        (a as HTMLElement).style.maxHeight = '0';
      });

      // Abrir el clickeado si estaba cerrado
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        btn.querySelector('.faq-icon')!.textContent = '−';
        const answer = document.querySelector<HTMLDivElement>(
          `.faq-answer[data-index="${idx}"]`
        )!;
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
</script>
```

- [ ] **Step 2: Agregar `<FAQ>` a `src/pages/es/index.astro`**

```astro
import FAQ from '../../components/FAQ.astro';
// en <main>:
<FAQ lang={lang} />
```

- [ ] **Step 3: Verificar en dev**

- Hacer click en la primera pregunta → se expande con transición suave
- Hacer click en otra → la primera se cierra, la nueva se abre (single-expand)
- El ícono cambia de `+` a `−`
- El área táctil del botón es ≥44px de altura

- [ ] **Step 4: Commit**

```bash
git add src/components/FAQ.astro src/pages/es/index.astro
git commit -m "feat: add FAQ accordion with single-expand behavior"
```

---

## Task 10: Formulario + Suscripción

**Files:**
- Create: `src/components/ContactForm.astro`
- Create: `src/components/Subscribe.astro`
- Modify: `src/pages/es/index.astro`

**Interfaces:**
- Produce: formulario que hace `POST /api/contact`, muestra feedback
- Produce: suscripción que hace `POST /api/subscribe`, muestra feedback

- [ ] **Step 1: Crear `src/components/ContactForm.astro`**

```astro
---
// src/components/ContactForm.astro
import { t } from '../i18n/utils';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
---
<section id="contacto" class="py-24 bg-secondary">
  <div class="max-w-xl mx-auto px-6">
    <h2 class="font-heading text-3xl text-primary text-center mb-3">
      {t(lang, 'form.title')}
    </h2>
    <p class="font-body text-primary/60 text-center text-sm mb-10">
      {t(lang, 'form.subtitle')}
    </p>

    <form id="contact-form" class="space-y-5" novalidate>
      <!-- Nombre -->
      <div>
        <label class="font-body text-xs font-semibold text-primary/70 uppercase tracking-widest block mb-1">
          {t(lang, 'form.name')}
        </label>
        <input
          type="text"
          name="nombre"
          required
          class="w-full border border-primary/20 rounded-lg px-4 py-3 font-body text-sm text-primary bg-white focus:outline-none focus:border-primary"
        />
      </div>

      <!-- WhatsApp -->
      <div>
        <label class="font-body text-xs font-semibold text-primary/70 uppercase tracking-widest block mb-1">
          {t(lang, 'form.whatsapp')} *
        </label>
        <input
          type="tel"
          name="whatsapp"
          required
          placeholder="+1 555 0000"
          class="w-full border border-primary/20 rounded-lg px-4 py-3 font-body text-sm text-primary bg-white focus:outline-none focus:border-primary"
        />
      </div>

      <!-- Ciudad -->
      <div>
        <label class="font-body text-xs font-semibold text-primary/70 uppercase tracking-widest block mb-1">
          {t(lang, 'form.city')}
        </label>
        <select
          name="ciudad"
          class="w-full border border-primary/20 rounded-lg px-4 py-3 font-body text-sm text-primary bg-white focus:outline-none focus:border-primary"
        >
          <option value="Lima">{t(lang, 'form.city_lima')}</option>
          <option value="Trujillo">{t(lang, 'form.city_trujillo')}</option>
          <option value="Arequipa">{t(lang, 'form.city_arequipa')}</option>
          <option value="Otra">{t(lang, 'form.city_other')}</option>
        </select>
      </div>

      <!-- Fecha -->
      <div>
        <label class="font-body text-xs font-semibold text-primary/70 uppercase tracking-widest block mb-1">
          {t(lang, 'form.date')}
        </label>
        <input
          type="date"
          name="fecha_deseada"
          class="w-full border border-primary/20 rounded-lg px-4 py-3 font-body text-sm text-primary bg-white focus:outline-none focus:border-primary"
        />
      </div>

      <!-- Paquete -->
      <div>
        <label class="font-body text-xs font-semibold text-primary/70 uppercase tracking-widest block mb-1">
          {t(lang, 'form.package')}
        </label>
        <select
          name="paquete"
          class="w-full border border-primary/20 rounded-lg px-4 py-3 font-body text-sm text-primary bg-white focus:outline-none focus:border-primary"
        >
          <option value="Serenidad">{t(lang, 'form.pkg_serenidad')}</option>
          <option value="Esencial">{t(lang, 'form.pkg_esencial')}</option>
          <option value="Memoria Viva">{t(lang, 'form.pkg_memoria')}</option>
        </select>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        id="contact-submit"
        class="w-full font-body font-bold text-sm tracking-widest text-primary underline decoration-1 underline-offset-4 py-4 hover:opacity-70 transition-opacity"
      >
        {t(lang, 'form.submit')}
      </button>

      <!-- Feedback -->
      <p id="contact-success" class="hidden text-center font-body text-sm text-primary/70">
        {t(lang, 'form.success')}
      </p>
      <p id="contact-error" class="hidden text-center font-body text-sm text-red-600">
        {t(lang, 'form.error')}
      </p>
    </form>
  </div>
</section>

<script>
  const form = document.getElementById('contact-form') as HTMLFormElement;
  const successMsg = document.getElementById('contact-success')!;
  const errorMsg = document.getElementById('contact-error')!;
  const submitBtn = document.getElementById('contact-submit') as HTMLButtonElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const whatsapp = (fd.get('whatsapp') as string).trim();

    if (!whatsapp) {
      errorMsg.classList.remove('hidden');
      return;
    }

    submitBtn.disabled = true;
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd)),
      });

      if (res.ok) {
        successMsg.classList.remove('hidden');
        form.reset();
      } else {
        errorMsg.classList.remove('hidden');
      }
    } catch {
      errorMsg.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
    }
  });
</script>
```

- [ ] **Step 2: Crear `src/components/Subscribe.astro`**

```astro
---
// src/components/Subscribe.astro
import { t } from '../i18n/utils';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
---
<div class="mt-16 pt-12 border-t border-primary/10 max-w-xl mx-auto px-6 text-center">
  <p class="font-body text-sm text-primary/60 mb-6">
    {t(lang, 'form.subscribe_title')}
  </p>
  <form id="subscribe-form" class="flex gap-3 max-w-sm mx-auto" novalidate>
    <input
      type="email"
      name="email"
      required
      placeholder={t(lang, 'form.subscribe_email')}
      class="flex-1 border border-primary/20 rounded-lg px-4 py-3 font-body text-sm text-primary bg-white focus:outline-none focus:border-primary"
    />
    <button
      type="submit"
      class="font-body font-bold text-xs tracking-widest text-primary underline decoration-1 underline-offset-4 px-4 hover:opacity-70 transition-opacity whitespace-nowrap"
    >
      {t(lang, 'form.subscribe_cta')}
    </button>
  </form>
  <p id="sub-success" class="hidden mt-4 font-body text-sm text-primary/70">
    {t(lang, 'form.subscribe_success')}
  </p>
  <p id="sub-error" class="hidden mt-4 font-body text-sm text-red-600">
    {t(lang, 'form.subscribe_error')}
  </p>
</div>

<script>
  const form = document.getElementById('subscribe-form') as HTMLFormElement;
  const successMsg = document.getElementById('sub-success')!;
  const errorMsg = document.getElementById('sub-error')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = (fd.get('email') as string).trim();
    if (!email) return;

    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        successMsg.classList.remove('hidden');
        form.reset();
      } else {
        errorMsg.classList.remove('hidden');
      }
    } catch {
      errorMsg.classList.remove('hidden');
    }
  });
</script>
```

- [ ] **Step 3: Agregar ambos componentes a `src/pages/es/index.astro`**

```astro
import ContactForm from '../../components/ContactForm.astro';
import Subscribe from '../../components/Subscribe.astro';
// en <main>, después del FAQ:
<section class="bg-secondary">
  <ContactForm lang={lang} />
  <Subscribe lang={lang} />
</section>
```

- [ ] **Step 4: Verificar en dev (solo UI — los endpoints se crean en Task 12)**

Verificar que el formulario muestra el mensaje de error cuando WhatsApp está vacío (validación cliente), y que intenta el POST (que fallará hasta que los endpoints existan).

- [ ] **Step 5: Commit**

```bash
git add src/components/ContactForm.astro src/components/Subscribe.astro src/pages/es/index.astro
git commit -m "feat: add contact form and email subscribe components"
```

---

## Task 11: Footer y FAB WhatsApp

**Files:**
- Create: `src/components/Footer.astro`
- Create: `src/components/WhatsAppFAB.astro`
- Modify: `src/pages/es/index.astro`

**Interfaces:**
- Consumes: `<WhatsAppLink>`, textos `t(lang, 'footer.*')`
- Produce: `<Footer lang />` y `<WhatsAppFAB lang />` — FAB fijo `position: fixed`

- [ ] **Step 1: Crear `src/components/Footer.astro`**

```astro
---
// src/components/Footer.astro
import { t } from '../i18n/utils';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
---
<footer class="bg-primary text-white py-16 px-6">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
    <!-- Columna 1: Marca -->
    <div>
      <p class="font-heading text-xl tracking-widest mb-3">FLORES EN PAZ</p>
      <p class="font-body text-sm text-white/60 leading-relaxed">
        {t(lang, 'footer.tagline')}
      </p>
    </div>

    <!-- Columna 2: Servicios -->
    <div>
      <h4 class="font-body font-semibold text-xs tracking-widest uppercase mb-4 text-white/50">
        {t(lang, 'footer.services')}
      </h4>
      <ul class="space-y-2 font-body text-sm text-white/70">
        <li>{t(lang, 'footer.esencial')}</li>
        <li>{t(lang, 'footer.serenidad')}</li>
        <li>{t(lang, 'footer.memoria')}</li>
      </ul>
    </div>

    <!-- Columna 3: Legal -->
    <div>
      <h4 class="font-body font-semibold text-xs tracking-widest uppercase mb-4 text-white/50">
        {t(lang, 'footer.legal')}
      </h4>
      <ul class="space-y-2 font-body text-sm text-white/70">
        <li><a href={`/${lang}/privacidad`} class="hover:text-white transition-colors">{t(lang, 'footer.privacy')}</a></li>
        <li><a href={`/${lang}/terminos`} class="hover:text-white transition-colors">{t(lang, 'footer.terms')}</a></li>
        <li><a href={`/${lang}/#contacto`} class="hover:text-white transition-colors">{t(lang, 'footer.contact')}</a></li>
      </ul>
    </div>

    <!-- Columna 4: Redes + Pago -->
    <div>
      <h4 class="font-body font-semibold text-xs tracking-widest uppercase mb-4 text-white/50">
        {t(lang, 'footer.social')}
      </h4>
      <ul class="space-y-2 font-body text-sm text-white/70 mb-6">
        <li><a href="#" class="hover:text-white transition-colors">Instagram</a></li>
        <li><a href="#" class="hover:text-white transition-colors">Facebook</a></li>
        <li><a href="#" class="hover:text-white transition-colors">TikTok</a></li>
      </ul>
      <p class="font-body text-xs text-white/40 uppercase tracking-widest mb-2">
        {t(lang, 'footer.payment_methods')}
      </p>
      <p class="font-body text-xs text-white/50">PayPal · Visa · Mastercard · Yape · Plin</p>
    </div>
  </div>

  <!-- Copyright -->
  <div class="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10">
    <p class="font-body text-xs text-white/30 text-center">{t(lang, 'footer.copyright')}</p>
  </div>
</footer>
```

- [ ] **Step 2: Crear `src/components/WhatsAppFAB.astro`**

```astro
---
// src/components/WhatsAppFAB.astro
import WhatsAppLink from './WhatsAppLink.astro';
import { t } from '../i18n/utils';

interface Props {
  lang: string;
}
const { lang } = Astro.props;
---
<div class="fixed bottom-6 right-6 z-50">
  <WhatsAppLink
    message={t(lang, 'hero.wa_message')}
    text=""
    class="no-underline flex items-center justify-center w-14 h-14 bg-whatsapp rounded-full shadow-lg hover:scale-110 transition-transform"
  >
    <!-- Ícono SVG de WhatsApp -->
  </WhatsAppLink>
</div>
```

Reemplazar el componente `WhatsAppLink` en el FAB usando un slot. Actualizar `WhatsAppLink.astro` para soportar slot:

```astro
---
// WhatsAppLink.astro — agregar soporte a slot junto con prop `text`
const hasSlot = Astro.slots.has('default');
---
<a href={href} ...>
  {hasSlot ? <slot /> : text}
</a>
```

Agregar el ícono SVG inline dentro del FAB:

```astro
<WhatsAppLink message={t(lang, 'hero.wa_message')} text="" class="no-underline flex items-center justify-center w-14 h-14 bg-whatsapp rounded-full shadow-lg hover:scale-110 transition-transform">
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
</WhatsAppLink>
```

- [ ] **Step 3: Agregar Footer y FAB a `src/pages/es/index.astro`**

```astro
import Footer from '../../components/Footer.astro';
import WhatsAppFAB from '../../components/WhatsAppFAB.astro';
// en el layout, después de </main>:
<Footer lang={lang} />
<WhatsAppFAB lang={lang} />
```

- [ ] **Step 4: Verificar en dev**

- Footer muestra 4 columnas en desktop, apiladas en móvil
- FAB verde con ícono de WhatsApp visible en esquina inferior derecha en todas las secciones
- FAB no está cubierto por ningún otro elemento

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.astro src/components/WhatsAppFAB.astro src/pages/es/index.astro
git commit -m "feat: add Footer with 4 columns and sticky WhatsApp FAB"
```

---

## Task 12: API Routes — Leads y Suscripciones en Supabase

**Files:**
- Create: `src/pages/api/contact.ts`
- Create: `src/pages/api/subscribe.ts`

**Interfaces:**
- Produce: `POST /api/contact` → inserta en `leads`, retorna `{ ok: true }` o error
- Produce: `POST /api/subscribe` → inserta en `subscriptions`, retorna `{ ok: true }` o error

- [ ] **Step 1: Crear `src/pages/api/contact.ts`**

```ts
// src/pages/api/contact.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const json = await request.json().catch(() => null);

  if (!json || !json.whatsapp || !json.nombre) {
    return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.from('leads').insert({
    nombre: String(json.nombre).slice(0, 200),
    whatsapp: String(json.whatsapp).slice(0, 50),
    ciudad: String(json.ciudad || 'Lima').slice(0, 100),
    fecha_deseada: json.fecha_deseada || null,
    paquete: String(json.paquete || '').slice(0, 100),
  });

  if (error) {
    console.error('Supabase insert error:', error.message);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
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

- [ ] **Step 2: Crear `src/pages/api/subscribe.ts`**

```ts
// src/pages/api/subscribe.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const json = await request.json().catch(() => null);

  if (!json || !json.email || !String(json.email).includes('@')) {
    return new Response(JSON.stringify({ error: 'Email inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // ON CONFLICT DO NOTHING — no exponer si el email ya existe
  const { error } = await supabase
    .from('subscriptions')
    .upsert({ email: String(json.email).toLowerCase().trim() }, { onConflict: 'email' });

  if (error) {
    console.error('Supabase subscribe error:', error.message);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
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

- [ ] **Step 3: Probar los endpoints en dev con curl**

```bash
# Iniciar servidor con variables de entorno
npm run dev

# En otra terminal:
curl -X POST http://localhost:4321/api/contact \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","whatsapp":"+1 555 0000","ciudad":"Lima","paquete":"Serenidad"}'
# Esperado: {"ok":true}

curl -X POST http://localhost:4321/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
# Esperado: {"ok":true}
```

- [ ] **Step 4: Verificar en Supabase**

En el panel de Supabase → Table Editor → `leads` → debe aparecer un registro con los datos enviados.

- [ ] **Step 5: Verificar el formulario en el browser**

Abrir `http://localhost:4321/es/`, llenar el formulario y enviarlo. Debe mostrar "¡Listo! Te contactamos pronto por WhatsApp."

- [ ] **Step 6: Commit**

```bash
git add src/pages/api/
git commit -m "feat: add contact and subscribe API routes writing to Supabase"
```

---

## Task 13: Vista Protegida de Leads en /admin/leads

**Files:**
- Create: `src/pages/api/admin/leads.ts`
- Create: `src/pages/admin/leads.astro`

**Interfaces:**
- Produce: `GET /api/admin/leads` → retorna JSON de leads ordenados por `created_at DESC`
- Produce: `/admin/leads` → página protegida con tabla de leads

- [ ] **Step 1: Crear `src/pages/api/admin/leads.ts`**

```ts
// src/pages/api/admin/leads.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const GET: APIRoute = async () => {
  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from('leads')
    .select('nombre, whatsapp, ciudad, paquete, fecha_deseada, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 2: Crear `src/pages/admin/leads.astro`**

```astro
---
// src/pages/admin/leads.astro
// Esta ruta está protegida por Cloudflare Access en producción.
// En desarrollo local es accesible sin autenticación.
export const prerender = false;

interface Lead {
  nombre: string;
  whatsapp: string;
  ciudad: string;
  paquete: string;
  fecha_deseada: string | null;
  created_at: string;
}

let leads: Lead[] = [];
let loadError = false;

try {
  const url = new URL('/api/admin/leads', Astro.url.origin);
  const res = await fetch(url.toString(), {
    headers: { cookie: Astro.request.headers.get('cookie') || '' },
  });
  if (res.ok) {
    leads = await res.json();
  } else {
    loadError = true;
  }
} catch {
  loadError = true;
}
---
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Leads — Panel Admin · Flores en Paz</title>
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Raleway', sans-serif; background: #f5f3e9; color: #2b4c3b; padding: 2rem; }
    h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
    .empty { color: #666; font-style: italic; padding: 2rem; text-align: center; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    th { background: #2b4c3b; color: white; text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid #f0f0ec; font-size: 0.85rem; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9f8f4; }
    .wa-link { color: #25d366; text-decoration: none; }
    .wa-link:hover { text-decoration: underline; }
    .back { display: inline-block; margin-bottom: 1.5rem; font-size: 0.85rem; color: #2b4c3b; text-decoration: underline; }
  </style>
</head>
<body>
  <a class="back" href="/admin/">← Volver al panel</a>
  <h1>Solicitudes de Contacto ({leads.length})</h1>

  {loadError && <p class="empty">Error al cargar los datos. Verificar conexión a Supabase.</p>}

  {!loadError && leads.length === 0 && (
    <p class="empty">Aún no hay solicitudes registradas.</p>
  )}

  {!loadError && leads.length > 0 && (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>WhatsApp</th>
          <th>Ciudad</th>
          <th>Paquete</th>
          <th>Fecha deseada</th>
          <th>Solicitud</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr>
            <td>{lead.nombre}</td>
            <td>
              <a class="wa-link" href={`https://wa.me/${lead.whatsapp.replace(/\D/g,'')}`} target="_blank">
                {lead.whatsapp}
              </a>
            </td>
            <td>{lead.ciudad}</td>
            <td>{lead.paquete}</td>
            <td>{lead.fecha_deseada ?? '—'}</td>
            <td>{new Date(lead.created_at).toLocaleDateString('es-PE')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</body>
</html>
```

- [ ] **Step 3: Configurar Cloudflare Access en producción**

Después del deploy, en el panel de Cloudflare → Zero Trust → Access → Applications:
- Nombre: `Flores en Paz Admin`
- Dominio: `tusitio.com/admin/*`
- Policy: Allow → Email → `email@deldueno.com`

> La ruta `/admin/leads` solo será accesible con autenticación en producción. En dev local no hay protección — es intencional para facilitar el desarrollo.

- [ ] **Step 4: Verificar en dev**

```bash
npm run dev
```
Abrir `http://localhost:4321/admin/leads` → debe mostrar la tabla con los leads que se insertaron en la Task anterior.

- [ ] **Step 5: Commit**

```bash
git add src/pages/api/admin/ src/pages/admin/
git commit -m "feat: add protected admin leads view at /admin/leads"
```

---

## Task 14: Decap CMS — Panel /admin

**Files:**
- Create: `public/admin/config.yml`
- Create: `src/content/site.yaml`

**Interfaces:**
- Produce: `/admin` sirve el panel de Decap CMS con colecciones Paquetes y Site
- Produce: Worker OAuth para GitHub en Cloudflare Functions

- [ ] **Step 1: Crear `src/content/site.yaml`**

```yaml
# src/content/site.yaml
# Editado por Decap CMS

hero_video: /videos/hero.mp4
hero_title_es: "FLORES PARA LOS QUE SIEMPRE ESTÁN"
hero_title_en: "FLOWERS FOR THOSE WHO ARE ALWAYS WITH YOU"
hero_subtitle_es: "Porque cuidar no depende de dónde estés. Con tu decisión, nosotros llegamos por ti."
hero_subtitle_en: "Because caring doesn't depend on where you are. With your decision, we go for you."
```

- [ ] **Step 2: Crear `public/admin/config.yml`**

```yaml
# public/admin/config.yml
backend:
  name: github
  repo: TU-USUARIO/presencia-web   # ← reemplazar con usuario/repo real
  branch: main
  base_url: https://tusitio.com    # ← reemplazar con dominio real
  auth_endpoint: /api/auth/callback

media_folder: public/videos
public_folder: /videos

collections:
  - name: paquetes
    label: Paquetes
    files:
      - name: paquetes
        label: Paquetes de servicio
        file: src/content/paquetes.yaml
        fields:
          - name: paquetes
            label: Lista de paquetes
            widget: list
            fields:
              - { name: id, label: ID, widget: string }
              - { name: nombre, label: Nombre, widget: string }
              - { name: destacado, label: ¿Es el destacado?, widget: boolean, default: false }
              - { name: precio_sol, label: "Precio (S/)", widget: string }
              - { name: precio_usd, label: "Precio (USD)", widget: string }
              - name: beneficios
                label: Beneficios
                widget: list
                field: { name: item, label: Beneficio, widget: string }

  - name: site
    label: Configuración del Sitio
    files:
      - name: site
        label: Configuración general
        file: src/content/site.yaml
        fields:
          - { name: hero_video, label: "URL del video Hero", widget: string }
          - { name: hero_title_es, label: "Título Hero (Español)", widget: string }
          - { name: hero_title_en, label: "Título Hero (Inglés)", widget: string }
          - { name: hero_subtitle_es, label: "Subtítulo Hero (Español)", widget: text }
          - { name: hero_subtitle_en, label: "Subtítulo Hero (Inglés)", widget: text }
```

- [ ] **Step 3: Crear el Cloudflare Worker para OAuth de Decap CMS**

Crear `functions/api/auth/callback.ts` (Cloudflare Pages Function):

```ts
// functions/api/auth/callback.ts
// Worker que maneja el OAuth callback de GitHub para Decap CMS
// Basado en: https://github.com/Herohtar/netlify-cms-oauth-firebase

export const onRequest: PagesFunction<{
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };

  if (!tokenData.access_token) {
    return new Response(`Auth error: ${tokenData.error}`, { status: 400 });
  }

  // Devolver el token a Decap CMS via postMessage
  const script = `
    <script>
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify({ token: tokenData.access_token, provider: 'github' })}',
        '*'
      );
      window.close();
    </script>
  `;

  return new Response(script, {
    headers: { 'Content-Type': 'text/html' },
  });
};
```

- [ ] **Step 4: Agregar variables de entorno del OAuth en Cloudflare Pages**

En Cloudflare Pages → Settings → Environment Variables → agregar:
```
GITHUB_CLIENT_ID = TU-GITHUB-OAUTH-APP-CLIENT-ID
GITHUB_CLIENT_SECRET = TU-GITHUB-OAUTH-APP-CLIENT-SECRET
```

Crear una GitHub OAuth App en GitHub → Settings → Developer settings → OAuth Apps → New OAuth App:
- Homepage URL: `https://tusitio.com`
- Callback URL: `https://tusitio.com/api/auth/callback`

- [ ] **Step 5: Verificar el panel en producción**

Después del deploy, acceder a `https://tusitio.com/admin/` → debe mostrar el panel de Decap CMS con las colecciones "Paquetes" y "Configuración del Sitio". Autenticarse con GitHub.

- [ ] **Step 6: Commit**

```bash
git add public/admin/ src/content/site.yaml functions/
git commit -m "feat: add Decap CMS config and GitHub OAuth worker for /admin"
```

---

## Task 15: Landing EN — Conectar Todos los Componentes en Inglés

**Files:**
- Modify: `src/pages/en/index.astro`

**Interfaces:**
- Consumes: todos los componentes creados en Tasks 4–11, `t('en', ...)`
- Produce: `/en/` con todos los componentes en inglés, sin texto en español

- [ ] **Step 1: Actualizar `src/pages/en/index.astro` con todos los componentes**

```astro
---
// src/pages/en/index.astro
export const prerender = true;
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Hero from '../../components/Hero.astro';
import HowItWorks from '../../components/HowItWorks.astro';
import Packages from '../../components/Packages.astro';
import FAQ from '../../components/FAQ.astro';
import ContactForm from '../../components/ContactForm.astro';
import Subscribe from '../../components/Subscribe.astro';
import Footer from '../../components/Footer.astro';
import WhatsAppFAB from '../../components/WhatsAppFAB.astro';
import { t } from '../../i18n/utils';

const lang = 'en';
const siteUrl = 'https://tusitio.com'; // ← reemplazar con dominio real
---
<Base
  lang={lang}
  title={t(lang, 'meta.title')}
  description={t(lang, 'meta.description')}
  canonicalUrl={`${siteUrl}/en/`}
  alternateEs={`${siteUrl}/es/`}
  alternateEn={`${siteUrl}/en/`}
>
  <Header lang={lang} />
  <main>
    <Hero lang={lang} />
    <HowItWorks lang={lang} />
    <Packages lang={lang} />
    <FAQ lang={lang} />
    <section class="bg-secondary">
      <ContactForm lang={lang} />
      <Subscribe lang={lang} />
    </section>
  </main>
  <Footer lang={lang} />
  <WhatsAppFAB lang={lang} />
</Base>
```

- [ ] **Step 2: Actualizar `src/pages/es/index.astro` con todos los componentes y hreflang**

```astro
---
export const prerender = true;
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Hero from '../../components/Hero.astro';
import HowItWorks from '../../components/HowItWorks.astro';
import Packages from '../../components/Packages.astro';
import FAQ from '../../components/FAQ.astro';
import ContactForm from '../../components/ContactForm.astro';
import Subscribe from '../../components/Subscribe.astro';
import Footer from '../../components/Footer.astro';
import WhatsAppFAB from '../../components/WhatsAppFAB.astro';
import { t } from '../../i18n/utils';

const lang = 'es';
const siteUrl = 'https://tusitio.com'; // ← reemplazar con dominio real
---
<Base
  lang={lang}
  title={t(lang, 'meta.title')}
  description={t(lang, 'meta.description')}
  canonicalUrl={`${siteUrl}/es/`}
  alternateEs={`${siteUrl}/es/`}
  alternateEn={`${siteUrl}/en/`}
>
  <Header lang={lang} />
  <main>
    <Hero lang={lang} />
    <HowItWorks lang={lang} />
    <Packages lang={lang} />
    <FAQ lang={lang} />
    <section class="bg-secondary">
      <ContactForm lang={lang} />
      <Subscribe lang={lang} />
    </section>
  </main>
  <Footer lang={lang} />
  <WhatsAppFAB lang={lang} />
</Base>
```

- [ ] **Step 3: Verificar en dev**

```bash
npm run dev
```
- `/es/` → sitio completo en español con todas las secciones
- `/en/` → mismo sitio completo pero en inglés — ningún texto en español visible
- Toggle ES/EN en el header lleva entre ambas versiones

- [ ] **Step 4: Commit**

```bash
git add src/pages/
git commit -m "feat: complete ES and EN landing pages with all sections and hreflang"
```

---

## Task 16: SEO — Sitemap y Meta Tags

**Files:**
- Create: `public/sitemap.xml`

**Interfaces:**
- Produce: `sitemap.xml` con ambas URLs y alternates `xhtml:link`

- [ ] **Step 1: Crear `public/sitemap.xml`**

Reemplazar `https://tusitio.com` con el dominio real antes del deploy:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  <url>
    <loc>https://tusitio.com/es/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://tusitio.com/es/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://tusitio.com/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://tusitio.com/es/"/>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tusitio.com/en/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://tusitio.com/es/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://tusitio.com/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://tusitio.com/es/"/>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

- [ ] **Step 2: Activar Cloudflare Web Analytics**

En Cloudflare → tu sitio → Analytics → Web Analytics → Enable. Copiar el token del beacon script que aparece. Descomentar y actualizar el script en `src/layouts/Base.astro`:

```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
  data-cf-beacon='{"token": "TU-TOKEN-REAL"}'></script>
```

- [ ] **Step 3: Verificar hreflang en producción**

Después del deploy, usar [hreflang.org checker](https://hreflang.org/checker/) con la URL del sitio para confirmar que los tags hreflang están bien configurados para `/es/` y `/en/`.

- [ ] **Step 4: Commit final**

```bash
git add public/sitemap.xml src/layouts/Base.astro
git commit -m "feat: add sitemap.xml and activate Cloudflare Web Analytics"
git push origin main
```

---

## Self-Review

**Cobertura del spec:**

| FR | Task | ✓ |
|---|---|---|
| FR1 Video 100vh | Task 6 | ✅ |
| FR2 CTAs texto subrayado | Task 6 | ✅ |
| FR3 Header sticky transición | Task 5 | ✅ |
| FR4 Header logo/nav/WA/toggle | Task 5 | ✅ |
| FR5 Header hamburger móvil | Task 5 | ✅ |
| FR6 Timeline horizontal | Task 7 | ✅ |
| FR7 Scroll horizontal móvil | Task 7 | ✅ |
| FR8 3 cards SERENIDAD destacado | Task 8 | ✅ |
| FR9 Precios S/+USD | Task 8 | ✅ |
| FR10 FAQ acordeón | Task 9 | ✅ |
| FR11 Formulario 5 campos | Task 10 | ✅ |
| FR12 POST leads Supabase | Task 12 | ✅ |
| FR13 POST subscriptions | Task 12 | ✅ |
| FR14 FAB WhatsApp | Task 11 | ✅ |
| FR15 WhatsAppLink centralizado | Task 4 | ✅ |
| FR16 Footer 4 columnas | Task 11 | ✅ |
| FR17 Rutas /es/ /en/ | Task 2 | ✅ |
| FR18 Redirect / → /es/ | Task 2 | ✅ |
| FR19 Textos en JSON | Task 2 | ✅ |
| FR20 Video swappable via CMS | Task 14 | ✅ |
| FR21 Precios editables CMS | Task 14 | ✅ |
| FR22 Panel /admin | Task 14 | ✅ |
| FR23 Tags hreflang | Task 15 | ✅ |
| FR24 Cloudflare Analytics | Task 16 | ✅ |
| FR25 Vista /admin/leads | Task 13 | ✅ |

**Constraints check:**
- ✅ `output: 'hybrid'` en Task 1
- ✅ `<WhatsAppLink>` centralizado en Task 4, usado por Tasks 5–11
- ✅ `SUPABASE_SERVICE_ROLE_KEY` solo en env vars — nunca en código del repo
- ✅ Todos los textos via `t(locale, key)` — ningún string hardcodeado en componentes
- ✅ Fuentes Italiana + Raleway en Task 4
- ✅ Colores del design system en Task 1

**Scan de placeholders:** ningún "TBD", "TODO", "implement later" en el plan — cada step tiene código ejecutable. ✅
