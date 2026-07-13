# Verdea — Primera entrega + Landing de marketing

Dos experiencias conviven en el mismo proyecto Next.js:

- **Sitio de marketing** (`/`, `/sobre-nosotros`, `/productos`,
  `/como-funciona`, `/contacto`, `/login`, `/registro`) — público,
  multipágina, con una identidad visual vívida y "tech".
- **Plataforma / dashboard** (`/app`, `/app/plantas`,
  `/app/disena-tu-espacio`, etc.) — el prototipo de producto original,
  con la identidad botánica y calmada, para pruebas de usuario.

## 0. Qué cambió en esta iteración

- Se separó el proyecto en dos layouts con App Router:
  - `app/layout.tsx`: layout raíz mínimo (fonts + `<html>/<body>`).
  - `app/(marketing)/layout.tsx`: header + footer del sitio público
    (route group, no agrega segmento a la URL).
  - `app/app/layout.tsx`: sidebar + header del dashboard (agrega el
    prefijo real `/app` a todas las rutas de la plataforma).
- Todas las rutas y componentes de la plataforma (`AppSidebar`,
  `Header`, `PlantCard`, `PackagesPreview`, `Categories`, `Hero`, etc.)
  se actualizaron para enlazar con el prefijo `/app/...`.
- Se agregó una nueva identidad visual "tech" para el sitio de
  marketing (ver sección 2), sin tocar la paleta botánica del
  dashboard.
- Nuevas páginas: Inicio (marketing), Sobre nosotros, Productos, Cómo
  funciona, Contacto, Login y Registro (estos dos últimos son
  formularios de interfaz únicamente — no hay autenticación real,
  como pide el brief original; el botón "Continuar como invitado"
  lleva directo a `/app`).

## 1. Resumen de lo implementado (entrega original)

- **Arquitectura completa del proyecto** (carpetas, tipos, datos mock, tienda
  de estado, analítica local) preparada para crecer en fases futuras.
- **Diseña tu espacio con IA** — flujo completo y funcional dentro de
  `/app/disena-tu-espacio`.
- **Explorar plantas**, **Paquetes**, **Smart Care**, **Mis propuestas**
  dentro de `/app`.
- **Analítica local instrumentada** (`lib/analytics.ts`), panel oculto en
  `/app/prototype-insights` (no aparece en ningún menú).

## 2. Sistema de diseño del sitio de marketing

Paleta ("tech", en `tailwind.config.ts` bajo la clave `tech`):

| Token | Hex | Uso |
|---|---|---|
| `tech-canopy` | `#0A1F16` | Fondo base |
| `tech-canopy2` | `#0F2B1E` | Fondo de secciones alternas / tarjetas |
| `tech-ink` | `#0D1712` | Texto sobre fondos claros (botones lima) |
| `tech-lime` | `#A6FF3C` | Acento principal / CTAs |
| `tech-teal` | `#17E9B0` | Acento secundario / detalles |
| `tech-violet` | `#8B7CFF` | Reservado para variaciones futuras |

Tipografía: **Space Grotesk** (`font-grotesk`) para títulos, **Manrope**
(`font-sans`) para cuerpo, **IBM Plex Mono** (`font-mono`) para
eyebrows, cifras y detalles técnicos.

Elemento de firma: `components/marketing/CircuitLeaf.tsx`, una hoja
con "venas" de circuito que se dibujan con una animación de trazo al
cargar la página — la metáfora visual de "planta + tecnología".

La plataforma (`/app/...`) conserva su paleta original (`brand-*`,
verde bosque / crema / terracota) sin cambios.

## 3. Instrucciones para ejecutar

```bash
npm install
npm run dev
```

- Sitio de marketing: `http://localhost:3000/`
- Plataforma / dashboard: `http://localhost:3000/app`

```bash
npm run lint
npm run typecheck
```

## 4. Decisiones técnicas

- **Zustand** para el borrador en construcción (`useDraftStore`, en memoria
  durante la sesión) y para las propuestas guardadas (`useProposalsStore`,
  con middleware `persist` sobre LocalStorage).
- **Simulación de IA basada en reglas** (`lib/ai-simulator.ts`).
- **Precios centralizados** en `data/packages.ts` y en cada entrada de
  `data/plants.ts` / `data/planters.ts`.
- **Imágenes**: placeholders de Unsplash centralizados en cada archivo de
  datos. Como este entorno no tuvo acceso a internet para verificarlas,
  revisa las imágenes al correr el proyecto y reemplaza cualquier URL
  rota por fotografía real antes de mostrarlo a usuarios.
- **Login / Registro**: solo interfaz. El envío del formulario simula
  una carga breve y redirige a `/app`; no hay backend ni validación de
  credenciales real, tal como pide el brief.

## 5. Funcionalidades pendientes (fases futuras)

- Arma tu planta (configurador paso a paso tipo "Subway").
- Carrito funcional, checkout simulado y modal de confirmación de "sin
  cobro real".
- Autenticación real, backend (Supabase), pagos (Stripe), WhatsApp, IA
  multimodal real.

## 6. Pruebas realizadas (manuales)

- Navegación completa del sitio de marketing (Inicio → Sobre nosotros →
  Productos → Cómo funciona → Contacto → Login/Registro) sin enlaces
  rotos.
- Los CTAs "Diseñar mi espacio" y los enlaces del footer llevan
  correctamente a las rutas `/app/...`.
- El menú móvil del sitio de marketing abre/cierra y sus enlaces
  cierran el menú al navegar.
- El formulario de contacto muestra el estado de confirmación tras
  enviarse (sin llamada de red).
- Flujo completo del dashboard (`/app/disena-tu-espacio` → resultados →
  guardar propuesta → encuesta → `/app/propuestas`) sigue funcionando
  igual que en la entrega anterior, ahora bajo el prefijo `/app`.

## 7. Estructura de archivos

```
verdea/
  app/
    layout.tsx                      # Layout raíz mínimo (fonts, html/body)
    globals.css
    (marketing)/                    # Sitio público — no agrega segmento de URL
      layout.tsx                    # MarketingHeader + MarketingFooter
      page.tsx                      # Inicio (marketing)
      sobre-nosotros/page.tsx
      productos/page.tsx
      como-funciona/page.tsx
      contacto/page.tsx
      login/page.tsx
      registro/page.tsx
    app/                            # Plataforma — vive bajo /app/...
      layout.tsx                    # AppSidebar + Header + MobileNav
      page.tsx                      # Home del dashboard
      disena-tu-espacio/
        page.tsx
        resultados/page.tsx
      plantas/page.tsx
      plantas/[slug]/page.tsx
      paquetes/page.tsx
      paquetes/[slug]/page.tsx
      smart-care/page.tsx
      propuestas/page.tsx
      arma-tu-planta/page.tsx
      carrito/page.tsx
      ayuda/page.tsx
      prototype-insights/page.tsx
  components/
    marketing/                      # MarketingHeader, MarketingFooter, CircuitLeaf
    layout/                         # AppSidebar, MobileNav, Header (plataforma)
    home/                           # Hero, HowItWorks, Categories, etc. (plataforma)
    disena/                         # RoomUploader, RoomQuestions, etc.
    plants/PlantCard.tsx
    ui/                             # EmptyState, ConfirmationModal, FeedbackSurvey...
  data/                             # plants, planters, decorations, packages, etc.
  lib/                              # store.ts, analytics.ts, ai-simulator.ts, utils.ts
  types/index.ts
```


