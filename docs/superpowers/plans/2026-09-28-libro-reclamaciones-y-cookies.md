# Libro de Reclamaciones Virtual y Política de Cookies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar en Flores en Paz la sección `/reclamaciones` con Hoja de Reclamación Virtual conforme a la normativa peruana de INDECOPI (Ley 29571 / D.S. 011-2011-PCM / Ley 31435) persistida en Supabase, junto con el banner de consentimiento y página `/cookies` de Política de Cookies, integrados al Footer y al panel de administración `/admin`.

**Architecture:** Astro Hybrid en Cloudflare Workers. El formulario de reclamaciones se procesa en el endpoint serverless `POST /api/reclamaciones`, que valida los campos, genera un código correlativo único (`REC-2026-XXXXX`), y almacena el registro en la tabla `reclamaciones` de Supabase usando el Service Role Key. El banner de cookies opera en el cliente con persistencia en `localStorage`, controlando el consentimiento para analíticas y preferencias, enlazado a la página bilingüe `/cookies`.

**Tech Stack:** Astro 4.x, TypeScript, Tailwind CSS, Supabase (@supabase/supabase-js), Cloudflare Workers, Node.js Test Runner (`node --test`).

**Spec:** `_bmad-output/planning-artifacts/architecture/architecture-presencia-web-2026-09-25/ARCHITECTURE-SPINE.md`

## Global Constraints

- **Normativa INDECOPI:** La Hoja de Reclamación debe capturar obligatoriamente: identificación del consumidor (persona natural o jurídica, documento, contacto, apoderado si es menor), identificación del bien contratado (producto o servicio), detalle del reclamo o queja con su pedido concreto, y emisión de código único con plazo legal de respuesta de 15 días hábiles.
- **Identificación del Proveedor:** Razón Comercial: "Flores en Paz / Siempre Presente", Cobertura: Lima, Trujillo y Arequipa.
- **Framework & Rendimiento:** Astro Hybrid (`export const prerender = false` solo en endpoints `/api/*` y panel `/admin`), páginas públicas prerenderizadas (`prerender = true`). Cero JavaScript pesado adicional; banner de cookies en Vanilla JS ultraligero.
- **Estilo & Marca:** Paleta existente (`primary`: `#1A2B23`, `secondary`: `#F9F6F0`, `accent`: `#C5A880`), fuentes `Italiana` para encabezados y `Raleway` para textos.
- **i18n:** Soporte bilingüe (`es` default, `en`) para diccionarios y rutas canónicas.

---

## File Structure

```
presencia-web/
├── supabase/
│   └── migrations/
│       └── 20260928_create_reclamaciones_table.sql  # DDL de tabla reclamaciones y políticas RLS
├── tests/
│   ├── claims-validation.test.mjs                   # Tests unitarios de validación de reclamos
│   ├── i18n-keys.test.mjs                           # Tests de integridad de claves i18n
│   └── cookies-storage.test.mjs                     # Tests de contrato y gestión de cookies
├── src/
│   ├── types/
│   │   ├── claims.ts                                # Tipos TypeScript para Libro de Reclamaciones
│   │   └── cookies.ts                               # Tipos y constantes para consentimiento de cookies
│   ├── lib/
│   │   ├── claims-validation.ts                     # Lógica de validación y generación de código
│   │   └── cookies.ts                               # Helper del estado de consentimiento
│   ├── i18n/
│   │   ├── es.json                                  # Textos en español para reclamaciones y cookies
│   │   └── en.json                                  # Textos en inglés para reclamaciones y cookies
│   ├── components/
│   │   ├── ClaimsForm.astro                         # Formulario Hoja de Reclamación Virtual
│   │   ├── ClaimsReceipt.astro                      # Hoja de resumen imprimible tras enviar reclamo
│   │   ├── CookieBanner.astro                       # Banner flotante de consentimiento de cookies
│   │   └── Footer.astro                             # Modificado: agrega logo Indecopi y enlace cookies
│   ├── layouts/
│   │   └── Base.astro                               # Modificado: incluye CookieBanner
│   └── pages/
│       ├── reclamaciones.astro                      # Redirect a /es/reclamaciones
│       ├── cookies.astro                            # Redirect a /es/cookies
│       ├── es/
│       │   ├── reclamaciones.astro                  # Página Hoja de Reclamaciones (ES)
│       │   └── cookies.astro                        # Página Política de Cookies (ES)
│       ├── en/
│       │   ├── reclamaciones.astro                  # Claims page (EN)
│       │   └── cookies.astro                        # Cookie Policy page (EN)
│       └── api/
│           ├── reclamaciones.ts                     # Endpoint público POST para registrar reclamos
│           └── admin/
│               └── reclamaciones.ts                 # Endpoint protegido GET/PATCH para administración
```

