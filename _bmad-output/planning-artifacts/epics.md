---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/superpowers/specs/2026-09-25-flores-en-paz-ux-design.md
  - _bmad-output/planning-artifacts/DESIGN.md
  - _bmad-output/planning-artifacts/EXPERIENCE.md
  - _bmad-output/planning-artifacts/architecture/architecture-presencia-web-2026-09-25/ARCHITECTURE-SPINE.md
---

# presencia-web - Epic Breakdown

## Overview

Este documento desglosa todos los requisitos del proyecto Flores en Paz / Siempre Presente en Epics y Stories accionables para el desarrollador freelancer. El sitio tiene un único objetivo de negocio: convertir visitantes en contactos de WhatsApp.

## Requirements Inventory

### Functional Requirements

FR1: El sitio debe mostrar un Hero de video a pantalla completa (100vh) con autoplay, muted y loop, cubriendo todo el lienzo.
FR2: El Hero debe mostrar título, subtítulo y dos CTAs como texto subrayado (sin apariencia de botón).
FR3: El Header debe ser sticky, transparente sobre el Hero y volverse opaco (crema/blanco) al hacer scroll.
FR4: El Header debe mostrar logo textual, navegación de 4 ítems, botón WhatsApp y toggle de idioma ES/EN.
FR5: En móvil, el Header debe mostrar hamburger menu con WhatsApp siempre visible.
FR6: La sección "Cómo Funciona" debe mostrar un timeline horizontal de 4 pasos con línea conectora en todos los dispositivos.
FR7: La sección "Cómo Funciona" debe tener scroll horizontal en móvil si no cabe en pantalla.
FR8: La sección "Paquetes" debe mostrar 3 cards (Esencial, Serenidad, Memoria Viva) con SERENIDAD destacado como "más elegido".
FR9: Cada card de Paquetes debe mostrar precio en S/ con equivalente en USD secundario y un enlace WhatsApp.
FR10: La sección FAQ debe implementarse como acordeón expandible con máximo 5 preguntas.
FR11: El formulario de contacto debe tener 5 campos: Nombre, WhatsApp, Ciudad (dropdown), Fecha y Paquete (dropdown).
FR12: El formulario debe enviar los datos a Supabase tabla "leads" vía Cloudflare Worker.
FR13: El bloque de suscripción de email debe guardar datos en Supabase tabla "subscriptions" vía Cloudflare Worker.
FR14: Debe existir un FAB (Floating Action Button) de WhatsApp en esquina inferior derecha, siempre visible en móvil y desktop.
FR15: Todos los enlaces de WhatsApp deben usar un componente centralizado `<WhatsAppLink>` que dispare el evento de analytics `whatsapp_click`.
FR16: El Footer debe tener 4 columnas (Marca, Servicios, Legal, Redes) y mostrar métodos de pago.
FR17: El sitio debe existir en dos idiomas: español (/es/) e inglés (/en/) como rutas separadas.
FR18: La ruta raíz (/) debe redirigir automáticamente a /es/.
FR19: Todos los textos visibles del sitio deben estar en archivos de traducción es.json y en.json — nada hardcodeado en componentes.
FR20: El video del Hero debe poder ser reemplazado via panel Decap CMS sin tocar código.
FR21: Los precios y textos de los paquetes deben ser editables desde el panel Decap CMS.
FR22: El panel de administración Decap CMS debe estar disponible en /admin.
FR23: Tags hreflang deben generarse para ambos idiomas para SEO.
FR24: Cloudflare Web Analytics debe estar integrado (sin cookies).
FR25: El panel de administración debe incluir una vista protegida de solo lectura de los leads capturados (nombre, WhatsApp, ciudad, fecha, paquete, fecha de solicitud), accesible desde /admin/leads sin necesitar acceder a Supabase directamente.

### Non-Functional Requirements

NFR1: El sitio debe ser mobile-first — la experiencia primaria se diseña para móvil y se adapta a desktop.
NFR2: El video del Hero no debe superar 50MB para mantener tiempos de build y deploy aceptables.
NFR3: Las tipografías Italiana (headings) y Raleway (body) se cargan desde Google Fonts con font-display: swap.
NFR4: El tiempo de carga inicial (LCP) debe ser aceptable para usuarios en conexiones móviles desde el exterior.
NFR5: El sitio debe cumplir WCAG AA de contraste mínimo — texto blanco sobre video requiere overlay oscuro al 40%.
NFR6: Los objetivos táctiles (enlaces, headers FAQ) deben tener un área mínima de 44x44px.
NFR7: El service role key de Supabase debe vivir exclusivamente en variables de entorno de Cloudflare — nunca en el cliente.
NFR8: RLS (Row Level Security) debe estar activo en las tablas de Supabase.
NFR9: El deploy debe ser automático desde la rama main de GitHub.
NFR10: El proyecto Supabase debe ser exclusivo para presencia-web, separado de otros proyectos.

