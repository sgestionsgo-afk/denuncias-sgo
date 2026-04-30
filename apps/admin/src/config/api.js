// Configuración admin — desde variables de entorno
const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycby_juKF2zUSSzL6zpyy3ch8C6BqlxxOJD9wPY8jKEcpYoF2XhN_GXZjO4V0k-W1ld6Q_w/exec";
const API_KEY = process.env.REACT_APP_API_KEY || "";

export { GOOGLE_SCRIPT_URL, API_KEY };
