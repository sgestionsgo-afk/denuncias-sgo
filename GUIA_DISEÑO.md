# 🎨 Guía de Diseño — Estilo Minimalista Oscuro con Violeta

## Resumen de Cambios

Tu aplicación ha sido completamente rediseñada con un estilo **minimalista, oscuro y profesional**, inspirado en la estética visual de La Libertad Avanza.

### ✅ Cambios Implementados

1. **Colorimetría**
   - Color principal: **Violeta #7B2CBF** (característico de La Libertad Avanza)
   - Variantes: #9D4EDD (claro), #5A1F8E (oscuro)
   - Fondo: **Negro #000000** en toda la app
   - Superficies: Gris muy oscuro #111111
   - Bordes: Gris oscuro #333333

2. **Tipografía**
   - **Montserrat** (Google Fonts) en todo el sitio
   - Pesos: 300, 400, 500, 600, 700
   - Se carga automáticamente desde `public/index.html`

3. **Diseño**
   - Minimalista: sin sombras dramáticas, solo bordes sutiles
   - Espaciado generoso para mejor legibilidad
   - Responsivo desde móvil (mobile-first)
   - Botones elevados con interacción suave (hover y active)

4. **Mapa**
   - **CartoDB Positron Dark** como tile layer
   - Fondo muy oscuro (#0a0a0a) que armoniza con la app
   - Clusters en violeta (3 tonos según cantidad)
   - Controles oscuros con acentos violeta

---

## 📁 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| [public/index.html](public/index.html) | ✅ Google Fonts Montserrat agregado, theme-color actualizado a violeta |
| [src/styles/App.css](src/styles/App.css) | ✅ **Completamente reescrito** con CSS variables y diseño oscuro |
| [src/components/MapView.jsx](src/components/MapView.jsx) | ✅ Tile layer cambiado a CartoDB Positron Dark |

---

## 🎯 Guía de Personalización

### 1. Cambiar el Color Violeta

El color violeta principal está definido como variable CSS. Para cambiar el violeta:

**Ubicación:** `src/styles/App.css` línea 12-15

```css
:root {
  --color-violeta: #7B2CBF;           /* Cambiar este valor */
  --color-violeta-claro: #9D4EDD;     /* Variante clara */
  --color-violeta-oscuro: #5A1F8E;    /* Variante oscura */
  /* ... resto de variables ... */
}
```

**Ejemplo:** Para usar azul en lugar de violeta:
```css
--color-violeta: #0077FF;
--color-violeta-claro: #1E90FF;
--color-violeta-oscuro: #0055CC;
```

### 2. Cambiar Tipografía

Actualmente usa **Montserrat** desde Google Fonts.

**Para cambiar a otra tipografía:**

a) Actualizar `public/index.html`:
```html
<!-- Cambiar esta línea (actualmente Montserrat) -->
<link href="https://fonts.googleapis.com/css2?family=TU_FUENTE_AQUI&display=swap" rel="stylesheet" />
```

b) Actualizar `src/styles/App.css`:
```css
--font-family: "Tu Tipografía", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### 3. Ajustar Colores de Fondo

Los colores de fondo están en `src/styles/App.css` línea 17-22:

```css
--color-background: #000000;     /* Fondo general */
--color-surface: #111111;        /* Superficies (tarjetas) */
--color-surface-alt: #1a1a1a;    /* Superficies alternativas */
```

### 4. Cambiar el Mapa a Otro Estilo Oscuro

**Ubicación:** `src/components/MapView.jsx` línea 57-64

Opciones disponibles:

| Nombre | URL | Descripción |
|--------|-----|-------------|
| CartoDB Dark (actual) | `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` | Gris oscuro, muy legible |
| CartoDB Voyager Dark | `https://{s}.basemaps.cartocdn.com/rastered_dark_all/{z}/{x}/{y}{r}.png` | Oscuro con más detalles |
| Stamen TonerBackground | `https://stamen-tiles.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.png` | Minimalista en B&N |
| OpenStreetMap Dark (esmo) | `https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png` | Oscuro desde OSM |

**Cambiar el tile layer:**
```javascript
<TileLayer
  attribution='atribución aquí'
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"  /* Reemplazar URL */
  maxZoom={19}
/>
```

### 5. Modificar Espaciado

El espaciado se controla con variables CSS:

```css
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
--spacing-2xl: 3rem;
```

Para hacer la app más compacta, reduce estos valores (ej: `--spacing-lg: 1rem;`).

### 6. Modificar Border Radius

Para un diseño más redondeado o más cuadrado:

```css
--radius-sm: 4px;   /* Aumentar para más redondeado, ej: 8px */
--radius-md: 6px;
--radius-lg: 8px;
```

---

## 🎨 Paleta de Colores

```
Violeta Principal:      #7B2CBF
Violeta Claro:          #9D4EDD
Violeta Oscuro:         #5A1F8E
Background:             #000000
Surface:                #111111
Surface Alt:            #1a1a1a
Texto:                  #FFFFFF
Texto Secundario:       #CCCCCC
Bordes:                 #333333
Éxito:                  #4CAF50
Error:                  #FF6B6B
Warning:                #FFA500
```

---

## 💡 Ejemplos Prácticos

### Cambiar a un tema azul

En `src/styles/App.css`, reemplaza:
```css
--color-violeta: #1E90FF;
--color-violeta-claro: #3C9FFF;
--color-violeta-oscuro: #0055CC;
```

### Cambiar a tema claro (inverso)

```css
--color-background: #FFFFFF;
--color-surface: #F5F5F5;
--color-surface-alt: #EEEEEE;
--color-text: #000000;
--color-text-secondary: #666666;
--color-border: #DDDDDD;
```

### Hacer la app más compacta

```css
--spacing-lg: 0.75rem;
--spacing-md: 0.5rem;
--spacing-xl: 1rem;
```

---

## 📝 Notas Técnicas

- Todos los estilos usan **CSS Variables** (`:root`) para facilitar cambios globales
- La tipografía se carga desde **Google Fonts** sin dependencias adicionales
- El mapa usa **CartoDB** (gratis, sin API key)
- El diseño es **mobile-first** con media queries para pequeñas pantallas
- No hay sombras ni efectos innecesarios: solo bordes y espaciado

---

## 🔄 Proceso de Compilación y Despliegue

Después de hacer cambios en el CSS:

```bash
# Si estás en desarrollo, el navegador se recargará automáticamente
npm start

# Para producción
npm run build
```

Los cambios en CSS se ven inmediatamente en desarrollo. No necesitas instalar ninguna dependencia adicional.

---

## 🚀 Mejoras Futuras Sugeridas

1. **Modo claro/oscuro toggle**: Agregar botón para alternar temas
2. **Animaciones suaves**: Transiciones CSS para interacciones
3. **Gradientes sutiles**: Usar gradientes lineales en headers
4. **Más contraste**: Aumentar contraste de texto si es necesario para accesibilidad

---

## ❓ Soporte y Preguntas

Todos los cambios están **bien comentados** en el código. Si necesitas revertir a un color o estilo anterior, busca la variable CSS correspondiente en `src/styles/App.css`.

---

**Diseño finalizado:** 17/04/2026  
**Tipografía:** Montserrat (Google Fonts)  
**Color Principal:** Violeta #7B2CBF (La Libertad Avanza)  
**Licencia:** Uso libre para fines cívicos ✌️
