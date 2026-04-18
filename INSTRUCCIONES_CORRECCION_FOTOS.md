# 🔧 Instrucciones para Corregir el Guardado de Fotos

## Problema Identificado
Las fotos NO se estaban guardando en Google Sheets porque el campo `fotoBase64` se enviaba como una **string vacía** (`""`), que es "falsy" en JavaScript y fallaba el check `if (datos.fotoBase64)`.

## Solución Implementada

### ✅ Parte 1: Frontend - YA COMPLETADA ✓
El archivo `src/components/ReportForm.jsx` ha sido actualizado para:
- ✓ Solo enviar `fotoBase64` si hay una foto válida
- ✓ Validar que comience con `"data:image/"`
- ✓ Evitar enviar strings vacías

### ⏳ Parte 2: Backend - REQUIERE ACCIÓN MANUAL
El archivo `google-apps-script/Code.gs` ha sido actualizado localmente pero **DEBES copiar el código actualizado a Google Apps Script manualmente**.

## Pasos para actualizar Google Apps Script:

### 1️⃣ Abre el Archivo Local
```
google-apps-script/Code.gs (en este proyecto)
```

### 2️⃣ Copia TODO el contenido del archivo

### 3️⃣ Ve a tu Google Apps Script
- URL: `https://script.google.com/home/projects/1MSxmPH0LenzTpQYYZ3ZOzxaLe0ub_EjIj9SZ6ifHnvnDnW8JPD32Fwfu/edit`
- O: Ve a Google Drive → Extensiones → Apps Script

### 4️⃣ Selecciona TODO el código en el editor
- Haz clic en el editor
- Presiona `Ctrl+A` para seleccionar todo
- Presiona `Delete` para borrar

### 5️⃣ Pega el NUEVO código
- Presiona `Ctrl+V` para pegar el código del archivo local

### 6️⃣ Guarda los cambios
- Google Apps Script guarda automáticamente
- Espera a que aparezca "Guardado" en la interfaz

## Cambios Principales en Code.gs

El método `doPost()` ahora:

1. **Verifica que fotoBase64 existe AND tiene datos:**
```javascript
const tieneFoto = datos.hasOwnProperty("fotoBase64") && 
                  datos.fotoBase64 && 
                  datos.fotoBase64.length > 0 &&
                  datos.fotoBase64.startsWith("data:");
```

2. **Solo intenta guardar si hay foto válida:**
```javascript
if (tieneFoto) {
  urlFoto = guardarFotoEnDrive(datos.fotoBase64, barrio, fecha);
}
```

3. **Devuelve logs mejorados:**
- Indica si la propiedad existe
- Muestra tipo de datos
- Primeros 100 caracteres de base64
- Estado final del guardado

## Qué Esperar Después

✅ **Cuando pruebes después de actualizar:**

1. Haz una denuncia CON foto
2. En el admin panel, deberías ver un botón "🖼️ Ver foto" en lugar de "Sin foto"
3. Al hacer click, se abrirá un modal con la imagen
4. Podrás descargar la foto

## Prueba Rápida

```javascript
// Abre la consola del navegador (F12) en la app
// Cuando envíes una denuncia, deberías ver:
=== ENVIANDO DENUNCIA ===
Barrio: Centro
Denuncia length: 50
Tiene foto: true
fotoBase64 length: 45000
fotoBase64 starts with: data:image/png;base64,...
```

## Si Algo no Funciona

1. **Verifica que el código esté completamente actualizado:**
   - Busca `tieneFoto` en el editor de Apps Script
   - Si no lo encuentras, el código viejo aún está activo

2. **Revisa los logs en Google Apps Script:**
   - Ejecuciones → Selecciona la última ejecución doPost
   - Busca los logs que comienzan con `=== PROCESANDO FOTO ===`

3. **Prueba con un JSON simple:**
```bash
$url = 'https://script.google.com/macros/s/AKfycbxn.../exec'
$data = '{
  "barrio": "Centro",
  "denuncia": "Prueba fotos",
  "fotoBase64": "data:image/png;base64,iVBORw0KGg..."
}'
Invoke-WebRequest -Uri $url -Method POST -Body $data -ContentType "text/plain"
```

## Estado de Commit

- **Commit:** `af786f5`
- **Branch:** `main`
- **Cambios:** Frontend + Backend (local)
- **Próximo Paso:** Actualizar Google Apps Script manualmente

---
**Última actualización:** 18 Apr 2026 - 16:28 UTC
