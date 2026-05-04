# Denuncias Vía Pública — Santiago del Estero Capital

App web para que cualquier persona pueda reportar problemas en la vía pública (baches, iluminación, basura, etc.) de Santiago del Estero Capital.

**Estado:** ✅ Funcional | **Última actualización:** Mayo 2026

---

## 🚀 Inicio Rápido

⚠️ **Si es la primera vez que configuras esto**, lee la **[GUIA_COMPLETA_SETUP.md](GUIA_COMPLETA_SETUP.md)** — tiene paso a paso de todo.

Si ya está configurado y solo querés que funcione:

```bash
# Instalar dependencias
npm install

# Iniciar app pública (formulario)
cd apps/public && npm start

# En otra terminal: iniciar app admin (dashboard)
cd apps/admin && npm start
```

---

## 📋 Guías Documentación

| Documento | Para quién | Contenido |
|-----------|-----------|----------|
| [**GUIA_COMPLETA_SETUP.md**](GUIA_COMPLETA_SETUP.md) | **TODOS (leer primero)** | Paso a paso: Google Sheets, Apps Script, Cloudflare, Vercel, .env, testing |
| [**CONFIGURACION_GOOGLE_APPS_SCRIPT.md**](CONFIGURACION_GOOGLE_APPS_SCRIPT.md) | Backend developers | Script Properties, debugging, verificación |
| [**TROUBLESHOOTING.md**](TROUBLESHOOTING.md) | Cuando algo no funciona | Errores comunes y soluciones |
| [**ARQUITECTURA.md**](ARQUITECTURA.md) | Tech leads | Estructura del proyecto, componentes, flujo de datos |

---

## 📚 Estructura del Proyecto

```
denuncias-santiago-capital/
├── apps/
│   ├── admin/                    ← Dashboard admin (Vercel app)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── config/
│   │   │   │   └── api.js
│   │   │   └── App.jsx
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── public/                   ← App pública (Vercel app)
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   │   ├── ReportForm.jsx
│       │   │   ├── MapView.jsx
│       │   │   └── ...
│       │   ├── config/
│       │   │   ├── api.js
│       │   │   └── barrios.js
│       │   └── App.jsx
│       ├── .env.example
│       └── package.json
│
├── google-apps-script/           ← Backend (Google Sheets + Script)
│   └── Code.gs                   (desplegado como Web App)
│
├── GUIA_COMPLETA_SETUP.md        ← 👈 LEE ESTO PRIMERO
├── CONFIGURACION_GOOGLE_APPS_SCRIPT.md
├── TROUBLESHOOTING.md
└── package.json (monorepo)
```

---

## ⚙️ Configuración Mínima

### 1️⃣ Variables de Entorno

**Para app pública** (`apps/public/.env.local`):
```env
REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/[TU_ID]/exec
REACT_APP_API_KEY=tu_contraseña_fuerte
REACT_APP_TURNSTILE_SITE_KEY=0x4AAAAAAA...
```

**Para app admin** (`apps/admin/.env.local`):
```env
REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/[TU_ID]/exec
REACT_APP_API_KEY=tu_contraseña_fuerte
```

### 2️⃣ Script Properties (Google Apps Script)

```
TURNSTILE_SECRET = 0x4AAAAAAA... (Cloudflare)
API_KEY = tu_contraseña_fuerte (igual a .env)
```

---

## 🌍 Deployments en Producción

| App | URL | Actualización |
|-----|-----|---------------|
| Formulario público | `denuncias-santiago.vercel.app` | `git push` → auto-deploy |
| Dashboard admin | `admin.denuncias-santiago.vercel.app` | `git push` → auto-deploy |

**Vercel Configuration:**
- Proyecto conectado a GitHub
- Dos apps independientes en Vercel (una por `apps/public`, otra por `apps/admin`)
- Variables de entorno configuradas en Vercel Settings

---

## 🔑 Variables de Entorno (Referencia Completa)

### App Pública (`apps/public/`)
| Variable | Requerida | Origen | Ejemplo |
|----------|-----------|--------|---------|
| `REACT_APP_GOOGLE_SCRIPT_URL` | ✅ | Google Apps Script | `https://script.google.com/macros/s/AKfycby.../exec` |
| `REACT_APP_API_KEY` | ✅ | Script Properties | `aB3$xK9@mL2&qW7#vD1*pZ4!jH6%tF8` |
| `REACT_APP_TURNSTILE_SITE_KEY` | ✅ | Cloudflare | `0x4AAAAAADz_9q1P61sGjB7C` |

### App Admin (`apps/admin/`)
| Variable | Requerida | Origen | Ejemplo |
|----------|-----------|--------|---------|
| `REACT_APP_GOOGLE_SCRIPT_URL` | ✅ | Google Apps Script | `https://script.google.com/macros/s/AKfycby.../exec` |
| `REACT_APP_API_KEY` | ✅ | Script Properties | `aB3$xK9@mL2&qW7#vD1*pZ4!jH6%tF8` |
| `REACT_APP_GOOGLE_CLIENT_ID` | ⚠️ | Google Cloud | `123456789-xxxx.apps.googleusercontent.com` |

---

## 🔐 Seguridad

**Lo que debes saber:**

- ✅ CAPTCHA Cloudflare Turnstile activo (previene spam)
- ✅ Rate limiting en servidor (30 denuncias/min por IP)
- ✅ Sanitización de inputs (sin XSS)
- ✅ De-duplicación automática (sin reportes repetidos)
- ⚠️ API_KEY protege acceso admin (cambiar de "admin2026")
- ⚠️ Google Sheet debe tener permisos limitados (solo owner puede escribir)

**Para producción:**
1. Usar API_KEY fuerte (32+ caracteres)
2. Restringir Google Sheet a admins
3. Activar Cloudflare Turnstile "Managed Challenge"
4. Revisar logs regularmente

---

## 🛠️ Desarrollo Local

### Instalar
```bash
npm install
cd apps/public && npm install
cd ../admin && npm install
```

### Iniciar (necesitas dos terminales)
```bash
# Terminal 1: App pública
cd apps/public && npm start
# http://localhost:3000

# Terminal 2: App admin
cd apps/admin && npm start
# http://localhost:3001 o siguiente puerto disponible
```

### Build para producción
```bash
cd apps/public && npm run build
cd ../admin && npm run build
```

---

## 🐛 Debugging

Si algo no funciona:

1. **Leer**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. **Verificar**: Script Properties en Google Apps Script
3. **Testear**: `curl "https://script.google.com/macros/s/.../exec?accion=listar_publico"`
4. **Inspeccionar**: DevTools → Network → Requests al Apps Script

---

## 📊 Tech Stack

- **Frontend**: React 18, React Leaflet (mapas), React Router
- **Backend**: Google Apps Script + Google Sheets
- **CAPTCHA**: Cloudflare Turnstile
- **Hosting**: Vercel (frontend)
- **Database**: Google Sheets (por ahora)

---

## 📞 Soporte

- **Setup inicial**: Ver [GUIA_COMPLETA_SETUP.md](GUIA_COMPLETA_SETUP.md)
- **Errores**: Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Arquitectura**: Ver [ARQUITECTURA.md](ARQUITECTURA.md)
- **Google Apps Script**: Ver [CONFIGURACION_GOOGLE_APPS_SCRIPT.md](CONFIGURACION_GOOGLE_APPS_SCRIPT.md)

---

## 📝 License

Proyecto de código abierto para Santiago del Estero Capital.


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
