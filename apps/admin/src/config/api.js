// Configuración admin — desde variables de entorno
const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || "";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

export { GOOGLE_SCRIPT_URL, GOOGLE_CLIENT_ID };