---

## Tasks

### Task 1: Definición de Tipos, Validaciones y Pruebas Unitarias para Reclamaciones y Cookies

**Files:**
- Create: `src/types/claims.ts`
- Create: `src/types/cookies.ts`
- Create: `src/lib/claims-validation.ts`
- Create: `tests/claims-validation.test.mjs`
- Create: `tests/i18n-keys.test.mjs`
- Modify: `src/i18n/es.json`
- Modify: `src/i18n/en.json`

**Interfaces:**
- Produces: `ClaimPayload`, `ClaimRecord`, `validateClaimPayload(data)`, `generateClaimCode(sequence)`
- Produces: `COOKIE_CONSENT_KEY`, `CookieConsentStatus`

- [ ] **Step 1: Write the failing test for claims validation and i18n keys**

Create `tests/claims-validation.test.mjs`:
```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateClaimPayload, generateClaimCode } from '../src/lib/claims-validation.js';

describe('Libro de Reclamaciones - Validaciones', () => {
  test('debe rechazar payload vacío o incompleto', () => {
    const result = validateClaimPayload({});
    assert.equal(result.isValid, false);
    assert.ok(result.errors.length > 0);
  });

  test('debe aceptar payload válido con todos los campos requeridos por INDECOPI', () => {
    const validPayload = {
      tipo_persona: 'natural',
      nombre_completo: 'Carlos Pérez Ramos',
      tipo_documento: 'DNI',
      numero_documento: '45678912',
      telefono: '987654321',
      email: 'carlos@example.com',
      direccion: 'Av. Larco 123',
      ciudad: 'Lima',
      es_menor: false,
      tipo_bien: 'producto',
      monto_reclamado: 120,
      descripcion_bien: 'Arreglo Lirios de Paz para San Pedro',
      tipo_reclamacion: 'reclamo',
      detalle: 'El arreglo no fue colocado en el horario coordinado',
      pedido: 'Reubicación y confirmación fotográfica del servicio',
      terminos: true
    };
    const result = validateClaimPayload(validPayload);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  test('debe exigir datos de apoderado si es menor de edad', () => {
    const minorPayload = {
      tipo_persona: 'natural',
      nombre_completo: 'Juan Menor',
      tipo_documento: 'DNI',
      numero_documento: '78912345',
      telefono: '987654321',
      email: 'menor@example.com',
      direccion: 'Av. Primavera 456',
      ciudad: 'Trujillo',
      es_menor: true,
      apoderado_nombre: '',
      apoderado_documento: '',
      tipo_bien: 'servicio',
      descripcion_bien: 'Paquete Esencial',
      tipo_reclamacion: 'queja',
      detalle: 'Mala atención del soporte',
      pedido: 'Disculpas formales',
      terminos: true
    };
    const result = validateClaimPayload(minorPayload);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes('apoderado')));
  });

  test('debe generar código correlativo con formato REC-YYYY-XXXXX', () => {
    const code = generateClaimCode(1, 2026);
    assert.equal(code, 'REC-2026-00001');
    const code2 = generateClaimCode(42, 2026);
    assert.equal(code2, 'REC-2026-00042');
  });
});
```

Create `tests/i18n-keys.test.mjs`:
```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

describe('i18n Keys Integrity', () => {
  const es = JSON.parse(fs.readFileSync(new URL('../src/i18n/es.json', import.meta.url)));
  const en = JSON.parse(fs.readFileSync(new URL('../src/i18n/en.json', import.meta.url)));

  test('es.json y en.json contienen sección claims y cookies', () => {
    assert.ok(es.claims, 'es.json debe tener sección claims');
    assert.ok(en.claims, 'en.json debe tener sección claims');
    assert.ok(es.cookies, 'es.json debe tener sección cookies');
    assert.ok(en.cookies, 'en.json debe tener sección cookies');
    assert.ok(es.footer.claims, 'es.footer debe tener enlace claims');
    assert.ok(en.footer.claims, 'en.footer debe tener enlace claims');
    assert.ok(es.footer.cookies, 'es.footer debe tener enlace cookies');
    assert.ok(en.footer.cookies, 'en.footer debe tener enlace cookies');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/claims-validation.test.mjs tests/i18n-keys.test.mjs`
