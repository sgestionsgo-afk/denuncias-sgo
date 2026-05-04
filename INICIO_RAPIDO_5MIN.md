# 📝 Inicio Rápido — 5 Minutos

Si tienes poco tiempo y solo necesitás que funcione ahora mismo.

---

## ✅ Prerequisitos

- Node.js 16+ instalado (`node --version`)
- Git (para clonar el repo)
- Una cuenta de Google (Sheet + Apps Script)
- Una cuenta de Cloudflare (para CAPTCHA)

---

## 🚀 Pasos en Orden

### 1. Clonar/descargar el proyecto
```bash
cd ~/projects
git clone https://github.com/tuuser/denuncias-santiago-capital.git
cd denuncias-santiago-capital
```

### 2. Instalar dependencias (2 min)
```bash
npm install
cd apps/public && npm install
cd ../admin && npm install
cd ../..
```

### 3. Copiar archivos .env
```bash
# App pública
cp apps/public/.env.example apps/public/.env.local

# App admin
cp apps/admin/.env.example apps/admin/.env.local
```

### 4. Obtener Script URL (3 min)

**En Google:**
1. Abrí [Google Sheets](https://sheets.google.com) → Nueva hoja
2. Renombrá a `Denuncias`
3. Fila 1: `Fecha | Barrio | Denuncia | Latitud | Longitud | Foto | Contacto | UbicacionTexto`
4. Extensiones → Apps Script
5. Copiar el contenido de `google-apps-script/Code.gs` → Pegar
6. Guardar (Ctrl+S)
7. **Implementar** → Nueva implementación → Aplicación web
8. "Quién tiene acceso" = "Cualquier persona" → **Implementar**
9. **Copiar la URL** (formato: `https://script.google.com/macros/s/...../exec`)

### 5. Configurar .env.local

**apps/public/.env.local:**
```env
REACT_APP_GOOGLE_SCRIPT_URL=[PEGAR URL DEL PASO 4]
REACT_APP_API_KEY=test123456789
REACT_APP_TURNSTILE_SITE_KEY=0x4AAAAAADAQsAUb8qI2iehC
```

**apps/admin/.env.local:**
```env
REACT_APP_GOOGLE_SCRIPT_URL=[PEGAR URL DEL PASO 4]
REACT_APP_API_KEY=test123456789
```

### 6. Configurar Script Properties (1 min)

**En Google Apps Script:**
1. ⚙️ **Configuración del proyecto** (izquierda)
2. **Script Properties**
3. Agregar:
   - **TURNSTILE_SECRET** = `0x4AAAAAADAQsAUb8qI2iehC` (usa esto por ahora)
   - **API_KEY** = `test123456789` (debe coincidir con .env)

### 7. Iniciar apps (1 min)

**Terminal 1:**
```bash
cd apps/public && npm start
# Abre http://localhost:3000
```

**Terminal 2:**
```bash
cd apps/admin && npm start
# Abre http://localhost:3001
```

---

## ✅ Verificar que funciona

1. En http://localhost:3000:
   - Seleccionar barrio
   - Escribir denuncia
   - Hacer click en mapa (verás un marcador)
   - Llenar CAPTCHA
   - Click **Enviar**
   - Deberías ver "Denuncia guardada correctamente" ✅

2. Verificar en Google Sheet:
   - Abrí tu sheet de Denuncias
   - Deberías ver una nueva fila con los datos ✅

3. En http://localhost:3001 (admin):
   - Deberías ver una tabla con la denuncia ✅

---

## 🎉 ¡Listo!

Si todo funcionó, ya tenés:
- ✅ App pública corriendo (http://localhost:3000)
- ✅ App admin corriendo (http://localhost:3001)
- ✅ Backend funcionando (Google Apps Script)
- ✅ Datos guardándose en Google Sheet

---

## ⚠️ Si algo no funciona

1. **Verifica .env.local:**
   ```bash
   cat apps/public/.env.local
   cat apps/admin/.env.local
   ```
   - Las URLs deben ser iguales
   - Las API_KEY deben coincidir

2. **Verifica Script Properties:**
   - En Google Apps Script: ⚙️ → Script Properties
   - `API_KEY` debe ser `test123456789` (como en .env)

3. **Verifica Google Sheet:**
   - Nombre exacto: `Denuncias`
   - Fila 1 con encabezados

4. **Ver logs:**
   ```bash
   # Terminal donde corre React - buscar errores
   # Browser DevTools (F12) → Console
   ```

5. **Leer documentación:**
   - Problemas comunes: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
   - Setup completo: [GUIA_COMPLETA_SETUP.md](GUIA_COMPLETA_SETUP.md)

---

## 📦 Para producción (cuando esté todo funcionando)

1. Cambiar `API_KEY` a algo seguro (32 caracteres)
2. Desplegar en Vercel
3. Configurar Cloudflare Turnstile con dominios reales
4. Ver [GUIA_COMPLETA_SETUP.md](GUIA_COMPLETA_SETUP.md) para detalles

---

**¿Preguntas?** Revisa [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
