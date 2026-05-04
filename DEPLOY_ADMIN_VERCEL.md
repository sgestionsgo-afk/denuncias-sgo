# Desplegar Admin App en Vercel

Necesitás crear un SEGUNDO proyecto en Vercel para el admin app.

## Pasos:

### 1. Acceder a Vercel
1. Andá a https://vercel.com
2. Inicia sesión con tu cuenta

### 2. Crear nuevo proyecto
1. Click en "+ New Project"
2. Seleccioná el repositorio `sgestionsgo-afk/denuncias-sgo`
3. En "Framework Preset" → **Detect** (React)
4. En "Root Directory" → **apps/admin**
5. En "Environment Variables" → Agregá:
   ```
   REACT_APP_GOOGLE_SCRIPT_URL = https://script.google.com/macros/s/AKfycbzGU_lTtBTRB_u-13kqz2y7Ngy20HcAp7lMuNEdxsz03SqaG4BngkqZ6hhM9b93PlFehQ/exec
   REACT_APP_API_KEY = test123456789
   ```
6. Click en **Deploy**

### 3. Después del Deploy
- Vercel te dará una URL (algo como `admin-denuncias-sgo.vercel.app` o similar)
- La app admin estará disponible en esa URL
- Guardá la URL

## Resultado esperado:
- ✅ App Pública: https://denuncias-sgo.vercel.app
- ✅ App Admin: https://[tu-admin-url].vercel.app

Cuando hayas hecho esto, avisame y verifico que funcione.