### Additional Requirements (Architecture)

- **Stack:** Astro con `output: 'hybrid'` y adapter `@astrojs/cloudflare`. Tailwind CSS para estilos.
- **Worker OAuth:** El freelancer debe implementar un Cloudflare Worker para el OAuth callback de Decap CMS con GitHub.
- **API Routes:** `/api/contact.ts` y `/api/subscribe.ts` como Astro API routes que se ejecutan como Workers.
- **Estructura de contenido:** Archivos YAML en `src/content/` (paquetes.yaml, site.yaml) gestionados por Decap CMS.
- **Video:** Archivo en `/public/videos/hero.mp4`, servido por Cloudflare CDN.
- **Componente WhatsApp centralizado:** Todos los CTAs de WhatsApp pasan por `<WhatsAppLink>` — nunca inline.
- **Evento analytics:** Cada instancia de `<WhatsAppLink>` dispara el evento `whatsapp_click` a Cloudflare Web Analytics.
- **i18n Astro nativo:** Configurado en `astro.config.mjs` con defaultLocale 'es'.
- **Tablas Supabase:** `leads` y `subscriptions` con SQL definido en FREELANCER-BRIEF.md.

### UX Design Requirements

UX-DR1: El Header debe ser transparente inicialmente sobre el video y transicionar a fondo sólido crema/blanco con sombra sutil al hacer scroll.
UX-DR2: Los CTAs del Hero deben ser texto subrayado minimalista — sin bordes, sin fondo, sin apariencia de botón convencional.
UX-DR3: El overlay del video Hero debe ser negro o verde oscuro al exactamente 40% de opacidad.
UX-DR4: La sección "Cómo Funciona" debe usar timeline horizontal estricto — NOT un layout vertical apilado en ningún breakpoint.
UX-DR5: En la sección Paquetes, SERENIDAD debe aparecer primero en el orden del DOM en móvil (no solo visualmente).
UX-DR6: El componente `<WhatsAppLink>` debe generar mensajes pre-filled específicos por contexto (ej: "me interesa el paquete Serenidad").
UX-DR7: El Footer debe repetir el tagline "Porque cuidar no depende de dónde estés" para cerrar el loop emocional.
UX-DR8: El acordeón FAQ debe tener solo una pregunta abierta a la vez (single-expand behavior).
UX-DR9: Todos los textos en español deben usar "tú/ti" en contextos emocionales y "usted" solo en formulario/legal.
UX-DR10: La paleta de colores: primary #2b4c3b, secondary #f5f3e9, accent #ffffff, whatsapp #25d366.

### FR Coverage Map

| FR | Epic | Descripción |
|---|---|---|
| FR1 | Epic 2 | Video Hero 100vh autoplay |
| FR2 | Epic 2 | CTAs texto subrayado en Hero |
| FR3 | Epic 2 | Header sticky con transición scroll |
| FR4 | Epic 2 | Header: logo, nav, WhatsApp, toggle idioma |
| FR5 | Epic 2 | Header móvil hamburger |
| FR6 | Epic 2 | Timeline horizontal "Cómo Funciona" |
| FR7 | Epic 2 | Scroll horizontal en móvil |
| FR8 | Epic 2 | Cards paquetes, SERENIDAD destacado |
| FR9 | Epic 2 | Precios S/+USD + enlace WhatsApp por card |
| FR10 | Epic 2 | FAQ acordeón single-expand |
| FR11 | Epic 3 | Formulario 5 campos |
| FR12 | Epic 3 | POST /api/contact → Supabase leads |
| FR13 | Epic 3 | POST /api/subscribe → Supabase subscriptions |
| FR14 | Epic 2 | FAB WhatsApp flotante |
| FR15 | Epic 2 | Componente `<WhatsAppLink>` centralizado |
| FR16 | Epic 2 | Footer 4 columnas |
| FR17 | Epic 4 | Rutas /es/ y /en/ |
| FR18 | Epic 1 | Redirect / → /es/ (scaffold i18n) |
| FR19 | Epic 4 | Traducciones en.json completas |
| FR20 | Epic 2 | Video swappable via Decap CMS (al final Epic 2) |
| FR21 | Epic 2 | Precios/textos editables via Decap CMS |
| FR22 | Epic 2 | Panel /admin disponible |
| FR23 | Epic 4 | Tags hreflang para SEO |
| FR24 | Epic 4 | Cloudflare Web Analytics integrado |
| FR25 | Epic 3 | Vista /admin/leads protegida (Cloudflare Access) |

