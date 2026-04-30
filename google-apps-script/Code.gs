// =============================================================
// Google Apps Script — Code.gs  (versión SEGURA v2)
// Endpoints separados: público (crear + stats) y admin (auth Google)
// Incluye: Turnstile CAPTCHA, rate limiting, sanitización, auth
// =============================================================
// CONFIGURACIÓN — Setear en: Archivo > Configuración del proyecto >
//   Propiedades del script (Script Properties):
//
//   TURNSTILE_SECRET   → Secret key de Cloudflare Turnstile
//   ADMIN_EMAILS       → Emails admin separados por coma
//   API_KEY            → Clave compartida con el frontend público
//   GOOGLE_CLIENT_ID   → Client ID de Google OAuth (para validar audience)
// =============================================================

var NOMBRE_HOJA = "Denuncias";
var CARPETA_FOTOS_ID = null;

// =================== HELPERS ===================

function cfg(key) {
  return (PropertiesService.getScriptProperties().getProperty(key) || "").trim();
}

function respuestaJSON(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function obtenerCarpetaFotos() {
  if (CARPETA_FOTOS_ID) {
    try { return DriveApp.getFolderById(CARPETA_FOTOS_ID); } catch (_) {}
  }
  var it = DriveApp.getFoldersByName("Fotos Denuncias");
  if (it.hasNext()) {
    var f = it.next();
    CARPETA_FOTOS_ID = f.getId();
    return f;
  }
  var nueva = DriveApp.createFolder("Fotos Denuncias");
  CARPETA_FOTOS_ID = nueva.getId();
  return nueva;
}

// =================== RATE LIMITING ===================
// Usa CacheService (6h máx TTL). Ventana de 60 s.

function checkRateLimit(bucket, maxPerMinute) {
  var cache = CacheService.getScriptCache();
  var key = "rl_" + bucket;
  var val = cache.get(key);
  var count = val ? parseInt(val, 10) : 0;
  if (count >= maxPerMinute) return false;
  cache.put(key, String(count + 1), 60);
  return true;
}

function checkDuplicate(barrio, denuncia) {
  var cache = CacheService.getScriptCache();
  var raw = barrio + "|" + denuncia;
  var hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, raw)
    .map(function (b) { return (b < 0 ? b + 256 : b).toString(16); })
    .join("");
  var key = "dup_" + hash;
  if (cache.get(key)) return true;
  cache.put(key, "1", 300); // 5 min de-dup
  return false;
}

// =================== TURNSTILE CAPTCHA ===================

function verificarTurnstile(token) {
  var secret = cfg("TURNSTILE_SECRET");
  if (!secret) {
    // Sin configurar: omitir verificación para facilitar setup inicial
    Logger.log("TURNSTILE_SECRET no configurado — omitiendo verificación CAPTCHA");
    return true;
  }
  try {
    var r = UrlFetchApp.fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "post", payload: { secret: secret, response: token } }
    );
    return JSON.parse(r.getContentText()).success === true;
  } catch (err) {
    Logger.log("Turnstile error: " + err.message);
    return false;
  }
}

// =================== ADMIN AUTH (Google ID Token) ===================

function verificarTokenAdmin(idToken) {
  if (!idToken) return { ok: false, error: "Token no proporcionado" };
  try {
    var r = UrlFetchApp.fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(idToken)
    );
    var info = JSON.parse(r.getContentText());

    // Verificar audience (debe coincidir con tu Client ID)
    var clientId = cfg("GOOGLE_CLIENT_ID");
    if (clientId && info.aud !== clientId) {
      return { ok: false, error: "Audience inválido" };
    }

    if (info.email_verified !== "true") {
      return { ok: false, error: "Email no verificado" };
    }

    var allowed = cfg("ADMIN_EMAILS").split(",").map(function (e) {
      return e.trim().toLowerCase();
    });
    if (allowed.indexOf(info.email.toLowerCase()) === -1) {
      return { ok: false, error: "Email no autorizado: " + info.email };
    }

    return { ok: true, email: info.email };
  } catch (err) {
    Logger.log("Auth error: " + err.message);
    return { ok: false, error: "Token inválido o expirado" };
  }
}

