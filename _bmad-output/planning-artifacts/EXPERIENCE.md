# Foundation

**Form-Factor:** Mobile-first responsive web landing page.
**UI System:** HTML/CSS (posiblemente Tailwind CSS) o React/Next.js simple. El aspecto visual se rige estrictamente por `DESIGN.md`.

# Information Architecture

El sitio es una experiencia de una sola página (Landing Page) diseñada para llevar al usuario gradualmente hacia la conversión vía WhatsApp.

1. **Header (Sticky)**
2. **Hero** (Video real abarcando todo el viewport, Título emocional, Enlaces subrayados)
3. **Cómo Funciona** (4 pasos del proceso en timeline horizontal)
4. **Paquetes** (Esencial, Serenidad, Memoria Viva)
5. **FAQ** (Dudas comunes resueltas)
6. **Formulario + Suscripción** (Captura de leads secundaria)
7. **Footer** (Legal y redes)

*(Secciones excluidas intencionalmente para la v1: Barra de Confianza (iconos), Portafolio extendido, Lista detallada de ciudades/cementerios, Testimonios, Fechas especiales, Checkout e-commerce).*

# Voice and Tone

- **Tú / ti** en contextos emocionales y de venta (Hero, Paquetes, Cómo Funciona, FAQ). *"Con tu decisión, nosotros llegamos por ti."*
- **Usted** en contextos legales o formales (Formulario de contacto, Términos y Condiciones).
- El tono general es empático, cálido, directo y poético donde la emoción lo requiere. Nunca frío ni transaccional.

# Component Patterns

**WhatsApp Floating Action Button (FAB):**
- Presente en la esquina inferior derecha en dispositivos móviles y desktop.
- Interacción: Un clic abre directamente la app de WhatsApp o WhatsApp Web con un mensaje predefinido (ej. *"Hola, quisiera información sobre el servicio de Flores en Paz"*).

**Video Hero:**
- Reproducción automática (`autoplay`), silenciado (`muted`), en bucle (`loop`).
- Sin controles de reproducción visibles.
- Actúa como fondo vivo, abarcando todo el ancho y alto del viewport (`100vh`), aportando prueba social inmediata.

**Paquetes Cards:**
- La tarjeta central ("SERENIDAD") debe destacarse visualmente (ej. una etiqueta de "Más elegido" o un borde sutil).
- Al hacer clic en el enlace de WhatsApp de una tarjeta específica, el mensaje predefinido incluye el nombre del paquete (ej. *"Hola, me interesa el paquete Serenidad"*).

# State Patterns

- **Header Scroll:** El Header inicia con fondo transparente sobre el video del Hero. Al hacer scroll hacia abajo, adquiere un fondo sólido (crema o blanco) y sombra sutil para mantenerse visible y legible sobre el resto del contenido.
- **Accordion Expand (FAQ):** Transición suave al abrir/cerrar. Solo una pregunta abierta a la vez (comportamiento opcional pero recomendado para reducir scroll).

# Interaction Primitives

- **Scroll lineal:** La página está diseñada para ser consumida verticalmente de principio a fin, construyendo el caso y la confianza paso a paso.
- **Conversión rápida:** Siempre hay un enlace de "Hablar por WhatsApp" visible en pantalla o el FAB a un tap de distancia.

# Accessibility Floor

- Alto contraste garantizado: El texto blanco sobre el video del Hero requiere el overlay oscuro al 40% para pasar las normas de contraste (WCAG AA mínimo).
- Tamaños de fuente legibles, mínimo 16px para el cuerpo en móvil.
- Objetivos táctiles (enlaces de texto subrayado, headers de FAQ) de al menos 44x44px, incluso si visualmente son solo texto.
- El video del Hero no debe contener destellos rápidos ni flashes para evitar problemas de fotosensibilidad.

# Key Flows

**Flow 1: Familiar en el exterior activa el servicio (Vía Redes)**
1. **Entrada:** Mary vive en Miami. Ve un TikTok emocionante de una entrega de flores en Lima. Hace clic en el enlace de la bio.
2. **Descubrimiento (Hero):** Carga la web en su móvil. Ve el video de fondo a pantalla completa y lee *"Porque cuidar no depende de dónde estés. Con tu decisión, nosotros llegamos por ti."* Siente alivio.
3. **Validación (Proceso):** Hace scroll. Ve en el timeline horizontal que el proceso son solo 4 pasos sencillos y le enviarán foto/video.
4. **Decisión (Paquetes):** Ve los paquetes. Decide que "Serenidad" es perfecto porque incluye video y tarjeta. 
5. **Clímax (Conversión):** Toca el enlace subrayado "Hablar por WhatsApp". Se abre la app con el mensaje listo. Un humano le responde, cerrando la venta con calidez.