**Todos los 25 FRs cubiertos ✅**

## Epic List

### Epic 1: Fundación del Proyecto y Pipeline
El freelancer puede arrancar a desarrollar desde día uno con el stack correcto (Astro + Cloudflare + Tailwind), Supabase configurado con tablas y RLS, el scaffold de i18n funcionando (rutas /es/ /en/, archivos es.json/en.json, helper t()), el redirect / → /es/ activo, y el deploy automático desde GitHub operativo.

**FRs cubiertos:** FR18 (scaffold i18n + redirect), NFR7, NFR8, NFR9, NFR10 + todos los requisitos de Arquitectura (adapter Cloudflare, tablas SQL, variables entorno, estructura carpetas)

---

### Epic 2: Landing Page Completa en Español + CMS
Un visitante en español puede llegar al sitio, ver el video a pantalla completa, leer el mensaje emocional, entender el proceso en el timeline horizontal, comparar los 3 paquetes, leer el FAQ y contactar por WhatsApp — todo desde móvil o desktop. Al finalizar este epic, el dueño del negocio también puede editar precios, textos y el video del Hero desde el panel /admin sin tocar código.

**FRs cubiertos:** FR1–FR10, FR14–FR16, FR20–FR22 + todos los UX-DRs + NFR1–6

---

### Epic 3: Captura de Leads, Suscripciones y Vista Admin
Un visitante puede enviar sus datos de contacto o suscribirse al boletín, y el equipo de Flores en Paz puede ver todos los leads directamente desde una vista protegida en /admin/leads — sin necesidad de acceder a Supabase.

**FRs cubiertos:** FR11, FR12, FR13, FR25

---

### Epic 4: Traducción al Inglés y SEO Internacional
Un familiar peruano que vive en el exterior y busca en Google en inglés puede encontrar el sitio, leerlo en inglés y convertir exactamente igual que en español. Google indexa ambas versiones con hreflang correcto. Analytics activado.

**FRs cubiertos:** FR17, FR19, FR23, FR24

---

## Epic 1: Fundación del Proyecto y Pipeline

El freelancer puede arrancar a desarrollar desde día uno con el stack correcto (Astro + Cloudflare + Tailwind), Supabase configurado con tablas y RLS, el scaffold de i18n funcionando (rutas /es/ /en/, archivos es.json/en.json, helper t()), el redirect / → /es/ activo, y el deploy automático desde GitHub operativo.

### Story 1.1: Inicialización del Proyecto Astro con Cloudflare y Tailwind

Como **freelancer desarrollador**,
quiero inicializar el proyecto Astro con el adapter de Cloudflare, Tailwind CSS y la estructura de carpetas correcta,
para que el entorno de desarrollo esté listo y el primer deploy a Cloudflare Pages funcione sin configuración adicional.

**Acceptance Criteria:**

**Given** un repositorio Git vacío conectado a Cloudflare Pages
**When** el freelancer ejecuta `npm run build`
**Then** el proyecto compila sin errores y el deploy a Cloudflare Pages es exitoso

**And** `astro.config.mjs` usa `output: 'hybrid'` y el adapter `@astrojs/cloudflare`
**And** Tailwind CSS está configurado con las variables de diseño: colores `#2b4c3b`, `#f5f3e9`, `#ffffff`, `#25d366`; fuentes Italiana y Raleway desde Google Fonts con `font-display: swap`
**And** la estructura de carpetas coincide exactamente con la definida en el FREELANCER-BRIEF.md
**And** existe una página placeholder en `/es/index.astro` que renderiza "Hola Flores en Paz" y es accesible en la URL de preview de Cloudflare

---

### Story 1.2: Scaffold de Internacionalización (i18n)

Como **visitante del sitio**,
quiero que el sitio tenga rutas separadas `/es/` e `/en/` configuradas desde el inicio,
para que todos los componentes que se creen en el Epic 2 ya usen el sistema de traducciones correcto sin refactoring posterior.

