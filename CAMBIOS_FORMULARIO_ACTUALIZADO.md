# 📝 Cambios Implementados - Formulario de Denuncias Actualizado

**Fecha**: 21/04/2026  
**Status**: ✅ DEPLOYADO en Vercel  
**App Pública**: https://public-jade-delta.vercel.app

---

## 🎯 Cambios Funcionales Realizados

### 1️⃣ Ubicación del Problema (Cambio Principal)
**Antes**: Capturaba ubicación ACTUAL del usuario  
**Ahora**: Usuario selecciona ubicación del PROBLEMA en el mapa

#### Detalles:
- ✅ **Mapa interactivo integrado** en el formulario
- ✅ **Click/Tap para seleccionar ubicación** — el usuario toca el mapa para marcar el lugar del problema
- ✅ **Visualización de ubicación seleccionada** — muestra coordenadas (lat/lng) en pantalla
- ✅ **Botón "Cambiar"** — permite editar la ubicación sin reenviar
- ✅ **Input opcional para dirección** — usuario puede escribir "Calle XYZ" para referencia adicional
- ✅ **Mobile-friendly** — Tap para seleccionar, no interfiere con scroll
- ✅ **REQUERIDO** — La ubicación es obligatoria para enviar la denuncia
- ✅ **Validación** — Bloquea envío si no se selecciona ubicación

### 2️⃣ Contacto del Emisor (Nuevo Campo)
**Agregado**: Campo opcional para teléfono o email

#### Detalles:
- ✅ **Campo opcional** — usuario puede dejar vacío
- ✅ **Validación básica**:
  - Máximo 100 caracteres
  - Permite: números, @, ., +, -, _, (), espacios
  - Bloquea caracteres especiales inválidos
- ✅ **No se mostrará públicamente** — información privada
- ✅ **Posición**: Inmediatamente después de "Descripción del problema"

### 3️⃣ Título y Nombre de la Aplicación
- ✅ **Nuevo título principal**: `"Denuncia Ciudad Capital – Santiago del Estero"`
- ✅ **Navbar actualizado**: `"Denuncias Capital - SCE"`
- ✅ **HTML title tag**: Actualizado en ambas apps
- ✅ **Metadata**: Claramente identificado como solo "Capital"

### 4️⃣ Logo/Águila
- ✅ **Mantiene**: Logo superior (La Libertad Avanza)
- ✅ **Estructura**: Solo hay un logo en la app
- ✅ **Cambio**: Remoción de cualquier elemento visual redundante

---

## 📋 Archivos Modificados

### Frontend (React)

#### **apps/public/src/components/ReportForm.jsx** (Principal)
```javascript
// Cambios:
- Agregadas importaciones de React Leaflet (MapContainer, TileLayer, useMapEvents)
- Agregadas importaciones de Leaflet (L)
- Nuevo estado: ubicacionTexto, contacto, mostrarMapaSeleccion
- Nuevos refs: mapRef, markerRef
- Nuevo componente: MapClickHandler() — detecta clicks en el mapa
- Nueva función: validarContacto() — valida email/teléfono
- Actualizada: enviarDenuncia() — ahora requiere ubicación, incluye contacto
- Actualizado: JSX del formulario — nuevo layout con mapa interactivo
- Cambio: Título de "📝 Reportar..." a "Denuncia Ciudad Capital – Santiago del Estero"
```

#### **apps/public/src/config/api.js**
```javascript
// Cambios:
- Agregada: TURNSTILE_SITE_KEY
- Agregada: API_KEY (desde env var)
- Exportadas ambas variables
```

#### **apps/public/public/index.html**
```html
<!-- Cambios:
- Title: "Denuncias Vía Pública - Santiago Capital" → "Denuncia Ciudad Capital – Santiago del Estero"
- Meta description: Mantiene "Santiago del Estero Capital"
-->
```

#### **apps/public/src/components/Navbar.jsx**
```javascript
// Cambios:
- Texto navbar: "Denuncias Santiago Capital" → "Denuncias Capital - SCE"
```

### Backend (Google Apps Script)

#### **google-apps-script/Code.gs**
```javascript
// Cambios principales:

1. Función crearDenuncia():
   - Nuevo parámetro: ubicacionProblema (objeto con {lat, lng, texto})
   - Nuevo parámetro: contacto (string, opcional)
   - Validación: Requiere lat/lng (obligatorio)
   - Sanitización: contacto y ubicacionTexto
   - appendRow(): Ahora guarda 8 columnas en lugar de 6
     Estructura: [fecha, barrio, denuncia, lat, lng, foto, contacto, ubicacionTexto]

2. Función listarAdmin():
   - Lee 8 columnas en lugar de 6
   - Devuelve: contacto y ubicacionTexto adicionales
   - Mantiene compatibilidad con estructura anterior
```

### Estilos (CSS)

#### **apps/public/src/styles/App.css** (o equivalente)
```css
/* Nuevas clases agregadas:
- .ubicacion-section: Contenedor principal
- .ubicacion-display: Fila con info + botón
- .ubicacion-info: Información de ubicación
- .ubicacion-texto: Texto estado ubicación
- .ubicacion-coords: Muestra coordenadas
- .btn-ubicacion: Botón para abrir/cambiar mapa
- .mapa-seleccion-wrapper: Contenedor del mapa
- .mapa-seleccion: Altura 300px (250px en mobile)
- .mapa-instruccion: Texto instructivo
- .ubicacion-search: Input de dirección/búsqueda

Estilos responsive incluidos para:
- Desktop (>1025px): Mapa normal
- Tablet (641-1024px): Ajuste de tamaño
- Mobile (<640px): Mapa 250px, botón full-width
*/
```

