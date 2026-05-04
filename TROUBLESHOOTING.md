# 🔧 Troubleshooting y Debugging — Denuncias Santiago Capital

Guía para resolver problemas comunes.

---

## 🚨 Problema: "CAPTCHA requerido" o "Verificación CAPTCHA fallida"

### Síntomas:
- App pública: No puedo enviar denuncias
- Console error: "Verificación CAPTCHA fallida"
- O aparece el widget CAPTCHA pero no funciona

### Soluciones:

**1. Verificar que TURNSTILE_SECRET esté configurada**
```javascript
// En Apps Script → Logs, ejecutá:
function debug() {
  var secret = cfg("TURNSTILE_SECRET");
  Logger.log("TURNSTILE_SECRET: " + (secret ? "✅ Configurada" : "❌ NO configurada"));
}
```

**2. Verificar que el Site Key coincida**
- En `.env.local` de la app pública: `REACT_APP_TURNSTILE_SITE_KEY=0x4AAAAAAA...`
- Debe coincidir con el Site Key en Cloudflare Dashboard
- **No** confundir con Secret Key (esa va en Script Properties)

**3. Verificar que Cloudflare tenga los dominios correctos**
- Para local: agregar `localhost`
- Para producción: agregar `denuncias-santiago.vercel.app`

**4. Verificar CORS headers**
- El Apps Script debe permitir requests desde el frontend
- Verifica que `vercel.json` en la raíz tenga headers correctos

---

## 🚨 Problema: "API key inválida"

### Síntomas:
- Error al enviar denuncia: "API key inválida"
- Admin dashboard: No carga denuncias

### Soluciones:

**1. Verificar que las keys coincidan exactamente**
```
Script Properties (Google Apps Script):
  API_KEY = mi_api_key_super_segura

.env.local (apps/public/):
  REACT_APP_API_KEY = mi_api_key_super_segura

.env.local (apps/admin/):
  REACT_APP_API_KEY = mi_api_key_super_segura
```

**2. Verificar que no haya espacios extras**
```
❌ Mal: "mi_api_key " (con espacio al final)
✅ Bien: "mi_api_key" (sin espacios)
```

**3. Verificar que se haya guardado el .env.local**
- Después de crear/editar `.env.local`, reinicia el servidor React:
```bash
npm start  # Ctrl+C para detener, luego npm start de nuevo
```

**4. Verificar en el browser**
- Abrí DevTools (F12)
- Andá a Network tab
- Hace una denuncia
- Click en el POST request al Apps Script
- Verifica el payload que se envía (debe incluir `apiKey`)

---

## 🚨 Problema: "Hoja no encontrada" o "Error al procesar"

### Síntomas:
- Denuncia rechazada con error "Hoja no encontrada"
- O error genérico "Error al procesar"

### Soluciones:

**1. Verificar que Google Sheet tenga exactamente el nombre "Denuncias"**
```
✅ Bien: Pestaña se llama "Denuncias"
❌ Mal: "denuncias", "Denuncia", "Denuncias2"
```

**2. Verificar que la hoja tenga los encabezados correctos (Fila 1)**
```
A1: Fecha
B1: Barrio
C1: Denuncia
D1: Latitud
E1: Longitud
F1: Foto
G1: Contacto
H1: UbicacionTexto
```

**3. Ejecutar test de verificación**
```javascript
// En Apps Script → Ejecutar función → testHoja()
function testHoja() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Denuncias");
    if (!sheet) {
      Logger.log("❌ Hoja 'Denuncias' NO ENCONTRADA");
      Logger.log("Hojas disponibles: " + ss.getSheets().map(s => s.getName()).join(", "));
    } else {
      Logger.log("✅ Hoja 'Denuncias' encontrada");
      Logger.log("Última fila con datos: " + sheet.getLastRow());
      Logger.log("Encabezados: " + sheet.getRange(1, 1, 1, 8).getValues()[0].join(" | "));
    }
  } catch (e) {
    Logger.log("❌ Error: " + e.message);
  }
}
```