**Acceptance Criteria:**

**Given** el proyecto Astro inicializado
**When** el visitante accede a la URL raíz `/`
**Then** es redirigido automáticamente a `/es/`

**And** el archivo `src/i18n/es.json` existe con al menos las claves de placeholder: `nav`, `hero`, `howItWorks`, `packages`, `faq`, `form`, `footer`
**And** el archivo `src/i18n/en.json` existe con las mismas claves (contenido puede ser placeholder en esta story)
**And** existe un helper `t('clave')` en `src/i18n/utils.ts` que recibe el locale actual y retorna el texto correcto
**And** `src/pages/en/index.astro` renderiza la misma estructura que `/es/` usando el helper `t()` — los textos EN pueden ser placeholders

---

### Story 1.3: Configuración de Supabase y Tablas de Base de Datos

Como **equipo de Flores en Paz**,
quiero que las tablas `leads` y `subscriptions` en Supabase estén creadas con RLS activo,
para que cuando el formulario esté listo en Epic 3 los datos se guarden de forma segura.

**Acceptance Criteria:**

**Given** un proyecto Supabase nuevo exclusivo para presencia-web
**When** se ejecuta el SQL de migración inicial
**Then** la tabla `leads` existe con columnas: `id (uuid)`, `nombre (text)`, `whatsapp (text)`, `ciudad (text)`, `fecha_deseada (date)`, `paquete (text)`, `created_at (timestamptz)`

**And** la tabla `subscriptions` existe con columnas: `id (uuid)`, `email (text unique)`, `created_at (timestamptz)`
**And** RLS está activo en ambas tablas (ningún acceso anónimo permitido)
**And** las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` están configuradas en el panel de Cloudflare Pages — nunca en el repositorio
**And** el `.gitignore` incluye cualquier archivo `.env` local

---

## Epic 2: Landing Page Completa en Español + CMS

Un visitante en español puede llegar al sitio, ver el video a pantalla completa, leer el mensaje emocional, entender el proceso en el timeline horizontal, comparar los 3 paquetes, leer el FAQ y contactar por WhatsApp — todo desde móvil o desktop. Al finalizar este epic, el dueño del negocio también puede editar precios, textos y el video del Hero desde el panel /admin sin tocar código.

### Story 2.1: Componente WhatsAppLink y Header

Como **visitante del sitio**,
quiero ver un header claro con acceso rápido a WhatsApp y al toggle de idioma,
para que desde cualquier punto de la página pueda contactar o cambiar el idioma sin esfuerzo.

**Acceptance Criteria:**

**Given** el visitante carga cualquier página del sitio
**When** el header está visible
**Then** muestra: logo textual "FLORES EN PAZ" (tipografía Italiana), navegación de 4 ítems, enlace WhatsApp y toggle ES/EN como texto simple sin banderas

**And** en desktop el header inicia con fondo transparente sobre el Hero; al hacer scroll más de 80px adquiere fondo crema `#f5f3e9` con `box-shadow` sutil (transición CSS `transition: background 0.3s ease`)
**And** en móvil se muestra hamburger menu + WhatsApp siempre visible aunque el menú esté cerrado
**And** el componente `<WhatsAppLink>` en `src/components/WhatsAppLink.astro` está creado con: prop `message`, renderizado como `<a href="https://wa.me/51XXXXXXXXX?text=...">`, dispara evento `whatsapp_click` a Cloudflare Web Analytics al hacer click
**And** todos los demás enlaces WhatsApp del sitio usan este componente — no hay `href="https://wa.me/..."` inline en ningún otro archivo

---

### Story 2.2: Sección Hero — Video Full Viewport

Como **familiar en el exterior que llega al sitio**,
quiero ver un video a pantalla completa que transmita la esencia del servicio,
para sentir de inmediato que esto es real, cuidadoso y hecho para mí.

**Acceptance Criteria:**

**Given** el visitante carga la página en móvil o desktop
**When** la página termina de cargar
**Then** el video `hero.mp4` ocupa exactamente `100vw × 100vh` sin barras ni espacios laterales/superiores