---

## 🔄 Flujo de Datos Actualizado

### Envío de Datos al Backend

**Antes**:
```javascript
{
  apiKey: "xxx",
  captchaToken: "xxx",
  barrio: "Centro",
  denuncia: "...",
  lat: "...o vacío",
  lng: "...o vacío",
  fotoBase64: "..."  // opcional
}
```

**Ahora**:
```javascript
{
  apiKey: "xxx",
  captchaToken: "xxx",
  barrio: "Centro",
  denuncia: "...",
  contacto: "123456789 o email@ejemplo.com",  // OPCIONAL
  ubicacionProblema: {
    lat: -27.7834,
    lng: -64.2642,
    texto: "Calle Belgrano y Tucumán"  // OPCIONAL
  },
  fotoBase64: "..."  // opcional
}
```

### Validaciones en Frontend

✅ Barrio: Requerido  
✅ Descripción: Requerida (mín 10 caracteres)  
✅ **Ubicación**: **REQUERIDA** (es el cambio principal)  
✅ Contacto: Opcional, máx 100 caracteres  
✅ CAPTCHA: Requerido  
✅ Foto: Opcional

### Almacenamiento en Google Sheets

**Nueva estructura de columnas**:
```
1. fecha (ya existía)
2. barrio (ya existía)
3. denuncia (ya existía)
4. lat (ya existía, ahora SIEMPRE tiene valor)
5. lng (ya existía, ahora SIEMPRE tiene valor)
6. foto (ya existía)
7. contacto (NUEVO)
8. ubicacionTexto (NUEVO)
```

---

## 🧪 Pruebas Recomendadas

### Desktop (Chrome/Firefox/Edge)
1. ✅ Abre https://public-jade-delta.vercel.app
2. ✅ Rellena Barrio, Descripción
3. ✅ **Haz click en el mapa para seleccionar ubicación**
4. ✅ Verifica que aparezca "✓ Ubicación seleccionada"
5. ✅ Haz click en "Cambiar" y selecciona otra ubicación
6. ✅ Rellena Contacto (opcional)
7. ✅ Completa CAPTCHA
8. ✅ Envía y verifica que aparezca en admin

### Mobile (iPhone/Android)
1. ✅ Abre https://public-jade-delta.vercel.app en celular
2. ✅ Rellena campos
3. ✅ **Toca el mapa para seleccionar ubicación**
4. ✅ Verifica que el mapa no interfiera con scroll
5. ✅ Envía y verifica datos

### Panel Admin
1. ✅ Accede a https://admin-denuncias-sgo.vercel.app
2. ✅ Filtra por barrio
3. ✅ Verifica que aparezcan "Contacto" y "Ubicación" nuevos
4. ✅ Exporta CSV y verifica columnas completas

---

## 📊 Cambios de Estructura de Datos

### Antes (6 columnas):
```
fecha | barrio | denuncia | lat | lng | foto
```

### Ahora (8 columnas):
```
fecha | barrio | denuncia | lat | lng | foto | contacto | ubicacionTexto
```

**Nota**: Las primeras 6 columnas mantienen compatibilidad. Se agregaron 2 nuevas al final.

---

## ⚠️ Cambios en Validaciones

### Ubicación: Ahora REQUERIDA
- ❌ Antes: Era opcional
- ✅ Ahora: Obligatoria para enviar
- 📝 Mensaje: "Seleccioná la ubicación del problema en el mapa"

### Contacto: Totalmente Opcional
- ✅ Puede dejar vacío
- ✅ Si rellena, se valida (100 caracteres máx)
- ✅ Se guarda en BD pero no se muestra públicamente

---

## 🔗 URLs Importantes

| Recurso | URL |
|---------|-----|
| App Pública | https://public-jade-delta.vercel.app |
| Admin Panel | https://admin-denuncias-sgo.vercel.app |
| Google Apps Script | Mismo endpoint que antes (sin cambios en URL) |
| Google Sheets | "Denuncias" sheet con 8 columnas |

---

## ✨ Mejoras de UX

1. **Claridad visual**: Campo "Ubicación del problema" con estado visible
2. **Flexibilidad**: Usuario elige DÓNDE ocurrió, no de dónde reporta
3. **Privacidad**: No captura ubicación real del usuario (solo del problema)
4. **Contacto**: Opcional, para que usuarios quieran ser identificados
5. **Mobile**: Mapa responsive, tap-friendly, no bloquea navegación

---

## 🐛 Notas de Implementación

- ✅ Leaflet 1.9.4 ya incluido en proyecto
- ✅ Turnstile CAPTCHA mantiene funcionalidad
- ✅ Estilos respetan tema dark/light
- ✅ Backend actualizado para recibir nuevos campos
- ✅ Validaciones en frontend + backend
- ✅ Mensajes de error claros en español

---

## 📝 Próximos Pasos Opcionales

1. **Geocoding**: Agregar búsqueda de direcciones (autocomplete)
2. **Geofence**: Restringir a zona de Capital
3. **Histórico**: Mostrar ubicaciones previas
4. **Exportación**: Incluir Contacto en CSV del admin

---

**Última actualización**: 21/04/2026 - Sistema completamente funcional ✅