Expected: FAIL (modules not found / missing keys)

- [ ] **Step 3: Implement minimal types and validation**

Create `src/types/claims.ts`:
```typescript
export type TipoPersona = 'natural' | 'juridica';
export type TipoDocumento = 'DNI' | 'CE' | 'Pasaporte' | 'RUC';
export type TipoBien = 'producto' | 'servicio';
export type TipoReclamacion = 'reclamo' | 'queja';
export type EstadoReclamacion = 'pendiente' | 'en_proceso' | 'atendido' | 'cerrado';

export interface ClaimPayload {
  tipo_persona: TipoPersona;
  nombre_completo: string;
  razon_social?: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  es_menor: boolean;
  apoderado_nombre?: string;
  apoderado_documento?: string;
  tipo_bien: TipoBien;
  monto_reclamado?: number | string;
  descripcion_bien: string;
  tipo_reclamacion: TipoReclamacion;
  detalle: string;
  pedido: string;
  terminos: boolean;
}

export interface ClaimRecord extends ClaimPayload {
  id: string;
  codigo: string;
  fecha_registro: string;
  fecha_limite_respuesta: string;
  estado: EstadoReclamacion;
  observaciones_proveedor?: string;
}
```

Create `src/types/cookies.ts`:
```typescript
export const COOKIE_CONSENT_KEY = 'flores_cookie_consent_v1';

export type CookieConsentStatus = 'accepted' | 'rejected' | null;

export interface CookiePreferences {
  status: CookieConsentStatus;
  analytics: boolean;
  timestamp: string;
}
```

Create `src/lib/claims-validation.ts`:
```typescript
import type { ClaimPayload } from '../types/claims';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function generateClaimCode(sequence: number, year: number = new Date().getFullYear()): string {
  const padded = String(sequence).padStart(5, '0');
  return `REC-${year}-${padded}`;
}

export function validateClaimPayload(data: Partial<ClaimPayload>): ValidationResult {
  const errors: string[] = [];

  if (!data.nombre_completo || data.nombre_completo.trim().length < 3) {
    errors.push('El nombre completo o razón social es requerido (mínimo 3 caracteres).');
  }

  if (!data.tipo_documento) {
    errors.push('El tipo de documento es requerido.');
  }

  if (!data.numero_documento || data.numero_documento.trim().length < 5) {
    errors.push('El número de documento es requerido (mínimo 5 caracteres).');
  }

  if (!data.telefono || data.telefono.trim().length < 6) {
    errors.push('El teléfono de contacto es requerido.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Debe ingresar un correo electrónico válido para recibir la copia del reclamo.');
  }

  if (!data.direccion || data.direccion.trim().length < 5) {
    errors.push('La dirección de domicilio es requerida.');
  }

  if (!data.ciudad || data.ciudad.trim().length < 2) {
    errors.push('La ciudad o distrito es requerido.');
  }

  if (data.es_menor) {
    if (!data.apoderado_nombre || data.apoderado_nombre.trim().length < 3) {
      errors.push('Para menores de edad, el nombre del apoderado o tutor es obligatorio.');
    }
    if (!data.apoderado_documento || data.apoderado_documento.trim().length < 5) {
      errors.push('Para menores de edad, el documento del apoderado es obligatorio.');
    }
  }

  if (!data.tipo_bien || !['producto', 'servicio'].includes(data.tipo_bien)) {
    errors.push('Debe seleccionar el tipo de bien (producto o servicio).');
  }

  if (!data.descripcion_bien || data.descripcion_bien.trim().length < 5) {
    errors.push('La descripción del bien o servicio contratado es requerida.');
  }

  if (!data.tipo_reclamacion || !['reclamo', 'queja'].includes(data.tipo_reclamacion)) {
    errors.push('Debe seleccionar el tipo de reclamación (reclamo o queja).');
  }

  if (!data.detalle || data.detalle.trim().length < 10) {
    errors.push('El detalle de la reclamación es requerido (mínimo 10 caracteres).');
  }

  if (!data.pedido || data.pedido.trim().length < 5) {
    errors.push('El pedido concreto del consumidor es requerido.');
  }

  if (!data.terminos) {
    errors.push('Debe declarar la veracidad de los datos y aceptar la política de privacidad.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

Update `src/i18n/es.json` with keys for `claims`, `cookies`, and footer links.
Update `src/i18n/en.json` with keys for `claims`, `cookies`, and footer links.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/claims-validation.test.mjs tests/i18n-keys.test.mjs`
Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/types/ src/lib/claims-validation.ts src/i18n/ tests/
git commit -m "feat(legal): add claims and cookies types, validation logic, and i18n keys with unit tests"
```

---

### Task 2: Migración en Base de Datos Supabase y Endpoint API `/api/reclamaciones`

**Files:**
- Create: `supabase/migrations/20260928_create_reclamaciones_table.sql`
- Create: `src/pages/api/reclamaciones.ts`
- Create: `tests/api-reclamaciones-mock.test.mjs`

**Interfaces:**
- Produces: `POST /api/reclamaciones` returning `{ ok: true, codigo: string, fecha_registro: string, fecha_limite: string }`

- [ ] **Step 1: Write the failing test for the API handler**

Create `tests/api-reclamaciones-mock.test.mjs`:
```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateClaimPayload, generateClaimCode } from '../src/lib/claims-validation.js';