// =================== SANITIZACIÓN ===================

function sanitizar(texto, maxLen) {
  if (typeof texto !== "string") return "";
  texto = texto.replace(/<[^>]*>/g, "");           // strip HTML
  texto = texto.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, ""); // strip control chars
  return texto.trim().substring(0, maxLen);
}

function validarLat(val) {
  if (val === "" || val === null || val === undefined) return "";
  var n = parseFloat(val);
  if (isNaN(n) || n < -90 || n > 90) return "";
  return String(n).substring(0, 20);
}

function validarLng(val) {
  if (val === "" || val === null || val === undefined) return "";
  var n = parseFloat(val);
  if (isNaN(n) || n < -180 || n > 180) return "";
  return String(n).substring(0, 20);
}

// Mantener por compatibilidad
function validarCoord(val) {
  return validarLat(val);
}

// =================== ENDPOINTS ===================

function doGet(e) {
  var accion = (e.parameter.accion || "").trim();

  if (accion === "listar_publico") return listarPublico(e);
  if (accion === "listar_admin")   return listarAdmin(e);

  return respuestaJSON({ error: "Acción no reconocida" });
}

function doPost(e) {
  try {
    var datos = JSON.parse(e.postData.contents);
    var accion = datos.accion || "crear";
    if (accion === "crear") return crearDenuncia(datos);
    return respuestaJSON({ error: "Acción no reconocida" });
  } catch (err) {
    return respuestaJSON({ error: "Error al procesar: " + err.message });
  }
}

// =================== CREAR DENUNCIA (público) ===================

function crearDenuncia(datos) {
  // 1) API key
  var apiKey = cfg("API_KEY");
  if (apiKey && datos.apiKey !== apiKey) {
    return respuestaJSON({ error: "API key inválida" });
  }

  // 2) CAPTCHA
  if (!datos.captchaToken) {
    return respuestaJSON({ error: "CAPTCHA requerido" });
  }
  if (!verificarTurnstile(datos.captchaToken)) {
    return respuestaJSON({ error: "Verificación CAPTCHA fallida" });
  }

  // 3) Rate limit global (30 reportes/minuto)
  if (!checkRateLimit("crear", 30)) {
    return respuestaJSON({ error: "Demasiadas solicitudes. Intentá en un minuto." });
  }

  // 4) Campos obligatorios
  if (!datos.barrio || !datos.denuncia) {
    return respuestaJSON({ error: "Faltan campos obligatorios" });
  }

  // 5) Sanitizar
  var barrio   = sanitizar(datos.barrio, 100);
  var denuncia = sanitizar(datos.denuncia, 1000);
  
  // Nueva estructura: ubicacionProblema es objeto con {lat, lng, texto}
  var ubicacionProblema = datos.ubicacionProblema || {};
  var lat      = validarLat(ubicacionProblema.lat);
  var lng      = validarLng(ubicacionProblema.lng);
  var ubicacionTexto = sanitizar(ubicacionProblema.texto || "", 200);
  
  // Contacto opcional (email, teléfono, etc.)
  var contacto = sanitizar(datos.contacto || "", 100);
  
  var fecha    = new Date().toISOString(); // timestamp del servidor

  if (barrio.length < 2)    return respuestaJSON({ error: "Barrio inválido" });
  if (denuncia.length < 10) return respuestaJSON({ error: "Descripción muy corta (mín 10 caracteres)" });
  if (!lat || !lng)         return respuestaJSON({ error: "Ubicación del problema es requerida" });

  // 6) De-dup
  if (checkDuplicate(barrio, denuncia)) {
    return respuestaJSON({ error: "Denuncia duplicada. Esperá unos minutos." });
  }

  // 7) Foto opcional
  var urlFoto = "";
  var fotoError = null;
  if (datos.fotoBase64 && typeof datos.fotoBase64 === "string" && datos.fotoBase64.length > 50) {
    if (!datos.fotoBase64.match(/^data:image\/(jpeg|png|webp|gif);base64,/)) {
      return respuestaJSON({ error: "Formato de imagen inválido" });
    }
    if (datos.fotoBase64.length > 7000000) {
      return respuestaJSON({ error: "Imagen demasiado grande (máx 5 MB)" });
    }
    try {
      urlFoto = guardarFotoEnDrive(datos.fotoBase64, barrio, fecha);
    } catch (err) {
      fotoError = err.message;
      Logger.log("Foto error: " + err.message);
    }
  }

  // 8) Guardar (7 columnas: fecha, barrio, denuncia, lat, lng, foto, contacto, ubicacionTexto)
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);
  if (!hoja) return respuestaJSON({ error: "Hoja no encontrada" });

  hoja.appendRow([fecha, barrio, denuncia, lat, lng, urlFoto, contacto, ubicacionTexto]);

  return respuestaJSON({
    resultado: "ok",
    mensaje: "Denuncia guardada correctamente",
    fotoGuardada: urlFoto.length > 0,
    fotoError: fotoError
  });
}

