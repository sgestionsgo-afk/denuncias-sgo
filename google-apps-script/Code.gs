// =============================================================
// Google Apps Script — Code.gs  (versión limpia)
// API para recibir y listar denuncias desde Google Sheets
// Incluye guardado de fotos en Google Drive
// =============================================================

// Contraseña para el panel de administración
// DEBE coincidir con la de src/config/api.js
const CLAVE_ADMIN = "admin2026";

// Nombre de la hoja donde se guardan las denuncias
const NOMBRE_HOJA = "Denuncias";

// ID de la carpeta en Google Drive donde se guardarán las fotos
// IMPORTANTE: Crea una carpeta en Drive, haz clic derecho > Obtener ID de carpeta
// y pega el ID aquí (o usa DriveApp.createFolder("Fotos Denuncias"))
let CARPETA_FOTOS_ID = null;

// --- Función auxiliar para obtener o crear carpeta de fotos ---
function obtenerCarpetaFotos() {
  if (CARPETA_FOTOS_ID) {
    try {
      return DriveApp.getFolderById(CARPETA_FOTOS_ID);
    } catch (e) {
      // Si la carpeta no existe, crearla
    }
  }
  
  // Buscar o crear carpeta "Fotos Denuncias"
  const folders = DriveApp.getFoldersByName("Fotos Denuncias");
  if (folders.hasNext()) {
    CARPETA_FOTOS_ID = folders.next().getId();
    return DriveApp.getFolderById(CARPETA_FOTOS_ID);
  }
  
  // Crear carpeta si no existe
  const nuevaCarpeta = DriveApp.createFolder("Fotos Denuncias");
  CARPETA_FOTOS_ID = nuevaCarpeta.getId();
  return nuevaCarpeta;
}

// --- Manejar peticiones GET (lectura de datos) ---
function doGet(e) {
  const accion = e.parameter.accion;

  if (accion === "listar_publico") {
    return listarPublico();
  }

  if (accion === "listar_admin") {
    const clave = e.parameter.clave;
    if (clave !== CLAVE_ADMIN) {
      return respuestaJSON({ error: "Clave incorrecta" });
    }
    return listarAdmin();
  }

  return respuestaJSON({ error: "Acción no reconocida" });
}

// --- Manejar peticiones POST (nueva denuncia) ---
function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);

    // Validar campos requeridos
    if (!datos.barrio || !datos.denuncia) {
      return respuestaJSON({ error: "Faltan campos obligatorios (barrio, denuncia)" });
    }

    // Sanitizar: limitar longitud del texto
    const barrio = datos.barrio.substring(0, 100);
    const denuncia = datos.denuncia.substring(0, 1000);
    const lat = datos.lat ? String(datos.lat).substring(0, 20) : "";
    const lng = datos.lng ? String(datos.lng).substring(0, 20) : "";
    const fecha = datos.fecha || new Date().toISOString();

    // Guardar foto en Drive si viene en el request
    let urlFoto = "";
    const fotoBase64 = datos.fotoBase64;
    if (fotoBase64 && typeof fotoBase64 === "string" && fotoBase64.length > 50) {
      try {
        urlFoto = guardarFotoEnDrive(fotoBase64, barrio, fecha);
      } catch (err) {
        // Si falla la foto, continuar sin ella
        Logger.log("Error al guardar foto: " + err.message);
      }
    }

    // Guardar en Sheets
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);
    if (!hoja) {
      return respuestaJSON({ error: "No se encontró la hoja '" + NOMBRE_HOJA + "'" });
    }
    hoja.appendRow([fecha, barrio, denuncia, lat, lng, urlFoto]);

    return respuestaJSON({
      resultado: "ok",
      mensaje: "Denuncia guardada correctamente",
      fotoGuardada: urlFoto.length > 0,
      fotoUrl: urlFoto
    });

  } catch (error) {
    return respuestaJSON({ error: "Error al procesar: " + error.message });
  }
}

// --- Función para guardar foto en Google Drive ---
function guardarFotoEnDrive(fotoBase64, barrio, fecha) {
  try {
    // Extraer el MIME type y los datos del base64
    // Formato esperado: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    const partes = fotoBase64.split(",");
    const mimeType = partes[0].match(/:(.*?);/)[1] || "image/jpeg";
    const dataBase64 = partes[1];
    
    // Decodificar base64 a bytes
    const bytes = Utilities.base64Decode(dataBase64);
    
    // Crear nombre único para el archivo
    const timestamp = new Date().getTime();
    const nombreArchivo = "Foto_" + barrio.replace(/\s+/g, "_") + "_" + timestamp + ".jpg";
    
    // Obtener carpeta de fotos
    const carpeta = obtenerCarpetaFotos();
    
    // Crear archivo en Drive
    const blob = Utilities.newBlob(bytes, mimeType, nombreArchivo);
    const archivo = carpeta.createFile(blob);
    
    // Obtener URL compartible
    archivo.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    const urlFoto = archivo.getUrl();
    
    Logger.log("Foto guardada: " + urlFoto);
    return urlFoto;
    
  } catch (error) {
    Logger.log("Error en guardarFotoEnDrive: " + error.message);
    throw error;
  }
}

// --- Listar datos públicos (solo barrio y ubicación, SIN texto de denuncia) ---
function listarPublico() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);

  if (!hoja || hoja.getLastRow() < 2) {
    return respuestaJSON({ denuncias: [] });
  }

  const datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 6).getValues();

  // Devolver SOLO barrio y coordenadas (nunca el texto de la denuncia)
  const denunciasPublicas = datos.map(function(fila) {
    return {
      barrio: fila[1],   // Columna B: Barrio
      lat: fila[3],       // Columna D: Latitud
      lng: fila[4],       // Columna E: Longitud
    };
  });

  return respuestaJSON({ denuncias: denunciasPublicas });
}

// --- Listar TODOS los datos para administradores (con texto de denuncia y foto) ---
function listarAdmin() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);

  if (!hoja || hoja.getLastRow() < 2) {
    return respuestaJSON({ denuncias: [] });
  }

  const datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 6).getValues();

  const denunciasCompletas = datos.map(function(fila) {
    return {
      fecha: fila[0],     // Columna A: Fecha
      barrio: fila[1],    // Columna B: Barrio
      denuncia: fila[2],  // Columna C: Denuncia (solo para admin)
      lat: fila[3],       // Columna D: Latitud
      lng: fila[4],       // Columna E: Longitud
      foto: fila[5] || "" // Columna F: URL de foto en Drive
    };
  });

  return respuestaJSON({ denuncias: denunciasCompletas });
}

// --- Utilidad: crear respuesta JSON con CORS habilitado ---
function respuestaJSON(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
