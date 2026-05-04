// Configuración pública — todas las variables vienen de .env / Vercel
const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzGU_lTtBTRB_u-13kqz2y7Ngy20HcAp7lMuNEdxsz03SqaG4BngkqZ6hhM9b93PlFehQ/exec";
const API_KEY = process.env.REACT_APP_API_KEY || "";
const TURNSTILE_SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY || "0x4AAAAAADAQsAUb8qI2iehC";

const MAP_CENTER = [-27.7834, -64.2642];
const MAP_ZOOM = 13;

export { GOOGLE_SCRIPT_URL, API_KEY, TURNSTILE_SITE_KEY, MAP_CENTER, MAP_ZOOM };