**And** el video tiene `autoplay`, `muted`, `loop` y `playsinline` — sin controles visibles
**And** hay un overlay `position: absolute` con color `rgba(0,0,0,0.4)` sobre el video (garantizando contraste WCAG AA)
**And** sobre el overlay se muestra: título "FLORES PARA LOS QUE SIEMPRE ESTÁN" en Italiana, subtítulo en Raleway, y dos CTAs como texto subrayado — `ELEGIR UN ARREGLO` y `HABLAR POR WHATSAPP` — sin bordes, sin fondo, sin apariencia de botón
**And** el CTA "HABLAR POR WHATSAPP" usa `<WhatsAppLink>` con mensaje `"Hola, quisiera información sobre Flores en Paz"`
**And** en móvil los CTAs se apilan verticalmente y el título reduce a mínimo 28px legible

---

### Story 2.3: Sección "Cómo Funciona" — Timeline Horizontal

Como **visitante que quiere entender el proceso**,
quiero ver los 4 pasos del servicio en un timeline horizontal,
para entender que es simple y que recibiré prueba visual de la visita.

**Acceptance Criteria:**

**Given** el visitante hace scroll más allá del Hero
**When** llega a la sección "Cómo Funciona"
**Then** los 4 pasos están dispuestos horizontalmente con una línea conectora entre ellos en todos los breakpoints

**And** en móvil si los 4 pasos no caben en pantalla, el contenedor tiene scroll horizontal (`overflow-x: auto`, sin scrollbar visible)
**And** cada paso muestra: número/icono, título y descripción corta
**And** los 4 pasos son: ①Elige cementerio y fecha, ②Elige el arreglo, ③Nosotros llegamos por ti, ④Te hacemos llegar fotos y video
**And** al final del bloque hay un `<WhatsAppLink>` con texto "HABLAR POR WHATSAPP" y mensaje `"Hola, quiero saber cómo funciona el servicio"`
**And** los textos vienen de `es.json` a través del helper `t()` — no hardcodeados en el componente

---

### Story 2.4: Sección Paquetes — 3 Cards de Conversión

Como **visitante que está considerando contratar**,
quiero comparar los 3 paquetes disponibles con sus precios y beneficios,
para elegir el que mejor se adapte a lo que necesito y dar el siguiente paso por WhatsApp.

**Acceptance Criteria:**

**Given** el visitante llega a la sección Paquetes
**When** está en desktop
**Then** las 3 cards (Esencial, Serenidad, Memoria Viva) se muestran horizontalmente lado a lado

**And** en móvil las cards se apilan verticalmente y SERENIDAD aparece primera en el orden del DOM (no solo visualmente con CSS)
**And** la card SERENIDAD tiene una etiqueta visible "Más elegido" y un borde/sombra que la distingue de las otras dos
**And** cada card muestra: nombre del paquete, lista de beneficios con ✓, precio en S/ principal y equivalente USD secundario más pequeño, y un `<WhatsAppLink>` con mensaje pre-filled que incluye el nombre del paquete (ej: `"Hola, me interesa el paquete Serenidad"`)
**And** los precios y textos de los paquetes se leen desde `src/content/paquetes.yaml` — no hardcodeados
**And** al final de la sección hay texto "¿No sabes cuál elegir? Escríbenos, te ayudamos." con `<WhatsAppLink>`

---

### Story 2.5: Sección FAQ — Acordeón

Como **visitante con dudas antes de contratar**,
quiero poder expandir y leer respuestas a las preguntas más frecuentes,
para ganar confianza y resolver mis objeciones sin necesidad de contactar primero.

**Acceptance Criteria:**

**Given** el visitante llega a la sección FAQ
**When** hace click en una pregunta cerrada
**Then** esa pregunta se expande mostrando la respuesta con transición suave

**And** si había otra pregunta abierta, se cierra automáticamente (single-expand behavior)
**And** el ícono cambia de `+` a `−` al expandir
**And** las 5 preguntas están definidas en `es.json` y se renderizan desde ahí
**And** al final del FAQ hay un `<WhatsAppLink>` con texto "ESCRÍBENOS POR WHATSAPP" y mensaje `"Hola, tengo una pregunta sobre el servicio"`
**And** los targets táctiles de cada header del acordeón son mínimo 44×44px

---

### Story 2.6: Footer y FAB WhatsApp

Como **visitante que llegó al final de la página**,
quiero ver información del negocio, links legales y métodos de pago,
para sentir que es una empresa seria y encontrar el acceso al contacto siempre disponible.

**Acceptance Criteria:**

**Given** el visitante llega al Footer
**When** está en desktop
**Then** el footer muestra 4 columnas: Marca (logo + tagline), Servicios, Legal, Redes Sociales

