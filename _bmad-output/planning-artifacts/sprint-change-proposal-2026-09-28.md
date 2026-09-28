# Propuesta de Cambio de Sprint (Correct Course): Integración Shopify y Gestión Integral de Catálogo y Paquetes

- **Fecha:** 28 de Septiembre de 2026
- **Proyecto:** Presencia Web (Flores en Paz)
- **Alcance del Cambio:** Moderado a Mayor (Afecta Modelo de Datos, Panel Admin, Landing y Arquitectura de Pagos)
- **Autor:** Agente BMad (Correct Course)

---

## 1. Resumen del Disparador (Issue Summary)

### Contexto
Durante la implementación del Catálogo Floral y la verificación del panel administrativo `/admin`, el cliente identificó la necesidad estratégica de incorporar **Shopify** como pasarela de e-commerce y checkout tanto para **productos** (arreglos florales individuales) como para **servicios** (paquetes y suscripciones de homenaje).

### Brechas Identificadas en la Arquitectura Actual
1. **Desconexión entre Landing y Admin en Paquetes:** La sección `<Packages.astro>` leía un archivo YAML estático (`src/content/paquetes/paquetes.yaml`) en tiempo de compilación, ignorando los cambios de precios guardados en la tabla `site_config` de Supabase desde `/admin`.
2. **Campos Limitados en Admin:** El panel administrativo solo permitía modificar precios numéricos de paquetes preexistentes, sin capacidad de editar nombres, descripciones, beneficios ni configurar enlaces de compra externa.
3. **Ausencia de Contrato Shopify:** El catálogo floral y los paquetes no tenían soporte para almacenar identificadores de Shopify (`shopify_product_id`, `shopify_variant_id`, `shopify_handle` o `checkout_url`), impidiendo la coexistencia fluida entre compra directa en Shopify y atención personalizada vía WhatsApp.

---

## 2. Análisis de Impacto en Artefactos

### A. Impacto en Arquitectura (`ARCHITECTURE-SPINE.md` y Diagramas C4)
- **AD-14 (Nueva): Modelo de Datos Unificado y Preparado para Shopify (Hybrid Headless):**
  - La tabla `site_config` de Supabase mantendrá dos claves maestras: `'catalogo'` y `'paquetes'`.
  - Cada ítem del catálogo y paquete incorporará el esquema extensible:
    ```typescript
    {
      id: string;
      nombre_es: string;
      nombre_en: string;
      descripcion_es?: string;
      descripcion_en?: string;
      precio_sol: number;
      precio_usd: number;
      imagen_url?: string;
      disponible: boolean;
      destacado: boolean;
      // Extensiones Shopify
      shopify_enabled: boolean; // Si es true, el botón principal abre el checkout de Shopify
      shopify_checkout_url?: string; // Enlace directo al checkout o producto de Shopify
      shopify_product_id?: string;
    }
    ```
  - **Estrategia de Renderizado:** `<Packages.astro>` y `<Catalog.astro>` consumirán datos dinámicos de Supabase en SSR/Hybrid con fallback local resiliente.

### B. Impacto en UX y Diseño (`DESIGN.md` y `EXPERIENCE.md`)
- **Modo Dual de Conversión:**
  - Si un producto/servicio tiene `shopify_enabled: true` y `shopify_checkout_url`, la tarjeta mostrará un botón principal de **"Comprar Ahora (Shopify)"** con un botón secundario o enlace de **"Consultar por WhatsApp"**.
  - Si `shopify_enabled: false`, se mantiene el flujo de conversión actual directo a WhatsApp con mensaje contextualizado.
- **Panel `/admin` Mejorado:**
  - Pestaña **Paquetes**: Edición completa de nombre, precio Soles, precio USD, beneficios y URL de Shopify.
  - Pestaña **Catálogo Floral**: Edición de nombre, flores, precio Soles, precio USD, foto, disponibilidad y URL de checkout de Shopify.

### C. Impacto en Epics y Sprint (`epics.md` y `sprint-status.yaml`)
- **Epic 5 (Catálogo Floral):** Extender alcance para incluir soporte de checkout URL y sincronización con landing.
- **Epic 6 (Nuevo: Integración E-commerce Shopify & Sincronización Total):**
  - **Story 6.1:** Conectar `<Packages.astro>` a Supabase `site_config.paquetes` en lugar del YAML estático.
  - **Story 6.2:** Extender el panel `/admin` para permitir edición completa (precios, textos, toggle y URLs de Shopify) tanto en Catálogo como en Paquetes.
  - **Story 6.3:** Integrar botones de compra de Shopify y fallback a WhatsApp en las tarjetas de la landing.

---

## 3. Plan de Acción Detallado (Implementación)

### Paso 1: Semilla y Modelo de Datos Extensible en Supabase
- Actualizar `site_config.paquetes` y `site_config.catalogo` con la estructura unificada compatible con Shopify.

### Paso 2: Refactorizar `<Packages.astro>`
- Reemplazar la lectura de `paquetes.yaml` por consulta directa a Supabase `site_config` (usando el cliente resiliente SSR con fallback al YAML local en caso de desconexión).

### Paso 3: Potenciar el Editor en `/admin/index.astro`
- **En Catálogo:** Agregar campos para Nombre, Flores/Descripción, Precio S/, Precio USD, URL de Imagen, URL de Shopify y selector de acción principal (WhatsApp vs Shopify).
- **En Paquetes:** Agregar campos para Nombre, Precio S/, Precio USD, Beneficios (lista editable), URL de Shopify y selector de acción principal.
- Permitir agregar nuevos arreglos o paquetes dinámicamente desde el administrador.

### Paso 4: Actualización en Componentes Visuales del Frontend
- Actualizar botones en `<Catalog.astro>` y `<Packages.astro>` para soportar tanto Shopify Checkout como WhatsApp.
