// Configuración admin — desde variables de entorno
const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxVsiwrNPA51begj0EKm1KKCDc6GBTRuPCnh0O5WGdF417P3BS4wtuQkkzLcEAUkFYfPw/exec";
const API_KEY = process.env.REACT_APP_API_KEY || "";

export { GOOGLE_SCRIPT_URL, API_KEY };