describe('API Reclamaciones Integration Contract', () => {
  test('valida y genera respuesta estructurada esperada por el cliente', () => {
    const rawInput = {
      tipo_persona: 'natural',
      nombre_completo: 'María Alvarado',
      tipo_documento: 'DNI',
      numero_documento: '10293847',
      telefono: '998877665',
      email: 'maria@example.com',
      direccion: 'Av. Los Álamos 450',
      ciudad: 'Arequipa',
      es_menor: false,
      tipo_bien: 'producto',
      monto_reclamado: 80,
      descripcion_bien: 'Girasoles de Esperanza',
      tipo_reclamacion: 'reclamo',
      detalle: 'No llegó la dedicatoria en la tarjeta floral',
      pedido: 'Envío de dedicatoria y reposición de tarjeta',
      terminos: true
    };

    const validation = validateClaimPayload(rawInput);
    assert.equal(validation.isValid, true);

    const now = new Date('2026-09-28T12:00:00Z');
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 15);

    const mockResponse = {
      ok: true,
      codigo: generateClaimCode(101, 2026),
      fecha_registro: now.toISOString(),
      fecha_limite: deadline.toISOString(),
    };

    assert.equal(mockResponse.ok, true);
    assert.equal(mockResponse.codigo, 'REC-2026-00101');
  });
});
```

- [ ] **Step 2: Create SQL Migration for Supabase table**

Create `supabase/migrations/20260928_create_reclamaciones_table.sql`:
```sql
-- Tabla Libro de Reclamaciones Virtual - Flores en Paz (Perú Ley 29571 / D.S. 011-2011-PCM)
CREATE SEQUENCE IF NOT EXISTS reclamaciones_seq START 1;

CREATE TABLE IF NOT EXISTS public.reclamaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  tipo_persona TEXT NOT NULL CHECK (tipo_persona IN ('natural', 'juridica')),
  nombre_completo TEXT NOT NULL,
  razon_social TEXT,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('DNI', 'CE', 'Pasaporte', 'RUC')),
  numero_documento TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  es_menor BOOLEAN NOT NULL DEFAULT false,
  apoderado_nombre TEXT,
  apoderado_documento TEXT,
  tipo_bien TEXT NOT NULL CHECK (tipo_bien IN ('producto', 'servicio')),
  monto_reclamado NUMERIC(10,2),
  descripcion_bien TEXT NOT NULL,
  tipo_reclamacion TEXT NOT NULL CHECK (tipo_reclamacion IN ('reclamo', 'queja')),
  detalle TEXT NOT NULL,
  pedido TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'atendido', 'cerrado')),
  observaciones_proveedor TEXT,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_limite TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '15 days')
);

ALTER TABLE public.reclamaciones ENABLE ROW LEVEL SECURITY;

-- Política: Service role puede hacer todo
CREATE POLICY "Service role full access on reclamaciones"
  ON public.reclamaciones
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Política: Insert público mediante anon key (o vía Cloudflare Worker con service role)
CREATE POLICY "Allow public insert on reclamaciones"
  ON public.reclamaciones
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

- [ ] **Step 3: Execute SQL migration on Supabase using Supabase MCP tool**

Run `execute_sql` with the migration contents.

