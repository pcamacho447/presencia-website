# UX Design — Flores en Paz / Siempre Presente
**Fecha:** 2026-09-25
**Agente:** Sally — UX Designer (bmad-agent-ux-designer)
**Proyecto:** presencia-web
**Estado:** Aprobado por camac

---

## 1. Contexto y Propósito

Flores en Paz es un servicio de colocación de flores en cementerios de Lima, Trujillo y Arequipa. El sitio web tiene un único trabajo: **calentar emocionalmente al usuario hasta que presione el botón de WhatsApp**. No cierra la venta — la abre. El cierre ocurre en el chat con un agente humano.

---

## 2. Usuario Primario

**Perfil A — Familiar en el exterior (o con impedimento de ir)**

| Atributo | Detalle |
|---|---|
| Ubicación | Miami, Madrid, Santiago, Lima (pero no puede ir) |
| Canal de entrada | Instagram/TikTok (caliente, móvil), WhatsApp grupal (referido, móvil), Google (frío, mixto) |
| Motivación principal | Alivio emocional — sentir que "estuvo presente" |
| Motivación secundaria | Compartir en redes/WhatsApp — acto de amor visible |
| Canal de conversión | WhatsApp (human-first) |
| Dispositivo | Prioritariamente móvil |

**Implicación de diseño clave:** el foto + video entregado no es solo un comprobante — es **contenido social con carga emocional**. El diseño debe reflejar que ese material es hermoso y compartible.

---

## 3. Voz y Tono

| Registro | Uso |
|---|---|
| **Tú / ti** | Hero, secciones emocionales, CTA, Cómo Funciona, FAQ |
| **Usted** | Formulario formal, términos legales |

**Principios de escritura:**
- Cálido, no dramático
- Directo, no instructivo
- Poético cuando acompaña emoción, funcional cuando describe proceso
- Nunca frío ni transaccional

---

## 4. Estrategia de CTA

Un solo canal de conversión: **WhatsApp**.

- Aparece en el Header (siempre visible)
- Aparece como CTA secundario en el Hero
- Aparece al final de "Cómo Funciona"
- Aparece en cada card de Paquetes
- Aparece al final del FAQ
- Botón flotante en móvil (esquina inferior derecha, siempre visible)

El formulario es captura de intención secundaria — para quien no quiere chatear en ese momento.

---

## 5. Arquitectura de Secciones

```
1. Header
2. Hero
3. Cómo Funciona
4. Paquetes
5. FAQ
6. Formulario + Suscripción
7. Footer
```

---

## 6. Especificaciones por Sección

### 6.1 Header (sticky)

**Layout:** Logo izquierda · Nav centro · Acciones derecha

| Elemento | Detalle |
|---|---|
| Logo | Textual — "FLORES EN PAZ", tipografía serif, peso alto |
| Navegación | Servicios · Ciudades · Paquetes · Contacto (4 ítems máximo) |
| WhatsApp | Botón verde, siempre visible en desktop y móvil |
| Idioma | Toggle ES / EN, texto simple, sin banderas |
| Móvil | Hamburger menu · WhatsApp fijo siempre visible |

**Comportamiento:** transparente sobre el Hero, se vuelve opaco (blanco/crema) al hacer scroll.

---

### 6.2 Hero

**Layout:** Full-viewport (100vh), video de fondo, overlay oscuro al 40%, texto centrado

| Elemento | Detalle |
|---|---|
| Video | Autoplay · Muted · Loop · Sin controles · Footage real del servicio abarcando todo el lienzo |
| Gestión de video | Archivo o embed swappable (YouTube/Vimeo) — sin CMS |
| Overlay | Negro o verde oscuro al 40% para legibilidad |
| Título | `FLORES PARA LOS QUE SIEMPRE ESTÁN` — mayúsculas, serif elegante |
| Subtítulo | *"Porque cuidar no depende de dónde estés. Con tu decisión, nosotros llegamos por ti."* |
| CTA principal | `ELEGIR UN ARREGLO` — texto subrayado minimalista, sin apariencia de botón |
| CTA secundario | `HABLAR POR WHATSAPP` — texto subrayado minimalista, sin apariencia de botón |

**Móvil:** video abarcando toda la pantalla (100vh) · CTAs en formato texto subrayado apilados · Texto reducido pero legible.

---

### 6.3 Cómo Funciona

**Layout:** Timeline horizontal estricto tanto en desktop como en móvil (con scroll horizontal si es necesario).
**Línea conectora:** entre los 4 pasos en todos los dispositivos.

| Paso | Icono | Título | Descripción |
|---|---|---|---|
| ① | 🗺️ | Elige cementerio y fecha | Nos dices cuándo y dónde |
| ② | 💐 | Elige el arreglo que quieras | Desde un ramo simple hasta una suscripción |
| ③ | 🚶 | Nosotros llegamos por ti | Con cuidado y respeto, nos encargamos de todo |
| ④ | 📱 | Te hacemos llegar fotos y video | Para que lo veas y lo compartas |

**CTA al final del bloque:** `HABLAR POR WHATSAPP` (texto subrayado)

**Tono de descripciones:** conversacional, no instructivo. El usuario siente que es fácil, no que está siguiendo instrucciones.

---

### 6.5 Paquetes

**Layout:** 3 cards horizontales desktop · apiladas móvil (SERENIDAD primero en móvil)
**Ancla de decisión:** SERENIDAD marcado como "más elegido"