---

## 🚨 Problema: Denuncia se envía pero no aparece en Google Sheet

### Síntomas:
- App muestra "Denuncia guardada correctamente"
- Pero no aparece en Google Sheet
- Admin dashboard no muestra nada

### Soluciones:

**1. Verificar permisos de Google Sheet**
- Abrí Google Sheet → Compartir
- El proyecto Apps Script debe ser PROPIETARIO de la Sheet

**2. Verificar que el script tenga permisos de Drive**
- En Apps Script → Crear nuevo despliegue
- Debería pedir permisos para leer/escribir en Sheets

**3. Verificar en Logs del Apps Script**
```javascript
// En Despliegues → Ver ejecuciones, verás:
- Qué funciones se ejecutaron
- Si hubo errores
- Tiempo de ejecución
```

**4. Hacer un test manual**
```javascript
// Ejecutar esta función en Apps Script:
function testGuardarDenuncia() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Denuncias");
  hoja.appendRow([
    new Date().toISOString(),
    "Test Barrio",
    "Esta es una denuncia de prueba",
    "-27.7834",
    "-64.2642",
    "",
    "test@example.com",
    "Ubicación de prueba"
  ]);
  Logger.log("✅ Denuncia de prueba guardada");
}
```

---

## 🚨 Problema: Admin dashboard carga pero no muestra denuncias

### Síntomas:
- La tabla aparece pero está vacía
- O muestra error de conexión

### Soluciones:

**1. Verificar que Google Apps Script tenga la función `listarAdmin`**
```javascript
// En Apps Script, debería existir esta función (busca Ctrl+F):
function listarAdmin(e) {
  // ... código ...
}
```

**2. Verificar que API_KEY sea correcta**
- Admin usa `?accion=listar_admin&apiKey=...`
- La key debe coincidir con Script Properties

**3. Verificar CORS headers en Vercel**
- Si admin está en Vercel, verifica que `vercel.json` permita requests a Apps Script
- Content-Security-Policy debe permitir `connect-src 'self' https://script.google.com`

**4. Verificar en DevTools**
```
1. Abrí F12 → Network
2. Hacé refresh en admin
3. Buscá un GET request a `script.google.com`
4. Verifica el status (200 = ok, 403 = forbidden, 500 = error servidor)
5. Click en la request → Response tab → Ver JSON de respuesta
```

---

## 🚨 Problema: Fotos no se guardan o devuelven error

### Síntomas:
- Envío denuncia con foto, error: "Imagen demasiado grande"
- O: "Formato de imagen inválido"

### Soluciones:

**1. Verificar tamaño de imagen**
- Máximo: 5 MB (tamaño en base64)
- Si es Base64, el tamaño es ~33% más grande que el archivo original
- Máximo archivo recomendado: ~4 MB

**2. Verificar formato**
- Solo soporta: JPEG, PNG, WebP, GIF
- Apps Script valida: `^data:image/(jpeg|png|webp|gif);base64,`

**3. Verificar que carpeta "Fotos Denuncias" existe en Drive**
- Apps Script crea automáticamente si no existe
- Verificá en Google Drive que exista la carpeta

**4. Verificar permisos de Drive**
- Apps Script debe poder crear archivos en Drive
- Si no tiene permisos, error silencioso

**5. Test manual de foto**
```javascript
function testFoto() {
  var base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."; // Mini PNG
  try {
    var url = guardarFotoEnDrive(base64, "TestBarrio", new Date().toISOString());
    Logger.log("✅ Foto guardada: " + url);
  } catch (e) {
    Logger.log("❌ Error guardar foto: " + e.message);
  }
}
```

---

## 🚨 Problema: "Demasiadas solicitudes" o Rate Limit

### Síntomas:
- Después de enviar varias denuncias, error: "Demasiadas solicitudes"