**And** el tagline en la columna Marca es "Porque cuidar no depende de dónde estés." — mismo texto que el subtítulo del Hero
**And** los métodos de pago (PayPal, Visa, Mastercard, Yape, Plin) se muestran como iconos o texto
**And** en móvil las 4 columnas se apilan verticalmente
**And** el FAB de WhatsApp (ícono flotante, esquina inferior derecha) es visible en todo momento en todas las secciones — desktop y móvil — y usa `<WhatsAppLink>` con mensaje `"Hola, quisiera información sobre Flores en Paz"`
**And** el FAB tiene `position: fixed`, `z-index` alto y área táctil mínima de 44×44px

---

### Story 2.7: Configuración de Panel Admin Nativo (SSR)

Como **dueño del negocio**,
quiero acceder a un panel en `/admin` donde pueda editar precios, textos de paquetes y cambiar la URL del video del Hero,
para no depender del freelancer cada vez que necesite actualizar información básica del sitio.

**Acceptance Criteria:**

**Given** el dueño del negocio accede a `tusitio.com/admin`
**When** no está autenticado
**Then** el middleware lo redirige a `/admin/login` para pedir un Magic Link de Supabase Auth

**And** al ingresar su correo autorizado, recibe un link que lo autentica
**And** el panel de administración usa Astro SSR (`export const prerender = false`)
**And** existe una vista de "Configuración del Sitio" donde puede editar y guardar variables globales en Supabase (ej. URL del video Hero, título)
**And** existe una vista de "Paquetes" donde puede editar por cada paquete: nombre, precio S/, precio USD, y beneficios
**And** los cambios se persisten inmediatamente en la base de datos de Supabase sin requerir un nuevo deploy de Cloudflare Pages


---

## Epic 3: Captura de Leads, Suscripciones y Vista Admin

Un visitante puede enviar sus datos de contacto o suscribirse al boletín, y el equipo de Flores en Paz puede ver todos los leads directamente desde una vista protegida en /admin/leads — sin necesidad de acceder a Supabase.

### Story 3.1: Formulario de Contacto con Envío a Supabase

Como **visitante que quiere ser contactado sin chatear en ese momento**,
quiero completar un formulario corto con mis datos y el paquete que me interesa,
para que el equipo de Flores en Paz me contacte en menos de 24 horas por WhatsApp.

**Acceptance Criteria:**

**Given** el visitante completa los 5 campos y hace click en "SOLICITAR ATENCIÓN"
**When** el formulario se envía vía `POST /api/contact`
**Then** el Worker inserta un registro en la tabla `leads` de Supabase con: nombre, whatsapp, ciudad, fecha_deseada, paquete, created_at

**And** si el insert es exitoso, el formulario muestra: *"¡Listo! Te contactamos pronto por WhatsApp."* y los campos se vacían
**And** si el servidor retorna error, se muestra un mensaje amigable sin exponer detalles técnicos
**And** los 5 campos son: Nombre (texto), WhatsApp (teléfono, requerido), Ciudad (dropdown: Lima / Trujillo / Arequipa / Otra), Fecha deseada (date picker nativo), Paquete (dropdown: Esencial / Serenidad / Memoria Viva)
**And** el formulario valida en cliente que WhatsApp no esté vacío antes de enviar
**And** en móvil todos los campos son `width: 100%` y el date picker usa el nativo del dispositivo

---

### Story 3.2: Bloque de Suscripción de Email

Como **visitante que no quiere contratar aún pero quiere recordatorios**,
quiero suscribirme con mi email para recibir recordatorios de fechas especiales,
para no olvidar las fechas importantes aunque hoy no esté listo para contratar.

**Acceptance Criteria:**

**Given** el visitante ingresa su email en el bloque de suscripción y hace click en "SUSCRIBIRME"
**When** el formulario se envía vía `POST /api/subscribe`
**Then** el Worker hace un `INSERT ... ON CONFLICT DO NOTHING` en la tabla `subscriptions`

**And** si es exitoso, aparece: *"¡Gracias! Te avisaremos en las fechas que importan."*
**And** si el email ya existe, el mismo mensaje de éxito se muestra (no revelar que ya estaba registrado)
**And** si el servidor retorna error, aparece un mensaje genérico amigable
**And** el bloque de suscripción está visualmente separado del formulario principal con espaciado o fondo diferente

---

### Story 3.3: Vista Protegida de Leads en /admin/leads

Como **persona que gestiona el sitio web**,
quiero ver todos los leads capturados en una tabla dentro del panel de administración,
para dar seguimiento a los interesados sin necesitar acceder directamente a Supabase.