| | ESENCIAL | SERENIDAD ⭐ | MEMORIA VIVA |
|---|---|---|---|
| Contenido | Ramo flores frescas + colocación | Flores + tarjeta con mensaje | Suscripción mensual/trimestral |
| Incluye | ✓ Foto digital | ✓ Foto + Video corto | ✓ Flores frescas en cada visita |
| | ✓ Colocación | ✓ Confirmación WhatsApp | ✓ Foto y video en cada visita |
| | | ✓ Tarjeta personalizada | ✓ Recordatorios de fechas |
| Precio | Desde S/ XX (~$XX USD) | Desde S/ XX (~$XX USD) | Desde S/ XX/mes (~$XX USD) |
| CTA | HABLAR POR WHATSAPP | HABLAR POR WHATSAPP | HABLAR POR WHATSAPP |

**Reglas de precio:**
- S/ como moneda principal
- USD como referencia secundaria, en texto más pequeño
- Precios exactos a definir por el equipo de negocio

**Al final de la sección:**
> *"¿No sabes cuál elegir? Escríbenos, te ayudamos."* → WhatsApp

---

### 6.5 FAQ

**Layout:** Acordeón expandible · máximo 5 preguntas

| Pregunta |
|---|
| ¿Puedo incluir un mensaje personalizado? |
| ¿Cómo sé que realmente lo hicieron? |
| ¿Puedo pagar desde el extranjero? |
| ¿Qué flores colocan? |
| ¿Puedo programar visitas recurrentes? |

**CTA al final:**
> *"¿Tienes otra pregunta?"* → `ESCRÍBENOS POR WHATSAPP`

**Regla:** no más de 5 preguntas. Más genera ansiedad, no confianza.

---

### 6.6 Formulario + Suscripción

**Encabezado:** *"¿Listo para dar el paso? Cuéntanos y te contactamos en menos de 24 horas."*

**Campos del formulario (6 máximo):**

| Campo | Tipo |
|---|---|
| Nombre | Texto libre |
| WhatsApp | Teléfono |
| Ciudad del cementerio | Dropdown (Lima / Trujillo / Arequipa / Otra) |
| Fecha deseada | Date picker |
| Paquete | Dropdown (Esencial / Serenidad / Memoria Viva) |

**CTA:** `SOLICITAR ATENCIÓN`

**Nota de diseño:** email eliminado del formulario principal. WhatsApp es el canal — pedir email añade fricción sin beneficio en la fase de lanzamiento.

**Bloque de suscripción (secundario, separado visualmente):**
> *"También puedes suscribirte para recibir recordatorios de fechas especiales"*
> Campo email + botón `SUSCRIBIRME`

---

### 6.7 Footer

**Layout:** 4 columnas desktop · apilado móvil

| Columna | Contenido |
|---|---|
| Marca | Logo + tagline: *"Porque cuidar no depende de dónde estés."* |
| Servicios | Esencial · Serenidad · Memoria Viva |
| Ciudades | Lima · Trujillo · Arequipa |
| Legal | Privacidad · Términos · Contacto |
| Redes | Instagram · Facebook · TikTok |

**Métodos de pago:** PayPal · Visa · Mastercard · Yape · Plin

**Cierre:** `© 2026 Flores en Paz · Lima, Perú`

**Nota:** el tagline en el footer cierra el loop emocional del sitio — el mismo mensaje del Hero aparece aquí, reforzando la identidad de marca.

---

## 7. Consideraciones Mobile-First

| Elemento | Comportamiento móvil |
|---|---|
| Header | Hamburger menu · WhatsApp siempre visible |
| Hero | Video abarcando toda la pantalla (100vh) · CTAs como texto subrayado |
| Cómo funciona | Timeline horizontal (scroll horizontal si no cabe) |
| Paquetes | Cards apiladas · SERENIDAD primero |
| FAQ | Acordeón nativo |
| Formulario | Campos full-width · date picker nativo |
| WhatsApp flotante | Esquina inferior derecha · siempre visible |

---

## 8. Tipografía y Color (guía intencional, no definitiva)

| Elemento | Recomendación |
|---|---|
| Títulos | Serif elegante — Italiana |
| Cuerpo | Sans-serif legible — Raleway |
| Color primario | Verde oscuro (cementerio/naturaleza) o verde musgo |
| Color secundario | Crema / blanco roto (elegancia, paz) |
| Acento | Blanco puro para texto sobre video |
| WhatsApp | Verde oficial #25D366 |

**Principio:** paleta que evoque naturaleza, paz y cuidado — nunca oscura ni fúnebre.

---

## 9. Lo que se decidió NO incluir

| Sección | Razón |
|---|---|
| Portafolio / Galería | El Hero con video real cumple ese rol |
| Ciudades y Cementerios | Información resuelta en conversación de WhatsApp |
| Testimonios | Se puede agregar en iteración futura con datos reales |
| Fechas Especiales | Se puede agregar en iteración futura como bloque estacional |
| Checkout online | WhatsApp-first en el lanzamiento; pago en iteración futura |

---

## 10. Próximos Pasos

1. Definir precios exactos para los 3 paquetes (S/ y USD)
2. Producir o seleccionar el video del Hero
3. Escribir respuestas completas del FAQ
4. Definir paleta de colores y tipografía definitiva
5. Invocar `bmad-architecture` para decisiones técnicas (stack, CMS, hosting)
6. Invocar `writing-plans` para plan de implementación
