# Catálogo de Arreglos Florales Implementation Plan

- **Goal:** Implementar una nueva sección de catálogo visual de arreglos florales (Lirios, Girasoles, Claveles, Astromelias, Rosas) con precios en PEN y USD, botón de conversión directa a WhatsApp, ubicada justo después de "Cómo Funciona", y su correspondiente pestaña de gestión dinámica en el panel de administración (`/admin`).
- **Architecture:** Astro Hybrid SSR desplegado en Cloudflare Workers. El catálogo se almacena y sincroniza dinámicamente mediante la tabla `site_config` de Supabase (clave `catalogo`), comunicándose a través del endpoint existente `/api/admin/config`.
- **User Facing:** 
  - Visitantes: Visualización elegante y responsive del catálogo floral con fotos, flores destacadas, precios y enlace contextualizado a WhatsApp en `/es/` y `/en/`.
  - Administrador: Nueva pestaña "Catálogo" en `/admin` para ajustar precios en Soles/Dólares, textos y visibilidad de los arreglos en tiempo real.

---

## Estructura de Archivos a Modificar / Crear

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/types/catalog.ts` | Crear | Definición de interfaz `CatalogItem` |
| `src/data/defaultCatalog.ts` | Crear | Datos semilla/fallback con los 5 arreglos modelo (Lirios, Girasoles, Claveles, Astromelias, Rosas) |
| `src/components/Catalog.astro` | Crear | Componente de frontend para la sección de catálogo floral |
| `src/i18n/es.json` | Modificar | Textos en español para títulos, flores y llamadas de WhatsApp |
| `src/i18n/en.json` | Modificar | Textos en inglés para el catálogo |
| `src/pages/es/index.astro` | Modificar | Integrar `<Catalog />` después de `<HowItWorks />` |
| `src/pages/en/index.astro` | Modificar | Integrar `<Catalog />` después de `<HowItWorks />` |
| `src/pages/admin/index.astro` | Modificar | Añadir pestaña y editor completo para gestionar arreglos del catálogo |
| `src/pages/admin/catalogo.astro` | Crear | Redirección amigable a `/admin/?tab=catalogo` |

---

## Tareas de Implementación

### Tarea 1: Modelo de Datos y Semilla del Catálogo
- **Archivos:** `src/types/catalog.ts`, `src/data/defaultCatalog.ts`
- **Paso 1:** Crear interfaz TypeScript `CatalogItem` con campos: `id`, `nombre_es`, `nombre_en`, `flores_es`, `flores_en`, `precio_sol`, `precio_usd`, `imagen_url`, `disponible`, `destacado`.
- **Paso 2:** Crear arreglo inicial `defaultCatalog` con 5 modelos destacados:
  1. *Lirios de la Paz* (Lirios blancos, rosas y follaje fino) - S/ 190 / $55 USD
  2. *Girasoles de Esperanza* (Girasoles vibrantes, margaritas y eucalipto) - S/ 220 / $65 USD
  3. *Manto de Claveles* (Claveles seleccionados, hortensias y siemprevivas) - S/ 180 / $50 USD
  4. *Armonía de Astromelias* (Astromelias multicolores, lirios y rosas) - S/ 200 / $58 USD
  5. *Corazón de Rosas* (Rosas premium blancas y rosadas con velo de novia) - S/ 250 / $72 USD
- **Verificación:** `npx tsc --noEmit` sin errores de tipos.
- **Commit:** `feat(catalog): add catalog types and initial default arrangement items`

---

### Tarea 2: Componente Frontend `Catalog.astro` y Textos i18n
- **Archivos:** `src/components/Catalog.astro`, `src/i18n/es.json`, `src/i18n/en.json`
- **Paso 1:** Actualizar diccionarios de i18n con claves `catalog.title`, `catalog.subtitle`, `catalog.currency_sol`, `catalog.currency_usd`, `catalog.consult_whatsapp`.
- **Paso 2:** Crear `Catalog.astro` con:
  - Consumo de datos desde Supabase (o fallback a `defaultCatalog` si la BD aún no tiene la clave).
  - Grid responsive (1 col móvil, 2 col tablet, 3 col desktop).
  - Estética según `DESIGN.md`: tarjetas blancas `rounded-2xl`, sombras sutiles `shadow-sm`, tipografía `Italiana` en nombres, `Raleway` en detalles.
  - Botón de WhatsApp estilizado con enlace dinámico que incluye el nombre del arreglo.
- **Verificación:** Comprobar renderizado del componente en aislamiento.
- **Commit:** `feat(catalog): create responsive bilingual Catalog component`

---

### Tarea 3: Integración en Landing Pages (`/es/` y `/en/`)
- **Archivos:** `src/pages/es/index.astro`, `src/pages/en/index.astro`
- **Paso 1:** Importar `Catalog` en ambas páginas.
- **Paso 2:** Insertar la sección inmediatamente después del timeline `<HowItWorks />` y antes de `<Packages />`.
- **Verificación:** Ejecutar `npm run build` y revisar navegación local.
- **Commit:** `feat(catalog): place Catalog section after HowItWorks in landing pages`

---

### Tarea 4: Pestaña de Gestión en el Panel `/admin`
- **Archivos:** `src/pages/admin/index.astro`, `src/pages/admin/catalogo.astro`
- **Paso 1:** Agregar la pestaña "Catálogo" en la barra de navegación del panel `/admin` (junto a Leads, Paquetes y Sitio).
- **Paso 2:** Diseñar el editor del catálogo en `/admin/index.astro`:
  - Carga inicial vía `fetch('/api/admin/config?key=catalogo')`.
  - Lista de tarjetas editables con campos para precio Soles (`precio_sol`), Dólares (`precio_usd`), disponibilidad (`disponible`) y URL de imagen.
  - Botón "Guardar Catálogo" que envía POST a `/api/admin/config` con `{ key: 'catalogo', value: items }`.
  - Notificaciones de éxito y error.
- **Paso 3:** Crear `src/pages/admin/catalogo.astro` con redirección a `/admin/` para coherencia de rutas.
- **Verificación:** Probar flujo de guardado en base de datos.
- **Commit:** `feat(admin): add floral catalog management tab and editor in admin dashboard`

---

### Tarea 5: Verificación de Build, Sincronización y Despliegue
- **Archivos:** `_bmad-output/implementation-artifacts/sprint-status.yaml`, `README.md`
- **Paso 1:** Ejecutar `npm run build` asegurando cero advertencias y compatibilidad con Cloudflare Workers.
- **Paso 2:** Probar localmente en `wrangler dev`.
- **Paso 3:** Actualizar `sprint-status.yaml` y hacer push a GitHub para despliegue automático en producción.
- **Commit:** `chore(release): finalize floral catalog section integration and build verification`
