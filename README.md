# Denuncias Vía Pública — Santiago del Estero Capital

App web para que cualquier persona pueda reportar problemas en la vía pública
(baches, iluminación, basura, etc.) de Santiago del Estero Capital.

---

## Estructura del Proyecto

```
denuncias-santiago-capital/
├── public/
│   └── index.html              # HTML base con CDN de Leaflet
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Barra de navegación
│   │   ├── ReportForm.jsx      # Formulario de denuncia
│   │   ├── MapView.jsx         # Mapa público (sin textos privados)
│   │   └── AdminPanel.jsx      # Panel admin protegido por contraseña
│   ├── config/
│   │   ├── barrios.js          # Lista de barrios con coordenadas
│   │   └── api.js              # URL del Apps Script y configuración
│   ├── styles/
│   │   └── App.css             # Estilos de la aplicación
│   ├── App.jsx                 # Componente principal con rutas
│   └── index.js                # Punto de entrada de React
├── google-apps-script/
│   └── Code.gs                 # Código del Google Apps Script
├── package.json
└── README.md                   # Este archivo
```

---

## Configuración paso a paso

### 1. Crear la Google Sheet

1. Andá a [Google Sheets](https://sheets.google.com) y creá una hoja nueva.
2. Renombrá la primera hoja (pestaña de abajo) a: **`Denuncias`**
3. En la **fila 1**, poné estos encabezados exactos:

| A | B | C | D | E |
|---|---|---|---|---|
| Fecha | Barrio | Denuncia | Latitud | Longitud |

### 2. Crear el Google Apps Script

1. Dentro de la misma Google Sheet, andá a **Extensiones → Apps Script**.
2. Se abre el editor de Apps Script. Borrá todo el contenido del archivo `Code.gs`.
3. Copiá y pegá el contenido completo del archivo `google-apps-script/Code.gs`.
4. **Importante:** Verificá que la variable `CLAVE_ADMIN` en el script coincida
   con la de `src/config/api.js` (por defecto es `"admin2026"`).
5. Guardá el proyecto (Ctrl+S).

### 3. Desplegar el Apps Script como Web App

1. En el editor de Apps Script, hacé clic en **Implementar → Nueva implementación**.
2. En "Tipo", seleccioná **Aplicación web**.
3. Configurá:
   - **Descripción:** "API Denuncias"
   - **Ejecutar como:** Tu cuenta de Google
   - **Quién tiene acceso:** **Cualquier persona**
4. Hacé clic en **Implementar**.
5. Google te va a pedir que autorices el acceso. Aceptá los permisos.
6. **Copiá la URL** que te da (tiene formato `https://script.google.com/macros/s/.../exec`).

### 4. Configurar la URL en el proyecto React

1. Abrí el archivo `src/config/api.js`.
2. Reemplazá el valor de `GOOGLE_SCRIPT_URL` con la URL que copiaste:

```javascript
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/TU_ID_REAL/exec";
```

### 5. Instalar dependencias y ejecutar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La app se abre en `http://localhost:3000`.

---

## Rutas de la aplicación

| Ruta | Descripción |
|------|-------------|
| `/` | Formulario para enviar denuncias |
| `/mapa` | Mapa público con ubicaciones (SIN texto de denuncia) |
| `/admin` | Panel de administración (requiere contraseña) |

---

## Seguridad y privacidad

- **Mapa público:** Muestra SOLAMENTE la ubicación y el barrio. Nunca el texto de la denuncia.
- **Panel admin:** Protegido por contraseña. Muestra todos los detalles.
- **Geolocalización:** Es completamente opcional. El usuario decide si comparte su ubicación.
- **Anonimato:** No se recolectan datos personales del denunciante.

### Notas sobre seguridad

La contraseña del panel admin se valida del lado del cliente. Para un entorno
de producción real, se recomienda:
- Usar autenticación OAuth con Google
- O proteger la ruta del admin con un servicio de autenticación

---

## Actualizar el despliegue del Apps Script

Si modificás el código del Apps Script:

1. Andá al editor de Apps Script.
2. **Implementar → Administrar implementaciones**.
3. Editá la implementación existente y hacé clic en **Implementar**.
4. Usá la **misma URL** (no cambia).

---

## Personalización

- **Agregar/quitar barrios:** Editá `src/config/barrios.js`
- **Cambiar contraseña admin:** Modificá `ADMIN_PASSWORD` en `src/config/api.js`
  Y también `CLAVE_ADMIN` en `google-apps-script/Code.gs`
- **Cambiar centro del mapa:** Ajustá `MAP_CENTER` en `src/config/api.js`
- **Estilos visuales:** Todo en `src/styles/App.css`

---

## Tecnologías usadas

- **React 18** — Interfaz de usuario
- **React Router v6** — Navegación por rutas
- **React Leaflet + Leaflet** — Mapa interactivo (gratis, sin API key)
- **Leaflet MarkerCluster** — Agrupamiento de marcadores
- **Google Sheets** — Base de datos
- **Google Apps Script** — API REST gratuita

---

## Licencia

Proyecto de uso libre para fines cívicos y comunitarios.
