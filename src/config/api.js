// =============================================================
// Configuración de conexión con Google Apps Script
// =============================================================
// INSTRUCCIONES:
// 1. Creá un Google Apps Script (ver README o carpeta google-apps-script/)
// 2. Desplegalo como "Aplicación web"
// 3. Copiá la URL y reemplazá el valor de GOOGLE_SCRIPT_URL abajo.
// =============================================================

// URL del Web App desplegado desde Google Apps Script
// Ejemplo: "https://script.google.com/macros/s/AKfycbx.../exec"
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbym_pj6ZDu8MgWCEaRFuBG6EOyLH8oWLoJo-jyneZmQXxAj0a8eYATaoo1g4mDtZXA-ZQ/exec";

// Contraseña para el panel de administración
// IMPORTANTE: Esto es una protección básica del lado del cliente.
// Para producción real, usá autenticación del lado del servidor.
const ADMIN_PASSWORD = "admin2026";

// Centro del mapa (Santiago del Estero Capital)
const MAP_CENTER = [-27.7834, -64.2642];
const MAP_ZOOM = 13;

export { GOOGLE_SCRIPT_URL, ADMIN_PASSWORD, MAP_CENTER, MAP_ZOOM };