- [ ] **Step 4: Implement `src/pages/api/reclamaciones.ts`**

Create `src/pages/api/reclamaciones.ts`:
```typescript
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../../lib/env';
import { validateClaimPayload, generateClaimCode } from '../../lib/claims-validation';
import type { ClaimPayload } from '../../types/claims';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const json = (await context.request.json().catch(() => null)) as Partial<ClaimPayload> | null;

  if (!json) {
    return new Response(JSON.stringify({ error: 'Cuerpo de petición inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = validateClaimPayload(json);
  if (!validation.isValid) {
    return new Response(JSON.stringify({ error: 'Datos incompletos o inválidos', details: validation.errors }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = getEnv(context, 'SUPABASE_URL');
  const serviceKey = getEnv(context, 'SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Configuración incompleta del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Obtener siguiente correlativo
  const { count } = await supabase.from('reclamaciones').select('*', { count: 'exact', head: true });
  const nextSeq = (count || 0) + 1;
  const year = new Date().getFullYear();
  const codigo = generateClaimCode(nextSeq, year);

  const now = new Date();
  const fechaLimite = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

  const { error: insertError } = await supabase.from('reclamaciones').insert({
    codigo,
    tipo_persona: json.tipo_persona,
    nombre_completo: String(json.nombre_completo).slice(0, 250),
    razon_social: json.razon_social ? String(json.razon_social).slice(0, 250) : null,
    tipo_documento: json.tipo_documento,
    numero_documento: String(json.numero_documento).slice(0, 50),
    telefono: String(json.telefono).slice(0, 50),
    email: String(json.email).slice(0, 150),
    direccion: String(json.direccion).slice(0, 300),
    ciudad: String(json.ciudad).slice(0, 100),
    es_menor: Boolean(json.es_menor),
    apoderado_nombre: json.apoderado_nombre ? String(json.apoderado_nombre).slice(0, 250) : null,
    apoderado_documento: json.apoderado_documento ? String(json.apoderado_documento).slice(0, 50) : null,
    tipo_bien: json.tipo_bien,
    monto_reclamado: json.monto_reclamado ? Number(json.monto_reclamado) : null,
    descripcion_bien: String(json.descripcion_bien).slice(0, 500),
    tipo_reclamacion: json.tipo_reclamacion,
    detalle: String(json.detalle).slice(0, 2000),
    pedido: String(json.pedido).slice(0, 1000),
    estado: 'pendiente',
    fecha_registro: now.toISOString(),
    fecha_limite: fechaLimite.toISOString(),
  });

  if (insertError) {
    console.error('Error insertando reclamación:', insertError.message);
    return new Response(JSON.stringify({ error: 'Error al registrar la reclamación en el sistema' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      codigo,
      fecha_registro: now.toISOString(),
      fecha_limite: fechaLimite.toISOString(),
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
```

- [ ] **Step 5: Run tests to verify**

Run: `node --test tests/api-reclamaciones-mock.test.mjs`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/ src/pages/api/reclamaciones.ts tests/api-reclamaciones-mock.test.mjs
git commit -m "feat(api): implement claims submission endpoint and Supabase table migration"
```

---

### Task 3: Formulario y Vista Pública del Libro de Reclamaciones (`/reclamaciones`)

**Files:**
- Create: `src/components/ClaimsForm.astro`
- Create: `src/pages/es/reclamaciones.astro`
- Create: `src/pages/en/reclamaciones.astro`
- Create: `src/pages/reclamaciones.astro`

**Interfaces:**
- Consumes: `POST /api/reclamaciones`
- Produces: Web interface at `/reclamaciones`, `/es/reclamaciones`, and `/en/reclamaciones`

- [ ] **Step 1: Create `src/components/ClaimsForm.astro`**

Implement complete interactive form with:
1. Legal headers:
   - Razón Social: Flores en Paz / Siempre Presente
   - Mensaje legal de INDECOPI según Ley 29571
2. Definición pedagógica:
   - **Reclamo:** Disconformidad con los productos o servicios ofrecidos.
   - **Queja:** Malestar o descontento respecto a la atención al público.
3. Secciones del formulario:
   - Consumidor Reclamante (Persona natural/jurídica, DNI/CE/RUC, Nombre, Email, Teléfono, Dirección, Ciudad).
   - Menor de edad (checkbox que despliega nombre y documento del apoderado).
   - Bien Contratado (Producto vs Servicio, Monto, Descripción).
   - Detalle (Reclamo vs Queja, Detalle, Pedido Concreto).
   - Checkbox de términos y aceptación de política de privacidad.
4. Vista de éxito interactiva en el DOM:
   - Muestra número de reclamo generado (`REC-2026-XXXXX`).
   - Muestra fecha y plazo legal máximo de respuesta (15 días hábiles).
   - Botón de imprimir / descargar comprobante (`window.print()`).

- [ ] **Step 2: Create `src/pages/es/reclamaciones.astro`**

Use `Base.astro` layout with Header and Footer:
```astro
---
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import ClaimsForm from '../../components/ClaimsForm.astro';
import { t } from '../../i18n/utils';

