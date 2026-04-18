# 🛠️ Snippets de Personalización — Recetas Rápidas

## Copiar y Pegar Soluciones

Todos estos snippets funcionan reemplazando secciones en `src/styles/App.css`.

---

## 🎨 Paletas de Color Predefinidas

### Opción 1: Tema Azul Profesional
```css
:root {
  --color-violeta: #1E90FF;           /* Azul puro */
  --color-violeta-claro: #3C9FFF;     /* Azul claro */
  --color-violeta-oscuro: #0055CC;    /* Azul oscuro */
}
```

### Opción 2: Tema Verde Ecológico
```css
:root {
  --color-violeta: #00B341;           /* Verde */
  --color-violeta-claro: #33CC66;     /* Verde claro */
  --color-violeta-oscuro: #006B20;    /* Verde oscuro */
}
```

### Opción 3: Tema Rojo Urgencia
```css
:root {
  --color-violeta: #E63946;           /* Rojo urgencia */
  --color-violeta-claro: #FF6B6B;     /* Rojo claro */
  --color-violeta-oscuro: #A4161A;    /* Rojo oscuro */
}
```

### Opción 4: Tema Naranja Energía
```css
:root {
  --color-violeta: #FF9500;           /* Naranja */
  --color-violeta-claro: #FFB347;     /* Naranja claro */
  --color-violeta-oscuro: #CC7700;    /* Naranja oscuro */
}
```

### Opción 5: Tema Claro Moderno (Inverso)
```css
:root {
  --color-violeta: #7B2CBF;           /* Mantener violeta */
  --color-background: #F5F5F5;        /* Gris muy claro */
  --color-surface: #FFFFFF;           /* Blanco */
  --color-surface-alt: #F0F0F0;       /* Gris claro hover */
  --color-text: #1A1A1A;              /* Negro */
  --color-text-secondary: #666666;    /* Gris medio */
  --color-border: #E0E0E0;            /* Gris claro bordes */
}
```

---

## 📊 Compactación de Espaciado

### Opción A: Muy Compacto (Móviles)
```css
--spacing-xs: 0.125rem;
--spacing-sm: 0.25rem;
--spacing-md: 0.5rem;
--spacing-lg: 0.75rem;
--spacing-xl: 1rem;
--spacing-2xl: 1.5rem;
```

### Opción B: Generoso (Desktop)
```css
--spacing-xs: 0.5rem;
--spacing-sm: 1rem;
--spacing-md: 1.5rem;
--spacing-lg: 2rem;
--spacing-xl: 3rem;
--spacing-2xl: 4rem;
```

### Opción C: Equilibrio (Actual - Recomendado)
```css
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
--spacing-2xl: 3rem;
```

---

## 🎭 Tipografías Alternativas

### Cambiar a Inter (Moderna y Limpia)
```css
/* Agregar en public/index.html */
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

/* Cambiar en App.css */
--font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Cambiar a Playfair Display (Elegante)
```css
/* Agregar en public/index.html */
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />

/* Cambiar en App.css */
--font-family: "Playfair Display", serif;
```

### Cambiar a Roboto (Google Standard)
```css
/* Agregar en public/index.html */
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

/* Cambiar en App.css */
--font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Cambiar a Raleway (Minimalista)
```css
/* Agregar en public/index.html */
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

/* Cambiar en App.css */
--font-family: "Raleway", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

## 🗺️ Opciones de Mapas Oscuros

### CartoDB Voyager Dark (Más detalles)
```javascript
/* En MapView.jsx */
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/rastered_dark_all/{z}/{x}/{y}{r}.png"
  maxZoom={19}
/>
```

### Stamen Toner (Minimal B&W)
```javascript
<TileLayer
  attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>'
  url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
  maxZoom={20}
/>
```

### OpenStreetMap Positron Light (Para tema claro)
```javascript
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  maxZoom={19}
/>
```

### Google Maps Style (Requiere API Key)
```javascript
/* Alternativa si quieres Google Maps */
/* Nota: Requiere API Key y componente diferente */
```

### USGS Topo (Topográfico oscuro)
```javascript
<TileLayer
  attribution='&copy; <a href="https://www.usgs.gov/">USGS</a>'
  url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"
  maxZoom={16}
/>
```

---

## 🔘 Estilos de Botones Alternativos

### Opción 1: Botones Outline (Solo borde)
```css
.btn-geo,
.btn-enviar,
.btn-cerrar-sesion {
  background-color: transparent;
  border: 2px solid var(--color-violeta);
  color: var(--color-violeta);
}