**Acceptance Criteria:**

**Given** el administrador accede a `tusitio.com/admin/leads` sin estar autenticado
**When** el Middleware de Astro intercepta la petición
**Then** lo redirige a la pantalla de login (Magic Link de Supabase Auth)

**And** una vez autenticado, la página muestra una tabla con todos los registros de `leads` ordenados por `created_at DESC`
**And** la tabla muestra las columnas: Nombre, WhatsApp, Ciudad, Paquete, Fecha Deseada, Fecha de Solicitud
**And** la tabla carga los datos renderizados por SSR desde Supabase de forma segura
**And** si no hay leads aún, la tabla muestra: *"Aún no hay solicitudes registradas."*


---

## Epic 4: Traducción al Inglés y SEO Internacional

Un familiar peruano que vive en el exterior y busca en Google en inglés puede encontrar el sitio, leerlo en inglés y convertir exactamente igual que en español. Google indexa ambas versiones con hreflang correcto. Analytics activado.

### Story 4.1: Traducción Completa al Inglés (en.json)

Como **familiar peruano en el exterior que prefiere leer en inglés**,
quiero leer todo el sitio en inglés fluido y natural,
para entender el servicio sin fricción y sentir que fue pensado para mí aunque esté lejos.

**Acceptance Criteria:**

**Given** el visitante accede a `tusitio.com/en/`
**When** navega por todas las secciones
**Then** todos los textos visibles están en inglés — ningún texto en español aparece en la versión EN

**And** `src/i18n/en.json` tiene todas las claves completadas con traducción real: nav, hero, Cómo Funciona, paquetes, FAQ, formulario, footer
**And** el tono usa "you/your" en contextos emocionales, mantiene la misma voz cálida que el español
**And** los mensajes pre-filled de WhatsApp también están en inglés (ej: `"Hello, I'm interested in the Serenidad package"`)
**And** los precios se muestran en S/ como moneda principal con USD como referencia — no se invierten para la versión EN
**And** el toggle ES/EN en el header funciona correctamente: desde /es/ lleva a /en/ y viceversa

---

### Story 4.2: SEO — Meta Tags, hreflang y Sitemap

Como **motor de búsqueda (Google)**,
quiero encontrar señales claras de que este sitio existe en dos idiomas con URLs canónicas definidas,
para indexar correctamente ambas versiones y mostrarlas al usuario en el idioma correcto según su región.

**Acceptance Criteria:**

**Given** Google crawlea las páginas `/es/` y `/en/`
**When** lee el `<head>` de cada página
**Then** cada página tiene `<title>` y `<meta name="description">` en el idioma correspondiente

**And** cada página tiene los tags `<link rel="alternate" hreflang="es|en">` correctos y `hreflang="x-default"` apuntando a `/es/`
**And** existe `public/sitemap.xml` que lista las URLs de ambos idiomas con `<xhtml:link>` para las alternates
**And** los meta tags Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) están configurados en ambos idiomas para previews atractivas en WhatsApp y redes sociales

---

### Story 4.3: Activación y Verificación de Cloudflare Web Analytics

Como **dueño del negocio**,
quiero tener analytics del sitio funcionando sin cookies desde el día del lanzamiento,
para saber desde el primer día cuántas personas llegan, de qué países y cuántas hacen click en WhatsApp.

**Acceptance Criteria:**

**Given** el sitio está desplegado en producción en Cloudflare Pages
**When** el dueño activa Cloudflare Web Analytics desde el panel de Cloudflare
**Then** el dashboard empieza a registrar: visitas únicas, países de origen, dispositivos, páginas más visitadas

**And** el componente `<WhatsAppLink>` dispara correctamente el evento `whatsapp_click` al Cloudflare Web Analytics Beacon en todos los puntos de conversión: Header, Hero, Cómo Funciona, cada card de Paquetes, FAQ, FAB flotante
**And** el dueño puede ver en el dashboard cuántos eventos `whatsapp_click` se generaron en las últimas 24 horas
**And** el script de Cloudflare Web Analytics no usa cookies y es GDPR-compliant — no se necesita banner de cookies


---

## Epic 5: Catálogo de Arreglos Florales y Gestión en Panel

Como **visitante interesado en rendir homenaje a un familiar**,
quiero visualizar un catálogo de arreglos florales representativos (Lirios, Girasoles, Claveles, Astromelias, Rosas) con sus precios y flores incluidas justo después de entender el servicio,
para elegir el arreglo floral ideal y consultar de inmediato por WhatsApp.