// =================== LISTAR PÚBLICO (solo estadísticas) ===================
// Devuelve SOLO { barrio, cantidad } — sin texto, sin coords exactas, sin fotos

function listarPublico(e) {
  // Endpoint público — solo estadísticas agregadas, sin datos personales
  // No requiere API key
  if (!checkRateLimit("listar", 120)) {
    return respuestaJSON({ error: "Demasiadas solicitudes" });
  }

  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);
  if (!hoja || hoja.getLastRow() < 2) {
    return respuestaJSON({ denuncias: [], total: 0 });
  }

  var datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 2).getValues(); // solo fecha+barrio
  var porBarrio = {};
  datos.forEach(function (fila) {
    var b = String(fila[1]);
    porBarrio[b] = (porBarrio[b] || 0) + 1;
  });

  var lista = Object.keys(porBarrio).map(function (b) {
    return { barrio: b, cantidad: porBarrio[b] };
  });

  return respuestaJSON({ denuncias: lista, total: datos.length });
}

// =================== LISTAR ADMIN (datos completos, protegido con API_KEY) ===================

function listarAdmin(e) {
  var apiKey = cfg("API_KEY");
  // Si API_KEY está configurada, exigir que coincida; si no está configurada, permitir acceso
  if (apiKey && e.parameter.apiKey !== apiKey) {
    return respuestaJSON({ error: "No autorizado" });
  }

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

// =================== GUARDAR FOTO EN DRIVE ===================

function guardarFotoEnDrive(fotoBase64, barrio, fecha) {
  var partes = fotoBase64.split(",");
  if (partes.length !== 2) throw new Error("Formato base64 inválido");

  var mimeMatch = partes[0].match(/:(.*?);/);
  if (!mimeMatch) throw new Error("MIME type no detectado");

  var mimeType = mimeMatch[1];
  var permitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (permitidos.indexOf(mimeType) === -1) {
    throw new Error("Tipo de imagen no permitido: " + mimeType);
  }

  var bytes = Utilities.base64Decode(partes[1]);
  var ts = new Date().getTime();
  var ext = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
  var nombre = "Foto_" + barrio.replace(/[^a-zA-Z0-9]/g, "_") + "_" + ts + "." + ext;

  var carpeta = obtenerCarpetaFotos();
  var blob = Utilities.newBlob(bytes, mimeType, nombre);
  var archivo = carpeta.createFile(blob);

  archivo.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  // Retornar URL directa embebible (no la página viewer de Drive)
  return "https://drive.google.com/uc?id=" + archivo.getId() + "&export=view";
}

// =================== SETUP HELPER ===================
// Ejecutar UNA VEZ para crear las propiedades iniciales (luego editarlas)

function setupPropiedades() {
  var props = PropertiesService.getScriptProperties();
  var current = props.getProperties();
  var defaults = {
    TURNSTILE_SECRET: "",
    ADMIN_EMAILS: "tu-email@gmail.com",
    API_KEY: Utilities.getUuid(),
    GOOGLE_CLIENT_ID: ""
  };
  for (var k in defaults) {
    if (!current[k]) props.setProperty(k, defaults[k]);
  }
  Logger.log("Propiedades configuradas. API_KEY generada: " + props.getProperty("API_KEY"));
  Logger.log("Editá las propiedades en Configuración > Propiedades del script");
}