.btn-geo:hover,
.btn-enviar:hover,
.btn-cerrar-sesion:hover {
  background-color: var(--color-violeta);
  color: var(--color-background);
}
```

### Opción 2: Botones Flat (Sin borde)
```css
.btn-geo,
.btn-enviar,
.btn-cerrar-sesion {
  background-color: var(--color-violeta);
  border: none;
  border-radius: 0;
  color: var(--color-background);
}

.btn-geo:hover,
.btn-enviar:hover,
.btn-cerrar-sesion:hover {
  background-color: var(--color-violeta-claro);
}
```

### Opción 3: Botones Gradient
```css
.btn-geo,
.btn-enviar,
.btn-cerrar-sesion {
  background: linear-gradient(135deg, var(--color-violeta) 0%, var(--color-violeta-claro) 100%);
  border: none;
  color: #FFF;
}

.btn-geo:hover,
.btn-enviar:hover,
.btn-cerrar-sesion:hover {
  background: linear-gradient(135deg, var(--color-violeta-claro) 0%, var(--color-violeta-oscuro) 100%);
}
```

---

## 📱 Breakpoints Personalizados

### Mobile-first Actual
```css
/* Base: móvil (320px-640px) */
/* Tablet: 641px-1024px */
@media (max-width: 640px) { }
@media (min-width: 641px) { }
@media (min-width: 1025px) { }
```

### Breakpoints Expandidos
```css
/* Extra pequeño: < 480px */
@media (max-width: 479px) { }

/* Pequeño: 480px - 640px */
@media (min-width: 480px) and (max-width: 640px) { }

/* Medio: 641px - 1024px */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Grande: 1025px - 1440px */
@media (min-width: 1025px) and (max-width: 1440px) { }

/* Muy grande: > 1440px */
@media (min-width: 1441px) { }
```

---

## 🎯 Ejemplos de Uso

### Cambiar TODO a tema azul + tipografía Inter
```bash
# 1. Editar public/index.html: Cambiar link de Montserrat a Inter
# 2. Editar src/styles/App.css: 
#    - Reemplazar variables de color con "Tema Azul Profesional"
#    - Reemplazar --font-family con Inter
# 3. npm start
# 4. Verifica en http://localhost:3000
```

### Hacer interfaz muy compacta para móviles
```bash
# 1. Editar src/styles/App.css:
#    - Reemplazar --spacing variables con "Muy Compacto"
# 2. npm start
# 3. Abre Developer Tools (F12) y ve en dispositivo móvil
```

### Cambiar mapa a Stamen Toner (Minimalista B&W)
```bash
# 1. Editar src/components/MapView.jsx línea ~57:
#    - Reemplazar TileLayer URL con "Stamen Toner"
# 2. npm start
# 3. Navega a /mapa para ver cambio
```

---

## ⚙️ Combinaciones Recomendadas

### Combo 1: Tema Claro + Green Energy
```
- Tema Claro Moderno (Inverso)
- Violeta → Verde Ecológico
- Montserrat
- CartoDB Light tiles
→ Ideal para: Medio ambiente, sustentabilidad
```

### Combo 2: Dark + Azul Profesional
```
- Tema Oscuro (Actual)
- Violeta → Azul Profesional
- Inter
- CartoDB Dark tiles
→ Ideal para: Empresas, gobiernos, profesionales
```

### Combo 3: Dark + Rojo Urgencia
```
- Tema Oscuro (Actual)
- Violeta → Rojo Urgencia
- Roboto
- CartoDB Dark tiles
→ Ideal para: Emergencias, alertas, urgencias
```

### Combo 4: Claro + Naranja Energía
```
- Tema Claro (Inverso)
- Violeta → Naranja Energía
- Raleway
- CartoDB Light tiles
→ Ideal para: Startup, joven, energético
```

---

## 🚀 Próximas Mejoras

### Agregar CSS Grid al formulario
```css
.report-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

@media (max-width: 640px) {
  .report-form {
    grid-template-columns: 1fr;
  }
}
```

### Agregar animaciones suaves
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navbar,
.report-form,
.map-container,
.admin-panel {
  animation: fadeIn 0.3s ease-out;
}
```

### Agregar tema oscuro/claro toggle
```css
/* Agregar atributo en HTML */
html.light-mode {
  --color-background: #F5F5F5;
  --color-surface: #FFFFFF;
  --color-text: #1A1A1A;
  /* etc... */
}
```

---

## 📚 Recursos Útiles

- **Google Fonts:** https://fonts.google.com/
- **Color Picker:** https://www.colorhexa.com/
- **CSS Generator:** https://cssgenerator.org/
- **Responsive Test:** https://responsivedesignchecker.com/
- **Leaflet Docs:** https://leafletjs.com/
- **CartoDB Tiles:** https://carto.com/help/building-maps/basemap-list/

---

**Última actualización:** 17/04/2026  
**Versión:** 1.0  
**Autor:** GitHub Copilot