Como **administrador del negocio**,
quiero poder gestionar y actualizar los precios y la disponibilidad de los arreglos desde el panel de administración,
para mantener las ofertas y precios siempre al día sin tocar código.

---

### Story 5.1: Modelo y Componente Visual del Catálogo Floral

Como **visitante de la web**,
quiero ver tarjetas atractivas de arreglos florales con fotografías, desglose de flores y precios en PEN y USD,
para conocer las opciones disponibles antes de decidir el servicio.

**Acceptance Criteria:**
- **Given** el usuario navega en `/es/` o `/en/`
- **When** pasa de la sección "¿Cómo Funciona?" hacia abajo
- **Then** encuentra la sección de Catálogo de Arreglos Florales en un grid responsive (1 col móvil, 2 col tablet, 3 col desktop)
- **And** cada tarjeta muestra foto, nombre del arreglo, tipo de flores (Lirios, Girasoles, Claveles, Astromelias, Rosas), precio dual (`S/` y `$ USD`) y enlace directo a WhatsApp
- **And** al hacer clic en el botón de WhatsApp, el mensaje se abre pre-rellenado con el nombre exacto del arreglo

---

### Story 5.2: Pestaña de Administración del Catálogo en `/admin`

Como **administrador del sitio**,
quiero una pestaña dedicada al catálogo en el panel `/admin`,
para editar precios, flores y visibilidad de cada arreglo.

**Acceptance Criteria:**
- **Given** el administrador ha iniciado sesión en `/admin`
- **When** selecciona la pestaña "Catálogo"
- **Then** se cargan los arreglos existentes desde `/api/admin/config?key=catalogo`
- **And** puede modificar precios (PEN/USD), visibilidad y detalles
- **And** al presionar "Guardar Catálogo", los cambios persisten en Supabase y se reflejan inmediatamente en la landing pública

---

## Epic 6: Sincronización Total Dinámica y Preparación E-commerce Shopify

Como **dueño del negocio y administrador**,
quiero que tanto los Paquetes como el Catálogo Floral sean 100% editables desde el panel de control y estén preparados para enlazar checkouts o botones de Shopify,
para poder actualizar precios, nombres, beneficios y vender directamente online cuando activemos la tienda de Shopify.

---

### Story 6.1: Conexión Dinámica de Paquetes en Landing Page desde Supabase
Como **visitante de la web**,
quiero ver los precios y beneficios actualizados de los paquetes que el administrador configuró en el panel,
para tener información certera y sincronizada.

**Acceptance Criteria:**
- **Given** el administrador actualiza precios o textos de paquetes en `/admin`
- **When** un visitante accede a `/es/` o `/en/`
- **Then** `<Packages.astro>` consume los datos de `site_config.paquetes` en Supabase (con fallback local)
- **And** muestra los valores actualizados sin requerir un nuevo build o deploy de código

---

### Story 6.2: Editor Integral en Panel `/admin` (Catálogo y Paquetes)
Como **administrador del sitio**,
quiero poder editar todos los atributos de los arreglos y paquetes (nombres, precios en Soles y Dólares, beneficios, fotos y URL de compra de Shopify),
para tener control total de la oferta comercial desde un solo lugar.

**Acceptance Criteria:**
- **Given** el administrador en `/admin`
- **When** accede a "Catálogo Floral" o "Paquetes y Precios"
- **Then** puede editar nombres, precios, fotos, beneficios y el campo opcional "URL de Checkout / Producto Shopify"
- **And** puede activar o desactivar la opción "Habilitar compra directa por Shopify" por cada producto/paquete
- **And** los cambios se guardan atómicamente en Supabase

---

### Story 6.3: Botón de Compra Shopify con Fallback a WhatsApp
Como **cliente interesado en comprar o contratar**,
quiero poder hacer clic en "Comprar Ahora" para pagar directamente por Shopify (si está habilitado) o "Consultar por WhatsApp",
para tener una experiencia de compra rápida y sin fricción.

**Acceptance Criteria:**
- **Given** un arreglo o paquete con `shopify_enabled: true` y una URL válida
- **When** el usuario visualiza la tarjeta en la landing
- **Then** se muestra un botón destacado de compra directa hacia Shopify y un enlace secundario para consultas vía WhatsApp
- **And** si no hay URL de Shopify configurada, el botón principal continúa siendo la coordinación por WhatsApp

