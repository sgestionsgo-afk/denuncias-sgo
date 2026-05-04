# 🚀 ESTADO FINAL — DEPLOY EN VERCEL

**Fecha:** Mayo 4, 2026  
**Estado:** ✅ APP PÚBLICA FUNCIONANDO | ⚠️ ADMIN APP REQUIERE DEPLOY SEPARADO

---

## ✅ LO QUE ESTÁ FUNCIONANDO EN VERCEL

### App Pública
- **URL:** https://denuncias-sgo.vercel.app
- **Status:** ✅ COMPLETA Y FUNCIONANDO
- **Verificado:**
  - ✅ Formulario con todos los campos
  - ✅ Selector de barrios
  - ✅ **Geolocalización con OpenStreetMap** (puedes hacer click y seleccionar ubicación)
  - ✅ Upload de fotos
  - ✅ Contacto opcional
  - ✅ CAPTCHA Turnstile (omitido en desarrollo, pero widget presente)
  - ✅ Conexión a Google Apps Script
  - ✅ Dark/Light mode
  - ✅ Diseño responsive

### Backend
- **Google Apps Script:** ✅ Conectado y funcionando
- **Google Sheet:** ✅ Recibiendo denuncias
- **Seguridad:** ✅ CAPTCHA, rate limiting, sanitización

---

## ⚠️ LO QUE NECESITA CONFIGURACIÓN

### Admin App en Vercel
**Status:** Necesita deploy separado

**Opciones:**

#### **Opción A: Crear proyecto separado en Vercel (RECOMENDADO)**
1. Andá a https://vercel.com/dashboard
2. Click en "+ New Project"
3. Seleccioná el mismo repo: `sgestionsgo-afk/denuncias-sgo`
4. **Root Directory:** `apps/admin` (NO: raíz)
5. **Environment Variables:**
   ```
   REACT_APP_GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/AKfycbzGU_lTtBTRB_u-13kqz2y7Ngy20HcAp7lMuNEdxsz03SqaG4BngkqZ6hhM9b93PlFehQ/exec
   REACT_APP_API_KEY = test123456789
   ```
6. Deploy
7. Vercel te dará una URL como: `admin-denuncias-sgo.vercel.app` o similar

#### **Opción B: Agregar ruta `/admin` a la misma app**
- Editar vercel.json para que `/admin/*` sirva la app admin
- Más complejo pero todo en una sola URL

---

## 📊 RESUMEN DE URLS

| App | URL | Status |
|-----|-----|--------|
| **Formulario Público** | https://denuncias-sgo.vercel.app | ✅ Funciona |
| **Mapa Público** | https://denuncias-sgo.vercel.app/mapa | ✅ Funciona |
| **Admin Dashboard** | [Requiere deploy separado] | ⚠️ Pendiente |

---

## 🔧 ÚLTIMA ACTUALIZACIÓN EN GIT

Commits recientes:
```
✅ feat: Documentación completa, mejoras CAPTCHA y manejo de errores
✅ docs: Guía para desplegar admin app en Vercel
✅ config: Actualizar vercel.json para monorepo
```

Vercel detectará automáticamente los cambios en:
- https://github.com/sgestionsgo-afk/denuncias-sgo

---

## 🎯 PRÓXIMOS PASOS

1. **Opción A (Recomendada):**
   - Crear nuevo proyecto en Vercel para `apps/admin`
   - Tomar nota de la URL
   - Listo

2. **Opción B:**
   - Esperar a que Vercel redeploy la app pública
   - El vercel.json actualizado debería hacer que `/admin` funcione

3. **Verificar funcionamiento:**
   - En admin: Deberías ver un dashboard con las 40+ denuncias guardadas
   - Deberías poder filtrar por barrio
   - Deberías poder exportar a CSV

---

## ✅ VERIFICACIÓN LOCAL (YA COMPLETA)

✅ App pública en localhost:3000 — Funcionando  
✅ App admin en localhost:3001 — Funcionando  
✅ Google Apps Script — Conectado  
✅ Denuncias guardándose en Google Sheet — Sí  
✅ Admin viendo denuncias — Sí (39 registros)  
✅ Geolocalización — Funciona  

---

## 📝 NOTAS TÉCNICAS

- **Frontend:** React 18 + React Leaflet (OpenStreetMap)
- **Backend:** Google Apps Script + Google Sheets
- **Hosting:** Vercel
- **Seguridad:** CAPTCHA Turnstile, Rate Limiting, Sanitización
- **API:** REST via Google Apps Script

---

## 🆘 SI ALGO FALLA EN VERCEL

1. **Mapa no carga:**
   - OpenStreetMap debería funcionar siempre (CDN público)
   - Revisar Network tab en DevTools

2. **No se puede enviar denuncia:**
   - Verificar que GOOGLE_SCRIPT_URL esté en variables de entorno
   - Verificar que API_KEY sea correcta

3. **Admin no funciona:**
   - Primero: crear el deployment separado en Vercel
   - Luego: verificar que REACT_APP_API_KEY sea la misma

---

**¿Preguntas?** Ver documentación en el repo:
- GUIA_COMPLETA_SETUP.md
- DEPLOY_ADMIN_VERCEL.md
- TROUBLESHOOTING.md
