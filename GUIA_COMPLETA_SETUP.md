# 🚀 Guía Completa de Setup — Denuncias Santiago Capital

**Última actualización:** Mayo 2026

Este documento es la **guía definitiva** para que el proyecto funcione correctamente en desarrollo y producción.

---

## 📊 Arquitectura General

El proyecto es un **monorepo con dos apps independientes en Vercel**:

```
denuncias-santiago-capital/
├── apps/
│   ├── admin/                    ← Dashboard admin (acceso restringido)
│   │   └── Desplegada en: admin.vercel.app
│   └── public/                   ← Formulario público (con CAPTCHA)
│       └── Desplegada en: denuncias-santiago.vercel.app
├── google-apps-script/           ← Backend (Google Sheets + Script)
├── src/, public/                 ← OBSOLETO (no usar - está en apps/)
└── docs/                         ← Documentación
```

**Flujo de datos:**
```
Usuario crea denuncia (formulario) 
    ↓
POST a Google Apps Script 
    ↓
Verifica CAPTCHA (Cloudflare Turnstile)
    ↓
Guarda en Google Sheet
    ↓
Admin ve en dashboard
```

---

## ✅ PASO 1: Preparar Google Sheets + Apps Script

### 1.1 Crear la Google Sheet

1. Andá a [Google Sheets](https://sheets.google.com)
2. Hacé clic en **+ Crear hoja nueva**
3. Renombrá la hoja a: `Denuncias` (pestaña inferior)
4. En la **fila 1**, agregá estos encabezados exactos:

| Columna | Nombre |
|---------|--------|
| A | Fecha |
| B | Barrio |
| C | Denuncia |
| D | Latitud |
| E | Longitud |
| F | Foto |
| G | Contacto |
| H | UbicacionTexto |

5. Guardá la sheet (Ctrl+S)

### 1.2 Crear el Google Apps Script

1. En la misma Google Sheet, andá a **Extensiones → Apps Script**
2. Borrá todo el contenido de `Code.gs`
3. Copiá el contenido completo del archivo `google-apps-script/Code.gs` (desde el repo)
4. **Guardá** (Ctrl+S) y dale un nombre al proyecto: `Denuncias API`

### 1.3 Configurar Script Properties

Estas propiedades son **CRÍTICAS** para que funcione:

1. En el editor de Apps Script, andá a **Configuración del proyecto** (⚙️ a la izquierda)
2. Hacé clic en **Script Properties**
3. Agregá estas propiedades (las que uses):

| Clave | Valor | Descripción | Obligatorio |
|-------|-------|-------------|------------|
| `TURNSTILE_SECRET` | `0x4AAAAAAA...` (secret de Cloudflare) | CAPTCHA validation | ✅ Sí |
| `API_KEY` | Cualquier string fuerte | Contraseña admin | ✅ Sí |
| `ADMIN_EMAILS` | `admin@example.com,otro@example.com` | Emails autorizados | ⚠️ Solo si usas OAuth |
| `GOOGLE_CLIENT_ID` | Client ID de Google Cloud | Para validar OAuth | ⚠️ Solo si usas OAuth |

**Ejemplo simple (sin OAuth):**
```
TURNSTILE_SECRET = 0x4AAAAAAA...
API_KEY = mi_api_key_super_segura_123456789
```

### 1.4 Desplegar como Web App

1. En Apps Script, hacé clic en **Implementar** (botón en el top derecho)
2. Seleccioná **Nueva implementación**
3. En "Tipo de implementación", seleccioná **Aplicación web**
4. Configurá:
   - **Descripción**: "API Denuncias Santiago"
   - **Ejecutar como**: Tu cuenta de Google
   - **Quién tiene acceso**: **Cualquier persona** (importante)
5. Hacé clic en **Implementar**
6. Autorizá los permisos que te pida
7. **⚠️ COPIAR LA URL** que te da (formato: `https://script.google.com/macros/s/AKfycb...../exec`)

**Guardá esta URL**, la vas a necesitar en los pasos siguientes.

---

## ✅ PASO 2: Cloudflare Turnstile (CAPTCHA)

### 2.1 Crear cuenta y obtener keys

1. Andá a [Cloudflare Turnstile](https://dash.cloudflare.com/turnstile)
2. Si no tenés cuenta, creá una (gratis)
3. Hacé clic en **Agregar sitio**
4. Llená:
   - **Nombre del sitio**: "Denuncias Santiago"
   - **Dominios**: 
     - Para local: `localhost`
     - Para producción: `denuncias-santiago.vercel.app` (agregar ambos)
5. Hacé clic en **Crear**
6. Te va a dar **Site Key** y **Secret Key**:
   - **Site Key** (pública): `0x4AAAAAAA...` → Va en `.env` (REACT_APP_TURNSTILE_SITE_KEY)
   - **Secret Key** (privada): `0x4AAAAAAA...` → Va en Script Properties (TURNSTILE_SECRET)

---

## ✅ PASO 3: Configurar .env Local

### 3.1 App Pública (`apps/public/`)

Crea el archivo `apps/public/.env.local`:

```env
# Google Apps Script URL (que copiaste en 1.4)
REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycby_AQUI_TU_SCRIPT_ID/exec

# API Key (la misma que configuraste en Script Properties)
REACT_APP_API_KEY=mi_api_key_super_segura_123456789

# Site Key de Turnstile (la pública)
REACT_APP_TURNSTILE_SITE_KEY=0x4AAAAAAA...
```

### 3.2 App Admin (`apps/admin/`)

Crea el archivo `apps/admin/.env.local`:

```env
# Google Apps Script URL
REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycby_AQUI_TU_SCRIPT_ID/exec

# API Key (misma que pública)
REACT_APP_API_KEY=mi_api_key_super_segura_123456789

# Google Client ID (OPCIONAL - solo si usas OAuth)
REACT_APP_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

---

## ✅ PASO 4: Verificar Funcionamiento Local

### 4.1 Instalar dependencias

```bash
# En la raíz
npm install

# O en cada app por separado
cd apps/public && npm install
cd apps/admin && npm install
```

### 4.2 Iniciar desarrollo

**App pública:**
```bash
cd apps/public
npm start
# Se abre en http://localhost:3000
```

**App admin (otra terminal):**
```bash
cd apps/admin
npm start
# Se abre en http://localhost:3001 (o 3002 si 3001 está en uso)
```

### 4.3 Test manual

**App pública:**
1. Andá a `http://localhost:3000`
2. Seleccioná un barrio
3. Describí un problema
4. Hacé clic en el mapa para seleccionar ubicación
5. Completá el CAPTCHA
6. Hacé clic en **Enviar**
7. Deberías ver: "Denuncia guardada correctamente"

**Verificar en Google Sheets:**
1. Abrí la sheet de Denuncias
2. Deberías ver una nueva fila con los datos

**App admin:**
1. Andá a `http://localhost:3001`
2. Deberías ver una tabla con todas las denuncias

---

## ✅ PASO 5: Desplegar en Vercel

### 5.1 Conectar repo a Vercel

1. Andá a [Vercel](https://vercel.com)
2. Hacé clic en **Agregar nuevo proyecto**
3. Conectá tu repositorio GitHub
4. Vercel va a detectar automáticamente que es un monorepo
5. Deberías poder desplegar ambas apps de forma independiente

### 5.2 Crear deployment para App Pública

1. En Vercel, clic en **Nuevo proyecto**
2. Seleccioná tu repo
3. **Framework**: Detect (React)
4. **Root Directory**: `apps/public`
5. Configurá environment variables:

```
REACT_APP_GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/...
REACT_APP_API_KEY = mi_api_key_super_segura_123456789
REACT_APP_TURNSTILE_SITE_KEY = 0x4AAAAAAA...
```

6. Deploy

### 5.3 Crear deployment para App Admin

1. Otro nuevo proyecto en Vercel
2. Mismo repo
3. **Root Directory**: `apps/admin`
4. Environment variables:

```
REACT_APP_GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/...
REACT_APP_API_KEY = mi_api_key_super_segura_123456789
REACT_APP_GOOGLE_CLIENT_ID = 123456789-xxxx.apps.googleusercontent.com (opcional)
```

5. Deploy

---

## 🔒 Seguridad en Producción

### Cosas CRÍTICAS que hacer antes de ir a producción:

1. **Cambiar API_KEY**: Usar una contraseña fuerte (mínimo 32 caracteres)
   ```
   Ejemplo: generateSecureKey() → "aB3$xK9@mL2&qW7#vD1*pZ4!jH6%tF8"
   ```

2. **Actualizar Google Sheets para Drive:** Agregá permisos correctos
   - Solo admins pueden escribir
   - Públicos solo pueden leer estadísticas

3. **Cloudflare Turnstile**: Configurar Challenge Mode (más seguro)
   - En Cloudflare, cambiar a **Managed Challenge**

4. **Rate Limiting**: Ya está en el Apps Script (30 reportes/min por IP)

5. **HTTPS obligatorio**: Vercel lo hace automáticamente

---

## 🐛 Troubleshooting

### Error: "CAPTCHA requerido"
- ✅ Verificá que TURNSTILE_SECRET esté configurada en Script Properties
- ✅ Verificá que REACT_APP_TURNSTILE_SITE_KEY coincida con Cloudflare

### Error: "API key inválida"
- ✅ Verificá que API_KEY en `.env` coincida con Script Properties
- ✅ No dejes espacios al copiar

### No aparecen denuncias en admin
- ✅ Verificá que la Sheet tenga el nombre exacto: `Denuncias`
- ✅ Verificá que la fila 1 tenga los encabezados correctos
- ✅ Probá hacer una denuncia desde la app pública

### Error: "Hoja no encontrada"
- ✅ Abrí el Apps Script
- ✅ Ejecutá la función `testHoja()` para debuggear
- ✅ Verificá que la Sheet tenga exactamente el nombre `Denuncias`

---

## 📚 Referencias Rápidas

- **Google Apps Script Docs**: https://developers.google.com/apps-script
- **Cloudflare Turnstile**: https://developers.cloudflare.com/turnstile/
- **Vercel Docs**: https://vercel.com/docs
- **React Leaflet**: https://react-leaflet.js.org/

---

## 🎯 Checklist Final

Antes de considerarlo "funcionando":

- [ ] Google Sheet creada con encabezados correctos
- [ ] Apps Script desplegado y copiada la URL
- [ ] Cloudflare Turnstile configurado (Site + Secret keys)
- [ ] .env.local en ambas apps con valores correctos
- [ ] Apps corriendo localmente
- [ ] Denuncia enviada desde app pública
- [ ] Denuncia visible en Google Sheet
- [ ] Denuncia visible en app admin
- [ ] Desplegadas en Vercel
- [ ] Production URLs funcionando

---

**¿Preguntas?** Revisa los archivos de documentación en la raíz o los comentarios en el código.