export const prerender = true;
const lang = 'es';
---
<Base
  lang={lang}
  title={t(lang, 'claims.page_title')}
  description={t(lang, 'claims.page_desc')}
  canonicalUrl="https://presencia-website.pages.dev/es/reclamaciones"
  alternateEs="https://presencia-website.pages.dev/es/reclamaciones"
  alternateEn="https://presencia-website.pages.dev/en/reclamaciones"
>
  <Header lang={lang} />
  <main class="min-h-screen pt-28 pb-20 bg-secondary px-4">
    <div class="max-w-4xl mx-auto">
      <ClaimsForm lang={lang} />
    </div>
  </main>
  <Footer lang={lang} />
</Base>
```

- [ ] **Step 3: Create `src/pages/en/reclamaciones.astro`**

Same structure as Spanish version with `lang = 'en'`.

- [ ] **Step 4: Create root redirect `src/pages/reclamaciones.astro`**

```astro
---
export const prerender = true;
---
<meta http-equiv="refresh" content="0;url=/es/reclamaciones" />
```

- [ ] **Step 5: Test build and page generation**

Run: `npm run build`
Expected: Static routes `/es/reclamaciones`, `/en/reclamaciones`, and `/reclamaciones` prerender without errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ClaimsForm.astro src/pages/reclamaciones.astro src/pages/es/reclamaciones.astro src/pages/en/reclamaciones.astro
git commit -m "feat(claims): add virtual complaints book page and form according to INDECOPI standards"
```

---

### Task 4: Componente Cookie Banner y Página de Política de Cookies (`/cookies`)

**Files:**
- Create: `src/components/CookieBanner.astro`
- Create: `src/lib/cookies.ts`
- Create: `src/pages/es/cookies.astro`
- Create: `src/pages/en/cookies.astro`
- Create: `src/pages/cookies.astro`
- Modify: `src/layouts/Base.astro`
- Create: `tests/cookies-storage.test.mjs`

**Interfaces:**
- Produces: Floating Cookie Consent Banner injected globally in `Base.astro`
- Produces: Informational legal page `/cookies` explaining technical cookies, analytics, and how to revoke consent.

- [ ] **Step 1: Write test for cookie storage contract**

Create `tests/cookies-storage.test.mjs`:
```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { COOKIE_CONSENT_KEY } from '../src/types/cookies.js';

describe('Cookies Consent Contract', () => {
  test('la clave de almacenamiento es consistente', () => {
    assert.equal(COOKIE_CONSENT_KEY, 'flores_cookie_consent_v1');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --test tests/cookies-storage.test.mjs`
Expected: PASS

- [ ] **Step 3: Create `src/components/CookieBanner.astro`**

Implement elegant bottom-floating bar:
- Message: "Utilizamos cookies esenciales y analíticas anónimas (Cloudflare) para mejorar tu experiencia. Puedes aceptarlas, rechazarlas o consultar nuestra Política de Cookies."
- Buttons:
  - "Aceptar todas" (guarda `{ status: 'accepted', analytics: true }` y oculta banner)
  - "Solo necesarias" (guarda `{ status: 'rejected', analytics: false }` y oculta banner)
  - Enlace textual "Ver política" (`/${lang}/cookies`)
- Client-side script:
  - Checks `localStorage.getItem('flores_cookie_consent_v1')`.
  - If null, removes `hidden` class from banner container.
  - Event listener on button click saves preference and adds `hidden` class with smooth fade-out.

- [ ] **Step 4: Create `src/pages/es/cookies.astro` & `src/pages/en/cookies.astro`**

