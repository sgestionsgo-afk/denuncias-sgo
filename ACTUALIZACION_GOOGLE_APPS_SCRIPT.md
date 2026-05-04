# 📝 ACTUALIZAR GOOGLE APPS SCRIPT - PASO A PASO

**IMPORTANTE:** Para que el admin app funcione sin autenticación, necesitas actualizar el código en Google Apps Script.

**Tiempo estimado:** 3-5 minutos

---

## 🚀 OPCIÓN RÁPIDA (Copy-Paste)

### 1. Abre estas 2 ventanas lado a lado:

**Ventana 1 - Código nuevo:**
https://raw.githubusercontent.com/sgestionsgo-afk/denuncias-sgo/main/google-apps-script/Code.gs

**Ventana 2 - Google Apps Script Editor:**
https://script.google.com/d/1MSxmPH0LenzTpQYYZ3ZOzxaLe0ub_EjIj9SZ6ifHnvnDnW8JPD32Fwfu/edit

### 2. En la Ventana 1 (GitHub Raw):
- Presiona **Ctrl + A** (selecciona todo)
- Presiona **Ctrl + C** (copia)

### 3. En la Ventana 2 (Google Apps Script):
- Haz click en el área de código (parte gris oscura)
- Presiona **Ctrl + A** (selecciona todo)
- Presiona **Ctrl + V** (pega)
- Espera a que termine de pegar (~5 segundos)

### 4. Guarda:
- Presiona **Ctrl + S** (guarda)
- Deberías ver un ícono de nube ✅ que indica que se guardó

---

## ✅ VERIFICACIÓN

Una vez guardado:

1. **Admin Local:** http://localhost:3001
   - Recarga la página (F5)
   - Debería mostrar "✅ Conexión" y las denuncias

2. **Vercel (espera 5-10 minutos):**
   - https://admin-denuncias.vercel.app
   - Debería mostrar todas las denuncias sin "No autorizado"

---

## 🔍 ¿QUÉ CAMBIÓ?

Se agregó un nuevo endpoint **`listar_datos_admin`** que devuelve TODOS los datos SIN validar API_KEY.

- **Antes:** Admin pedía `listar_admin` que requería API_KEY
- **Ahora:** Admin pide `listar_datos_admin` que es completamente público

---

## 🆘 SI FALLA

### "Sigue diciendo 'No autorizado'"
1. ✅ ¿Guardaste en Google Apps Script? (Ctrl + S)
2. ✅ ¿Recargaste el admin local? (F5)
3. Si sigue: Recarga Google Apps Script > Editor > Verifica que esté el código actualizado

### "No veo cambios en Vercel"
- Espera 10-15 minutos para que Vercel redeploy
- Luego recarga: https://admin-denuncias.vercel.app

---

## 📞 INFO TÉCNICA

**Script ID:** `1MSxmPH0LenzTpQYYZ3ZOzxaLe0ub_EjIj9SZ6ifHnvnDnW8JPD32Fwfu`

**URL Editor:**  
https://script.google.com/d/1MSxmPH0LenzTpQYYZ3ZOzxaLe0ub_EjIj9SZ6ifHnvnDnW8JPD32Fwfu/edit

**Cambio específico en el código:**

Se agregó en la sección `ENDPOINTS`:
```javascript
if (accion === "listar_datos_admin")   return listarDatosAdmin(e);
```

Y la nueva función:
```javascript
function listarDatosAdmin(e) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);
  if (!hoja || hoja.getLastRow() < 2) {
    return respuestaJSON({ denuncias: [] });
  }

  var datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 8).getValues();
  var denuncias = datos.map(function (fila) {
    return {
      fecha: fila[0],
      barrio: fila[1],
      denuncia: fila[2],
      lat: fila[3],
      lng: fila[4],
      foto: fila[5] || "",
      contacto: fila[6] || "",
      ubicacionTexto: fila[7] || ""
    };
  });

  return respuestaJSON({ denuncias: denuncias });
}
```

---

## ✨ RESUMEN

| Paso | Acción | Tiempo |
|------|--------|--------|
| 1 | Copiar código desde GitHub Raw | 30s |
| 2 | Pegar en Google Apps Script | 1min |
| 3 | Guardar (Ctrl + S) | 10s |
| 4 | Esperar (Vercel) | 5-10min |
| **Total** | - | **~10 minutos** |



