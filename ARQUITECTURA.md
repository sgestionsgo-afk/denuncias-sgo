# Arquitectura y Despliegue — Denuncias Santiago Capital (v2 Segura)

## Estructura del monorepo

```
apps/
  public/        ← App pública (formulario + mapa) — Vercel Project 1
  admin/         ← Panel admin (Google Sign-In)    — Vercel Project 2
google-apps-script/
  Code.gs        ← Backend (endpoints separados + seguridad)
```

---

## 1. Configurar Google Apps Script

### 1.1 Ejecutar setup inicial
1. Abrí tu Google Sheet → Extensiones → Apps Script
2. Reemplazá el contenido de `Code.gs` con el nuevo archivo
3. Ejecutá la función `setupPropiedades()` una vez (botón ▶️)
4. Anotá la `API_KEY` que aparece en el Log (Ver > Registros de ejecución)

### 1.2 Configurar Script Properties
En Apps Script: ⚙️ Configuración del proyecto → Propiedades del script:

| Propiedad | Valor | Descripción |
|-----------|-------|-------------|
| `TURNSTILE_SECRET` | `0x4AAAAAAA...` | Secret key de Cloudflare Turnstile |
| `ADMIN_EMAILS` | `tu@gmail.com,otro@gmail.com` | Emails admin (separados por coma) |
| `API_KEY` | (generada por setup) | Clave compartida con frontend |
| `GOOGLE_CLIENT_ID` | `123...apps.googleusercontent.com` | Client ID de Google OAuth |

### 1.3 Redesplegar
1. Desplegar → Nueva implementación → Aplicación web
2. Ejecutar como: **Yo**
3. Acceso: **Cualquiera**
4. Copiá la URL del deploy

---

## 2. Configurar Cloudflare Turnstile (CAPTCHA)

1. Ir a https://dash.cloudflare.com/ → Turnstile
2. Agregar sitio → nombre del sitio, dominio de tu app pública en Vercel
3. Obtenés:
   - **Site Key** (pública) → va en Vercel env de la app pública
   - **Secret Key** → va en Script Properties del Apps Script

---

## 3. Configurar Google OAuth (para admin)

1. Ir a https://console.cloud.google.com/ → APIs & Services → Credentials
2. Crear "OAuth 2.0 Client ID" → tipo "Web application"
3. En "Authorized JavaScript origins", agregar:
   - `https://tu-admin.vercel.app`
   - `http://localhost:3000` (para desarrollo)
4. Copiá el **Client ID** → va en:
   - Vercel env de la app admin (`REACT_APP_GOOGLE_CLIENT_ID`)
   - Script Properties (`GOOGLE_CLIENT_ID`)

---

## 4. Configurar Vercel (2 proyectos)

### Proyecto 1: App pública
- **Nombre**: `denuncias-santiago` (o el que quieras)
- **Root Directory**: `apps/public`
- **Framework**: Create React App
- **Variables de entorno**:

| Variable | Valor |
|----------|-------|
| `REACT_APP_GOOGLE_SCRIPT_URL` | URL del Apps Script desplegado |
| `REACT_APP_API_KEY` | La API key de Script Properties |
| `REACT_APP_TURNSTILE_SITE_KEY` | Site Key de Turnstile |

### Proyecto 2: App admin
- **Nombre**: `denuncias-admin-sde` (o algo no obvio)
- **Root Directory**: `apps/admin`
- **Framework**: Create React App
- **Variables de entorno**:

| Variable | Valor |
|----------|-------|
| `REACT_APP_GOOGLE_SCRIPT_URL` | URL del Apps Script desplegado |
| `REACT_APP_GOOGLE_CLIENT_ID` | Client ID de Google OAuth |

### Pasos en Vercel
1. Ir a https://vercel.com/new
2. Importar el repo de GitHub
3. Configurar **Root Directory** = `apps/public`
4. Agregar las environment variables
5. Deploy
6. Repetir para la app admin con Root Directory = `apps/admin`

---

## 5. Copiar assets de la app original

La app pública necesita los estilos CSS y assets (logo, etc.) de la versión original:

```
# Copiar desde la raíz del repo a apps/public/:
cp public/assets/* apps/public/public/assets/
cp src/styles/App.css apps/public/src/styles/App.css
```

---

## 6. Checklist de seguridad

### ✅ La app pública NO expone:
- [ ] No hay link/ruta a `/admin` en la UI
- [ ] No hay AdminPanel.jsx en el bundle
- [ ] No hay contraseña hardcodeada en el código
- [ ] El endpoint público solo devuelve barrio + cantidad (sin texto, sin coords, sin fotos)
- [ ] El mapa muestra ubicaciones aleatorias por barrio, no exactas

### ✅ El admin está protegido:
- [ ] Otro dominio / URL de Vercel
- [ ] `noindex, nofollow` en meta y headers (no indexado por Google)
- [ ] Login con Google Sign-In (no contraseña en frontend)
- [ ] El token de Google se valida server-side en Apps Script
- [ ] Solo los emails de la whitelist pueden acceder

### ✅ Anti-spam:
- [ ] CAPTCHA Turnstile verificado server-side antes de guardar
- [ ] Rate limiting global (30 creates/min, 120 reads/min)
- [ ] De-duplicación de contenido (5 min ventana)
- [ ] Validación + sanitización de inputs en Apps Script
- [ ] Timestamp del servidor (no del cliente)

### ✅ Headers Vercel:
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Content-Security-Policy` restrictivo
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`

---

## 7. Probar end-to-end

### 7.1 Probar la app pública
1. `cd apps/public && npm install && npm start`
2. Crear un `.env` con los valores reales (copiar de `.env.example`)
3. Enviar una denuncia de prueba → verificar en Google Sheets
4. Ir a `/mapa` → verificar que solo muestra barrio + puntos aleatorios
5. Verificar que NO hay ruta `/admin` accesible

### 7.2 Probar la app admin
1. `cd apps/admin && npm install && npm start`
2. Crear un `.env` con los valores reales
3. Hacer login con un email de la whitelist → debe mostrar la tabla
4. Intentar con un email NO autorizado → debe rechazar
5. Verificar que se ven fecha, texto, foto y coords exactas

### 7.3 Probar seguridad
- Intentar acceder al endpoint admin sin token → debe devolver error
- Intentar enviar denuncia sin CAPTCHA → debe rechazar
- Enviar misma denuncia 2 veces seguidas → debe detectar duplicado
- Inspeccionar la respuesta de `listar_publico` → NO debe tener texto ni coords

---

## Resumen de endpoints Apps Script

| Endpoint | Método | Auth | Devuelve |
|----------|--------|------|----------|
| `?accion=listar_publico&apiKey=X` | GET | API key | `[{barrio, cantidad}]` |
| POST con `accion=crear` | POST | API key + CAPTCHA | resultado ok/error |
| `?accion=listar_admin&token=JWT` | GET | Google ID Token | `[{fecha, barrio, denuncia, lat, lng, foto}]` |

---

## Limitaciones conocidas de Apps Script

- **CORS**: Apps Script web apps siempre responden con `Access-Control-Allow-Origin: *`. No se puede restringir por dominio a nivel HTTP. La API key mitiga esto parcialmente.
- **IP**: No se puede obtener la IP del cliente en Apps Script web apps. El rate limit es global, no por IP.
- **Tokens**: Los ID tokens de Google expiran en ~1 hora. El admin deberá reloguear si la sesión expira.
