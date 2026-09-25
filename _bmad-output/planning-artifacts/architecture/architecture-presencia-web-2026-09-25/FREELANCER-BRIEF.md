# Brief Técnico para Desarrollador Freelancer
**Proyecto:** Flores en Paz / Siempre Presente
**Tipo:** Landing page de conversión (una sola página, dos idiomas)
**Fecha:** 2026-09-25

---

## ¿Qué es esto?

Un sitio web de landing page para un servicio de colocación de flores en cementerios. El sitio tiene un único objetivo: llevar al visitante a contactar por WhatsApp. No tiene e-commerce ni login de usuarios.

---

## Stack Tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **Astro** (`output: 'hybrid'`) | SSG por defecto, API routes como Workers |
| Hosting | **Cloudflare Pages** | Deploy automático desde GitHub `main` |
| Funciones server | **Cloudflare Workers** | Vía Astro API routes + adapter Cloudflare |
| Base de datos | **Supabase** (proyecto nuevo) | Solo para leads y suscripciones |
| CMS | **Decap CMS** | Panel en `/admin`, contenido en YAML |
| CSS | **Tailwind CSS** | Configurado con las variables de diseño |
| Analytics | **Cloudflare Web Analytics** | Sin cookies, activado desde panel CF |
| i18n | **Astro i18n nativo** | Rutas `/es/` y `/en/` |

---

## Tipografía (Google Fonts)

- **Títulos:** `Italiana` (serif)
- **Párrafos y UI:** `Raleway` (sans-serif)
- Cargar con `font-display: swap` para performance.

---

## Paleta de Colores

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#2b4c3b` | Verde oscuro — textos principales, footer |
| `secondary` | `#f5f3e9` | Crema — fondos alternos |
| `accent` | `#ffffff` | Blanco — texto sobre Hero video |
| `whatsapp` | `#25d366` | Verde WhatsApp — solo para CTAs de WA |

---

## Estructura del Proyecto

```
presencia-web/
├── src/
│   ├── components/
│   │   └── WhatsAppLink.astro   ← COMPONENTE CENTRAL — todos los links WA pasan por aquí
│   ├── content/
│   │   ├── config.ts
│   │   ├── paquetes.yaml        ← editado por Decap CMS
│   │   └── site.yaml            ← editado por Decap CMS (hero video path, textos)
│   ├── i18n/
│   │   ├── es.json              ← todos los textos en español
│   │   └── en.json              ← todos los textos en inglés
│   ├── pages/
│   │   ├── es/index.astro       ← landing en español (ruta default)
│   │   ├── en/index.astro       ← landing en inglés
│   │   └── api/
│   │       ├── contact.ts       ← POST → Supabase tabla "leads"
│   │       └── subscribe.ts     ← POST → Supabase tabla "subscriptions"
│   └── layouts/Base.astro
├── public/
│   ├── admin/config.yml         ← configuración de Decap CMS
│   └── videos/hero.mp4          ← video del hero (máx. 50MB)
└── astro.config.mjs
```

---

## Secciones de la Landing Page

En orden de aparición:

1. **Header** — sticky, transparente sobre Hero, opaco al scroll. Logo + nav + botón WhatsApp + toggle ES/EN.
2. **Hero** — video `hero.mp4` en 100vh, overlay oscuro 40%, título en `Italiana`, subtítulo en `Raleway`, 2 CTAs como texto subrayado (sin botones).
3. **Cómo Funciona** — timeline horizontal de 4 pasos. Scroll horizontal en móvil si no cabe.
4. **Paquetes** — 3 cards. "SERENIDAD" destacado con etiqueta "Más elegido". Precios en S/ + USD. Un link WhatsApp por card.
5. **FAQ** — acordeón, máximo 5 preguntas. Un link WhatsApp al final.
6. **Formulario** — 5 campos (nombre, WhatsApp, ciudad, fecha, paquete) + CTA. Separado: campo email para suscripción.
7. **Footer** — 4 columnas, métodos de pago, redes sociales.
8. **FAB WhatsApp** — flotante esquina inferior derecha, siempre visible.

---

## Base de Datos Supabase

### Tabla `leads`
```sql
create table leads (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  whatsapp text not null,
  ciudad text not null,
  fecha_deseada date,
  paquete text,
  created_at timestamptz default now()
);
```

### Tabla `subscriptions`
```sql
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz default now()
);
```

**RLS:** Activar Row Level Security en ambas tablas. El único acceso de escritura es vía `service_role` key desde el Cloudflare Worker.

---

## Variables de Entorno (Cloudflare Pages — nunca en el repo)

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx
```

---

## Tareas Específicas del Freelancer

1. **Configurar Astro** con `@astrojs/cloudflare` adapter y Tailwind CSS.
2. **Implementar Cloudflare Worker OAuth** para Decap CMS (GitHub OAuth callback). Ver: [https://decapcms.org/docs/cloudflare-pages/](https://decapcms.org/docs/cloudflare-pages/)
3. **Configurar Decap CMS** (`public/admin/config.yml`) para editar: precios de paquetes, textos del hero, ruta del video, textos de paquetes en ES y EN.
4. **Crear tablas en Supabase** con el SQL de arriba y activar RLS.
5. **Implementar API routes** `/api/contact.ts` y `/api/subscribe.ts`.
6. **Implementar `<WhatsAppLink>`** con el evento de analytics. Este componente debe usarse en TODOS los puntos de conversión — no implementar el link directo inline.
7. **Activar Cloudflare Web Analytics** desde el panel (sin código adicional).
8. **Configurar i18n** de Astro con rutas `/es/` y `/en/`, archivos `es.json` y `en.json`.
9. **Video Hero:** colocar en `public/videos/hero.mp4`. Confirmar que el archivo no supera 50MB.

---

## Contenido Editable via Decap CMS

El cliente podrá editar sin tocar código:
- Precio de cada paquete (en S/ y en USD)
- Textos del Hero (título, subtítulo) en ES y EN
- Video del Hero (subir nuevo archivo via media library)
- Textos de descripción de cada paquete en ES y EN
- Respuestas del FAQ en ES y EN

---

## Lo que NO entra en v1

- Checkout / pago online
- Notificaciones por email o WhatsApp cuando llega un lead
- Portafolio / galería de fotos
- Testimonios
- Sección de fechas especiales
- Staging environment separado (Cloudflare Pages crea previews por PR automáticamente)