### Soluciones:

**1. Rate limits configurados**
- Crear denuncia: 30/minuto por IP
- Listar: 120/minuto por IP
- Esperar 60 segundos y reintentar

**2. Si estás testando**
- Espera 60 segundos entre requests
- O usa IPs diferentes (VPN, otra red)

**3. Si necesitás cambiar límites**
- En Apps Script busca `checkRateLimit("crear", 30)`
- Cambia `30` a un número mayor
- Re-despliega

---

## 🚨 Problema: Script URL no funciona o devuelve 404

### Síntomas:
- Error: "Failed to fetch" o "404"
- Apps Script URL no responde

### Soluciones:

**1. Verificar que Apps Script esté desplegado**
```
En Google Apps Script → Despliegues (arriba a la derecha)
Debería haber una implementación tipo "Aplicación web"
Status: "Active"
```

**2. Verificar que la URL sea exacta**
```
Copiá desde: Google Apps Script → Despliegues → Copiar la URL
Formato correcto: https://script.google.com/macros/s/[ID]/exec
```

**3. Verificar que sea "Cualquier persona"**
```
En Apps Script → Despliegues → Editar último despliegue
"Quién tiene acceso" debe ser "Cualquier persona"
```

**4. Test manual en terminal**
```bash
# Reemplazar [SCRIPT_ID] con el ID real
curl "https://script.google.com/macros/s/[SCRIPT_ID]/exec?accion=listar_publico"

# Deberías recibir JSON con las denuncias
```

---

## 🚨 Problema: Vercel deployment falla

### Síntomas:
- Build error en Vercel
- Deployment cancela

### Soluciones:

**1. Verificar que Root Directory sea correcto**
```
Para app pública: apps/public
Para app admin: apps/admin
```

**2. Verificar que build succeeds localmente**
```bash
cd apps/public
npm run build  # Debe completar sin errores
```

**3. Verificar environment variables en Vercel**
```
Settings → Environment Variables
Verificar que todas las REACT_APP_* estén ahí
```

**4. Ver logs de build en Vercel**
```
Despliegue → Build Logs → Buscar errores
Generalmente dice qué falta
```

**5. Si dice "package-lock.json changed"**
```bash
# Local:
cd apps/public
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update lock file"
git push
```

---

## ✅ Checklist de Debugging

Antes de reportar bug, verificá:

- [ ] Google Sheet existe y se llama "Denuncias"
- [ ] Google Apps Script está desplegado y publicado
- [ ] TURNSTILE_SECRET está en Script Properties
- [ ] API_KEY está en Script Properties y en todos los .env.local
- [ ] .env.local existe en ambas apps (no en git)
- [ ] Apps corren con `npm start` sin errores
- [ ] DevTools muestra los requests al Apps Script
- [ ] Google Sheet tenga los encabezados correctos
- [ ] Directorio raíz de Vercel es `apps/public` y `apps/admin`

---

## 🆘 Si nada funciona

**Pasos finales de debugging:**

1. **Limpia todo y empieza de nuevo:**
```bash
# Eliminar dependencias
rm -rf node_modules apps/*/node_modules apps/*/build

# Reinstalar
npm install
cd apps/public && npm install
cd ../admin && npm install

# Recompilar
npm run build
```

2. **Verifica los Logs del Apps Script:**
```
Google Apps Script → Ver ejecuciones
Debería haber historial de requests
```

3. **Prueba con curl:**
```bash
# Test listar público (sin API key)
curl "https://script.google.com/macros/s/[TU_ID]/exec?accion=listar_publico"

# Test listar admin (con API key)
curl "https://script.google.com/macros/s/[TU_ID]/exec?accion=listar_admin&apiKey=tu_key"
```

4. **Contacta con evidencia:**
- Captura de pantalla del error
- URL del Apps Script
- Contenido de `.env.local` (sin valores sensibles)
- Output de `npm run build`
- Logs del Apps Script

---

