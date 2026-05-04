// Configuración admin — desde variables de entorno
const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzGU_lTtBTRB_u-13kqz2y7Ngy20HcAp7lMuNEdxsz03SqaG4BngkqZ6hhM9b93PlFehQ/exec";
const API_KEY = process.env.REACT_APP_API_KEY || "";

export { GOOGLE_SCRIPT_URL, API_KEY };