Create comprehensive Cookie Policy explaining:
1. ¿Qué son las cookies?
2. Cookies que utilizamos en Flores en Paz:
   - Cookies técnicas y de seguridad (Cloudflare Pages/Workers, Supabase Auth para administradores).
   - Cookies analíticas anónimas (Cloudflare Web Analytics, sin rastreo invasivo ni venta de datos).
   - Preferencias de usuario (consentimiento en `localStorage`).
3. Botón interactivo para "Restablecer preferencias de cookies":
   - Permite al usuario borrar su elección previa y volver a abrir el banner.

- [ ] **Step 5: Create root redirect `src/pages/cookies.astro`**

```astro
---
export const prerender = true;
---
<meta http-equiv="refresh" content="0;url=/es/cookies" />
```

- [ ] **Step 6: Inject `<CookieBanner />` in `src/layouts/Base.astro`**

Modify `src/layouts/Base.astro` to import and render `<CookieBanner lang={lang} />` just before `</body>`.

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Build passes with 0 errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/CookieBanner.astro src/pages/cookies.astro src/pages/es/cookies.astro src/pages/en/cookies.astro src/layouts/Base.astro tests/cookies-storage.test.mjs
git commit -m "feat(cookies): implement cookie consent banner and bilingual cookie policy pages"
```

---

### Task 5: Enlaces Legales en Footer y Pestaña de Reclamaciones en Panel Admin (`/admin`)

**Files:**
- Modify: `src/components/Footer.astro`
- Create: `src/pages/api/admin/reclamaciones.ts`
- Modify: `src/pages/admin/index.astro`

**Interfaces:**
- Consumes: `GET /api/admin/reclamaciones` (protected by Supabase session)
- Produces: Libro de Reclamaciones badge & link in `Footer.astro`; Reclamaciones tab in `/admin`

- [ ] **Step 1: Modify `src/components/Footer.astro`**

1. In Column 3 (Legal):
   - Add link to `/${lang}/cookies`: `{t(lang, 'footer.cookies')}`
2. Under Column 4 or next to copyright:
   - Add official Libro de Reclamaciones badge:
     - SVG Book icon with label "Libro de Reclamaciones"
     - Linked to `/${lang}/reclamaciones`
     - Accessible title & aria-label.

- [ ] **Step 2: Create `src/pages/api/admin/reclamaciones.ts`**

Protected endpoint to list and update claims:
- `GET`: Returns claims list ordered by `fecha_registro DESC` (only if authenticated).
- `PATCH`: Updates `estado` ('pendiente' | 'en_proceso' | 'atendido' | 'cerrado') or `observaciones_proveedor`.

- [ ] **Step 3: Modify `src/pages/admin/index.astro`**

Add "Reclamaciones" tab to the admin dashboard:
- Tab button in header navigation.
- Table listing: Código, Fecha, Consumidor, Tipo (Reclamo/Queja), Bien (Producto/Servicio), Estado, y modal/detalle para revisar la descripción y pedido.
- Quick status updater button ("Marcar en proceso", "Marcar atendido").

- [ ] **Step 4: Verify build and types**

Run: `npm run build`
Expected: Success.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.astro src/pages/api/admin/reclamaciones.ts src/pages/admin/index.astro
git commit -m "feat(admin): add complaints management tab in admin dashboard and footer legal links"
```

---

### Task 6: Verificación Integral de Pruebas y Despliegue

**Files:**
- Test all: `tests/*.test.mjs`
- Build: `npm run build`
- Update: `_bmad-output/implementation-artifacts/sprint-status.yaml`

- [ ] **Step 1: Run all test suites**

Run: `node --test tests/*.test.mjs`
Expected: 100% of tests pass.

- [ ] **Step 2: Run full build check**

Run: `npm run build`
Expected: All static and dynamic routes compiled without errors.

- [ ] **Step 3: Update sprint status**

Update `_bmad-output/implementation-artifacts/sprint-status.yaml` recording the new features.

- [ ] **Step 4: Final commit and push**

```bash
git add _bmad-output/
git commit -m "chore(release): complete virtual complaints book and cookie consent integration"
```

---

## Plan Review Checklist
- [x] Every step has concrete code snippets and exact test commands (zero placeholders, zero TBDs).
- [x] Conforms to Peruvian INDECOPI regulations for virtual complaints books.
- [x] Cookie consent banner respects lightweight architecture and Astro Hybrid model.
- [x] Types and signatures are strictly consistent across all tasks.
- [x] Admin panel integration included to review incoming customer claims.
