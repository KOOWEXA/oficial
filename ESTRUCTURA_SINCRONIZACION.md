# Documentación de Sincronización de Estructuras - KOOWEXA

## Verificación de Integridad de Enlaces

### 1. Archivos JavaScript Enlazados
✓ script.js - Core principal de funcionalidades
✓ apis.js - API integrations
✓ servicios.js - Contenido de servicios
✓ planes.js - Contenido de planes
✓ comenzar.js - Funcionalidad de comenzar
✓ poster.js - Funcionalidad del póster
✓ bot.js - Asistente bot
✓ share.js - Funcionalidad de compartir
✓ download.js - Funcionalidad de descargas
✓ main-actions.js - Conexión de botones principales

### 2. Elementos HTML Críticos y sus Referencias

#### Menú Flotante
- ID: menuToggle (botón de apertura)
- ID: menuItems (contenedor de items)
- Referenciado en: script.js (setupMenuToggle)
- Referenciado en: main-actions.js (mainMenuBtn)

#### Botones Principales
- ID: mainMenuBtn → Abre menú flotante
- ID: mainBotBtn → Abre chat del bot
- Referenciado en: main-actions.js

#### Modales
- docsModal (Servicios) - Botón: docsBtn, Cierre: docsClose
- plansModal (Planes) - Botón: plansBtn, Cierre: plansClose
- shareModal (Compartir) - Botón: shareBtn, Cierre: shareClose
- posterModal (Póster) - Botón: posterBtn, Cierre: posterClose
- Referenciados en: script.js (setupModals)

#### Botones del Menú Flotante
- startBtn → Abre email
- docsBtn → Abre modal de servicios
- posterBtn → Abre modal de póster
- shareBtn → Abre modal de compartir
- plansBtn → Abre modal de planes
- Descarga de APK → Link directo

### 3. Estilos CSS

#### Clases Principales
- .smart-menu - Menú flotante
- .action-section - Sección de acciones principal
- .action-card - Tarjetas de acción
- .action-btn - Botones de acción
- .hero-title, .hero-text - Textos del hero
- .contact-title, .contact-text - Textos de contacto
- Todas las clases usan escalado fluido con clamp()

### 4. Responsive Design

#### Breakpoints
- max-width: 320px - Pantallas muy pequeñas
- max-width: 480px - Dispositivos móviles
- min-width: 768px - Tablets
- min-width: 1024px - Pantallas grandes
- min-width: 1440px - Pantallas muy grandes

### 5. Accesibilidad

✓ Atributos aria-label en todos los botones
✓ Atributos role="dialog" en modales
✓ Atributos aria-modal="true" en modales
✓ Navegación por teclado (Tab, Enter, Escape)
✓ Soporte para prefers-reduced-motion
✓ Soporte para prefers-color-scheme

### 6. SEO y Meta Tags

✓ Schema.org JSON-LD para Organization
✓ Open Graph tags para redes sociales
✓ Twitter Card tags
✓ Favicon en múltiples formatos
✓ Sitemap.xml y sitemap-images.xml
✓ robots.txt optimizado

### 7. Flujo de Interacción

1. Usuario ve la página principal
2. En la sección "Explora nuestras soluciones":
   - Opción 1: Menú de Servicios → Abre menú flotante
   - Opción 2: Asistente Bot → Abre chat del bot
3. Menú flotante permite acceder a:
   - Comenzar Ahora (email)
   - Ver Servicios (modal)
   - Descargar App (descarga directa)
   - Ver Póster (modal)
   - Compartir (modal)
   - Planes (modal)
4. Menú flotante sigue disponible en esquina inferior derecha

### 8. Sincronización de Contenido

- Servicios: servicios.js → modal docsModal
- Planes: planes.js → modal plansModal
- Compartir: share.js → modal shareModal
- Póster: poster.js → modal posterModal
- Descargas: download.js → enlace directo

### 9. Verificación de Integridad

Todos los elementos están correctamente:
✓ Definidos en HTML
✓ Referenciados en JavaScript
✓ Estilizados en CSS
✓ Enlazados entre sí
✓ Documentados

Última actualización: 2025-12-10
