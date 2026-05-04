# Configuración Google Apps Script — Script Properties

Este archivo documenta las propiedades que debe tener el Google Apps Script para funcionar correctamente.

## Cómo configurar Script Properties

1. Abrí el editor de Google Apps Script
2. Hacé clic en ⚙️ **Configuración del proyecto** (a la izquierda)
3. Seleccioná **Script Properties** (arriba)
4. Agregá las siguientes propiedades:

---

## 🔐 Propiedades OBLIGATORIAS

### `TURNSTILE_SECRET`
**Tipo:** String (privado)  
**Origen:** Cloudflare Turnstile Dashboard  
**Pasos:**
1. Andá a https://dash.cloudflare.com/turnstile
2. Seleccioná tu sitio ("Denuncias Santiago")
3. Copiar: Secret key (empieza con `0x4AAAAAAA...`)
4. Pegar en Script Properties como `TURNSTILE_SECRET`

**Ejemplo:**
```
Clave: TURNSTILE_SECRET
Valor: 0x4AAAAAAA1234567890abcdef
```

**¿Qué pasa si no la configuro?**  
- El CAPTCHA se saltará (desarrollo, pero NO para producción)
- Verás un log: "TURNSTILE_SECRET no configurado — omitiendo verificación CAPTCHA"

---

### `API_KEY`
**Tipo:** String (contraseña fuerte)  
**Qué es:** Contraseña compartida entre frontend y backend  
**Recomendación:** 32 caracteres aleatorios  

**Generador de ejemplo:**
```
Opción 1: "aB3$xK9@mL2&qW7#vD1*pZ4!jH6%tF8" (fuerte)
Opción 2: "denuncias-api-2026-super-secreta-123" (legible pero fuerte)
```

**Dónde usarla:**
- Script Properties: `API_KEY = tu_contraseña`
- `.env.local` (app pública): `REACT_APP_API_KEY=tu_contraseña`
- `.env.local` (app admin): `REACT_APP_API_KEY=tu_contraseña`

**¿Qué pasa si no la configuro?**  
- El Apps Script aceptará denuncias SIN validar API_KEY
- Esto es útil para desarrollo pero **INSEGURO en producción**

---

## ⚠️ Propiedades OPCIONALES

### `ADMIN_EMAILS`
**Tipo:** String (lista separada por comas)  
**Cuándo:** Solo si usás autenticación Google OAuth  
**Formato:**
```
admin@example.com, otro.admin@example.com, third@example.com
```

---

### `GOOGLE_CLIENT_ID`
**Tipo:** String  
**Cuándo:** Solo si usás Google OAuth para admin  
**Origen:** Google Cloud Console > APIs & Services > Credentials  
**Formato:**
```
123456789-abc.apps.googleusercontent.com
```

---

## ✅ Verificación de Configuración

El Apps Script incluye una función de test. Para ejecutarla:

1. En el editor de Apps Script, andá a **▶️ Ejecutar**
2. Seleccioná la función `testConfiguracion()`
3. Deberías ver en Logs:
```
✅ TURNSTILE_SECRET: Configurada
✅ API_KEY: Configurada
✅ ADMIN_EMAILS: No configurada (opcional)
✅ GOOGLE_CLIENT_ID: No configurada (opcional)
```

---

## 🚀 Resumen de Configuración Mínima para Producción

Para que el proyecto funcione en producción (Vercel), necesitás:

### En Google Apps Script (Script Properties):
```
TURNSTILE_SECRET = 0x4AAAAAAA...
API_KEY = contraseña_fuerte_32_caracteres
```

### En Vercel (App Pública - Environment Variables):
```
REACT_APP_GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/.../exec
REACT_APP_API_KEY = contraseña_fuerte_32_caracteres
REACT_APP_TURNSTILE_SITE_KEY = 0x4AAAAAAA...
```

### En Vercel (App Admin - Environment Variables):
```
REACT_APP_GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/.../exec
REACT_APP_API_KEY = contraseña_fuerte_32_caracteres
```

---

## 🔒 Checklist de Seguridad

- [ ] API_KEY es una contraseña fuerte (32+ caracteres)
- [ ] TURNSTILE_SECRET está configurada
- [ ] TURNSTILE_SITE_KEY NO es el secret, es la key pública
- [ ] Cambié la contraseña "admin2026" a algo más fuerte
- [ ] .env.local NO está en git (verifica .gitignore)
- [ ] Vercel tiene las variables de entorno correctas
- [ ] Google Sheet tiene permisos limitados (solo admin puede escribir)

---

## 🐛 Debugging

### Función de test en Apps Script:
```javascript
function testConfiguracion() {
  var keys = [
    { nombre: "TURNSTILE_SECRET", necesaria: true },
    { nombre: "API_KEY", necesaria: true },
    { nombre: "ADMIN_EMAILS", necesaria: false },
    { nombre: "GOOGLE_CLIENT_ID", necesaria: false }
  ];
  
  keys.forEach(k => {
    var val = cfg(k.nombre);
    var ok = val ? "✅" : "❌";
    var req = k.necesaria ? " (requerida)" : " (opcional)";
    Logger.log(ok + " " + k.nombre + req);
  });
}
```

---

## 📞 Contacto / Preguntas

Si algo no funciona:
1. Ejecutá `testConfiguracion()` en Apps Script
2. Revisa los Logs (Ctrl+Enter en el editor)
3. Verificá que cada variable tenga el valor correcto
4. Prueba con curl desde terminal:
```bash
curl "https://script.google.com/macros/s/TU_ID/exec?accion=listar_publico"
```
