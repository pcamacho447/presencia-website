# 🌸 Flores en Paz — Presencia Web

> Landing page bilingüe (Español / Inglés) de alta conversión para servicio de colocación de flores en cementerios de Lima, Trujillo y Arequipa.

[![Astro](https://img.shields.io/badge/Astro-4.x-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages%20%26%20Workers-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Decap CMS](https://img.shields.io/badge/Decap%20CMS-3.x-FF007A?logo=decapcms&logoColor=white)](https://decapcms.org)

---

## 📋 Tabla de Contenidos
- [Características Principales](#-características-principales)
- [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Desarrollo Local](#-instalación-y-desarrollo-local)
- [Variables de Entorno](#-variables-de-entorno)
- [Base de Datos (Supabase)](#-base-de-datos-supabase)
- [Panel de Administración (Decap CMS & Leads)](#-panel-de-administración-decap-cms--leads)
- [Despliegue a Producción (Cloudflare Pages)](#-despliegue-a-producción-cloudflare-pages)

---

## ✨ Características Principales

- 📹 **Hero de Video Full Viewport (100vh)**: Video de fondo fluido con overlay al 40% de opacidad para garantizar contraste e legibilidad WCAG AA.
- 📱 **Mobile-First & Responsividad Total**: Diseño adaptado para dispositivos móviles y escritorio.
- 🌐 **Internacionalización Bilingüe (i18n)**: Rutas nativas `/es/` y `/en/` con cambio de idioma fluido, meta tags `hreflang` recíprocos y cero fugas de texto.
- 💐 **Cards de Paquetes Dinámicas**: SERENIDAD posicionado como *"Más elegido"* en primer lugar del DOM para dispositivos móviles. Precios en Soles (S/) y equivalentes en USD.
- 🗺️ **Timeline Horizontal "Cómo Funciona"**: Flujo visual de 4 pasos con conectores continuos y scroll horizontal en dispositivos móviles.
- ❓ **FAQ Acordeón Single-Expand**: 5 preguntas frecuentes con comportamiento de apertura exclusiva de un solo ítem y área táctil accesible (≥44px).
- 📝 **Captura de Leads y Suscripción**: Formulario de contacto de 5 campos y módulo independiente de suscripción de correo conectados a API Routes serverless en Supabase.
- 🔒 **Vista Protegida `/admin/leads`**: Tabla administrativa SSR con acceso directo por WhatsApp (`wa.me`) para consultar las solicitudes recibidas sin ingresar al dashboard de Supabase.
- ⚙️ **Panel Decap CMS (`/admin`)**: Administración del contenido (video Hero, textos bilingües y precios de paquetes) mediante archivos YAML respaldados en GitHub.
- 📊 **Analytics Privado**: Tracking de clicks a WhatsApp (`whatsapp_click`) integrado nativamente con Cloudflare Web Analytics (sin cookies ni banners GDPR).

---

## 🛠 Arquitectura y Stack Tecnológico

- **Framework Frontend**: [Astro 4](https://astro.build) (Modo `output: 'hybrid'`)
- **Adaptador Edge**: `@astrojs/cloudflare`
- **Estilos & Tipografías**: [Tailwind CSS 3](https://tailwindcss.com) + Google Fonts (*Italiana* para títulos y *Raleway* para cuerpo)
- **Base de Datos**: [Supabase](https://supabase.com) (PostgreSQL + Row Level Security)
- **API Runtime**: Cloudflare Workers (Astro API Routes Serverless)
- **CMS**: Decap CMS 3 (Servido en `/admin`)
- **OAuth Backend**: Cloudflare Pages Function (`functions/api/auth/callback.ts`)

---

## 📁 Estructura del Proyecto

```text
presencia-web/
├── functions/
│   └── api/
│       └── auth/
│           └── callback.ts             # Cloudflare Function para GitHub OAuth de Decap CMS
├── public/
│   ├── admin/
│   │   ├── config.yml                  # Configuración de colecciones de Decap CMS
│   │   └── index.html                  # SPA Loader de Decap CMS
│   ├── videos/
│   │   └── hero.mp4                    # Video de fondo para la sección Hero (≤50MB)
│   └── sitemap.xml                     # Sitemap bilingüe XML con hreflang
├── src/
│   ├── components/
│   │   ├── ContactForm.astro           # Formulario de contacto (5 campos)
│   │   ├── FAQ.astro                   # Acordeón de preguntas frecuentes
│   │   ├── Footer.astro                # Pie de página (4 columnas + copyright)
│   │   ├── Header.astro                # Header sticky con transición de scroll
│   │   ├── Hero.astro                  # Video 100vh + CTAs texto subrayado
│   │   ├── HowItWorks.astro            # Timeline horizontal de 4 pasos
│   │   ├── Packages.astro              # Cards de paquetes (SERENIDAD primero en DOM)
│   │   ├── Subscribe.astro             # Bloque de suscripción de email
│   │   ├── WhatsAppFAB.astro           # Botón flotante verde fijo
│   │   └── WhatsAppLink.astro          # Componente centralizado con tracking de analytics
│   ├── content/
│   │   ├── config.ts                   # Schema placeholder de Astro content
│   │   ├── paquetes.yaml               # Datos de los paquetes (editables vía CMS)
│   │   └── site.yaml                   # Textos del hero y video (editables vía CMS)
│   ├── i18n/
│   │   ├── en.json                     # Diccionario de cadenas en inglés
│   │   ├── es.json                     # Diccionario de cadenas en español
│   │   └── utils.ts                    # Helper t(locale, key) y getLangFromUrl
│   ├── layouts/
│   │   └── Base.astro                  # HTML shell, fuentes, SEO, Open Graph y Analytics
│   ├── pages/
│   │   ├── admin/
│   │   │   └── leads.astro             # Vista administrativa SSR de leads capturados
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   └── leads.ts            # Endpoint GET para obtener solicitudes desde Supabase
│   │   │   ├── contact.ts              # Endpoint POST para insertar leads
│   │   │   └── subscribe.ts            # Endpoint POST para insertar suscripciones
│   │   ├── en/
│   │   │   └── index.astro             # Landing completa en Inglés
│   │   ├── es/
│   │   │   └── index.astro             # Landing completa en Español
│   │   ├── config.ts                   # Configuración global del teléfono de WhatsApp
│   │   ├── env.d.ts                    # Tipado TypeScript para variables de entorno
│   │   └── index.astro                 # Redirección automática a /es/
├── supabase/
│   └── migrations/
│       └── 001_initial.sql             # Esquema DDL de las tablas leads y subscriptions con RLS
├── astro.config.mjs                    # Configuración de Astro (hybrid, cloudflare, i18n)
├── tailwind.config.mjs                 # Tokens de colores y fuentes de la marca
├── package.json
└── README.md
```

---

## 🚀 Instalación y Desarrollo Local

### 1. Clonar el repositorio e instalar dependencias:
```bash
git clone https://github.com/TU-USUARIO/presencia-web.git
cd presencia-web
npm install
```

### 2. Configurar variables de entorno locales:
Copia `.env.example` a `.env.local` e ingresa las credenciales de tu proyecto Supabase:
```bash
cp .env.example .env.local
```

### 3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```
Accede en tu navegador a [http://localhost:4321/](http://localhost:4321/).

### 4. Compilar para producción (Build Verification):
```bash
npm run build
```

---

## 🔑 Variables de Entorno

Configura las siguientes variables en el panel de **Cloudflare Pages** (`Settings > Environment Variables`):

| Variable | Descripción | Ubicación |
|---|---|---|
| `SUPABASE_URL` | URL de tu proyecto Supabase (`https://xxx.supabase.co`) | Cloudflare Pages Env |
| `SUPABASE_SERVICE_ROLE_KEY` | Key privada de servicio (`service_role`) de Supabase | Cloudflare Pages Env (Secret) |
| `GITHUB_CLIENT_ID` | Client ID de tu GitHub OAuth App | Cloudflare Pages Env |
| `GITHUB_CLIENT_SECRET` | Client Secret de tu GitHub OAuth App | Cloudflare Pages Env (Secret) |

> ⚠️ **Importante**: La `SUPABASE_SERVICE_ROLE_KEY` **nunca** debe incluirse en el código fuente cliente o archivos commiteados al repositorio. Solo se utiliza dentro de los endpoints serverless de `/api/`.

---

## 🗄️ Base de Datos (Supabase)

Para inicializar las tablas en tu proyecto Supabase:
1. Dirígete al **SQL Editor** en el dashboard de Supabase.
2. Copia y ejecuta el contenido del archivo [`supabase/migrations/001_initial.sql`](file:///C:/papx/presencia-web/supabase/migrations/001_initial.sql).
3. Esto creará:
   - Tabla `leads` (id, nombre, whatsapp, ciudad, fecha_deseada, paquete, created_at).
   - Tabla `subscriptions` (id, email UNIQUE, created_at).
   - Políticas de **Row Level Security (RLS)** activas que bloquean lecturas/escrituras anónimas directas desde el cliente.

---

## 🔐 Panel de Administración (Decap CMS & Leads)

### 1. Gestión de Contenidos (`/admin`)
- Accesible en `https://tusitio.com/admin/`.
- Permite modificar precios, beneficios de los paquetes, textos del hero y la URL del video de fondo.
- Requiere haber creado una **GitHub OAuth App** configurada con:
  - Homepage URL: `https://tusitio.com`
  - Authorization callback URL: `https://tusitio.com/api/auth/callback`

### 2. Dashboard de Leads Capturados (`/admin/leads`)
- Accesible en `https://tusitio.com/admin/leads`.
- Renderiza una tabla con todas las solicitudes de contacto recibidas en tiempo real.
- En producción se recomienda proteger el acceso utilizando **Cloudflare Access (Zero Trust)** mediante reglas de autenticación por Email OTP.

---

## 🌐 Despliegue a Producción (Cloudflare Pages)

1. Conecta tu repositorio de GitHub a **Cloudflare Pages**.
2. Configura los parámetros de build:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Agrega las variables de entorno listadas arriba en la sección `Settings > Environment Variables`.
4. ¡Despliega! Cloudflare compilará automáticamente el sitio estático y desplegará los Workers en el borde.

---

© 2026 Flores en Paz · Todos los derechos reservados.
