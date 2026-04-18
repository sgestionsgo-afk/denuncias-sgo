// =============================================================
// Google Apps Script — Code.gs
// API para recibir y listar denuncias desde Google Sheets
// Incluye guardado de fotos en Google Drive
//
// INSTRUCCIONES DE DESPLIEGUE:
// 1. Creá una Google Sheet nueva
// 2. En la primera hoja ("Denuncias"), poné estos encabezados en fila 1:
//    A: Fecha | B: Barrio | C: Denuncia | D: Latitud | E: Longitud | F: Foto URL
// 3. Andá a Extensiones > Apps Script
// 4. Pegá este código completo en Code.gs
// 5. Desplegá como "Aplicación web":
//    - Ejecutar como: tu cuenta
//    - Acceso: Cualquier persona
// 6. Copiá la URL generada y pegala en src/config/api.js
// 7. El script crea automáticamente una carpeta "Fotos Denuncias" en tu Drive
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
    // DEBUG: Log todo lo que recibimos
    Logger.log("=== INICIO doPost ===");
    Logger.log("postData type: " + typeof e.postData);
    Logger.log("postData.contents length: " + e.postData.contents.length);
    Logger.log("postData.contents primeros 200 chars: " + e.postData.contents.substring(0, 200));
    
    // Parsear datos del cuerpo de la petición
    const datos = JSON.parse(e.postData.contents);
    
    // DEBUG: Loguear qué recibimos después de parsear
    Logger.log("=== DATOS PARSEADOS ===");
    Logger.log("Keys en datos: " + Object.keys(datos).join(", "));
    Logger.log("Barrio: " + datos.barrio);
    Logger.log("Denuncia: " + datos.denuncia);
    Logger.log("Tipo fotoBase64: " + typeof datos.fotoBase64);
    Logger.log("fotoBase64 es undefined: " + (datos.fotoBase64 === undefined));
    Logger.log("fotoBase64 es null: " + (datos.fotoBase64 === null));
    Logger.log("fotoBase64 === '': " + (datos.fotoBase64 === ""));
    Logger.log("fotoBase64 length: " + (datos.fotoBase64 ? datos.fotoBase64.length : "N/A"));
    
    if (datos.fotoBase64) {
      Logger.log("✓ Tiene fotoBase64 (truthy)");
      Logger.log("fotoBase64 starts with: " + datos.fotoBase64.substring(0, 80));
    } else {
      Logger.log("✗ NO tiene fotoBase64 (falsy)");
    }

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
    
    // Procesar foto si existe (base64)
    let urlFoto = "";
    Logger.log("=== PROCESANDO FOTO ===");
    
    // Verificar si fotoBase64 existe Y tiene datos
    const tieneFoto = datos.hasOwnProperty("fotoBase64") && 
                      datos.fotoBase64 && 
                      datos.fotoBase64.length > 0 &&
                      datos.fotoBase64.startsWith("data:");
    
    Logger.log("Tiene propiedad fotoBase64: " + datos.hasOwnProperty("fotoBase64"));
    Logger.log("Valor fotoBase64: " + (datos.fotoBase64 ? "truthy" : "falsy"));
    Logger.log("Tipo de fotoBase64: " + typeof datos.fotoBase64);
    Logger.log("¿Comienza con data:? " + (datos.fotoBase64 ? datos.fotoBase64.startsWith("data:") : "N/A"));
    Logger.log("tieneFoto final: " + tieneFoto);
    
    if (tieneFoto) {
      try {
        Logger.log("→ Intentando guardar foto...");
        Logger.log("  fotoBase64 length: " + datos.fotoBase64.length);
        Logger.log("  fotoBase64 first 100 chars: " + datos.fotoBase64.substring(0, 100));
        
        urlFoto = guardarFotoEnDrive(datos.fotoBase64, barrio, fecha);
        Logger.log("✓ Foto guardada: " + urlFoto);
      } catch (fotoError) {
        Logger.log("✗ Error guardando foto: " + fotoError.message);
        Logger.log("Stack trace: " + fotoError.stack);
        // Continuar sin foto
        urlFoto = "";
      }
    } else {
      Logger.log("✗ No hay foto para guardar");
    }

    Logger.log("urlFoto final: '" + urlFoto + "' (length: " + urlFoto.length + ")");
    
    // Obtener la hoja
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);

    if (!hoja) {
      return respuestaJSON({ error: "No se encontró la hoja '" + NOMBRE_HOJA + "'" });
    }

    // Agregar fila con los datos (ahora con la foto en columna F)
    const fila = [fecha, barrio, denuncia, lat, lng, urlFoto];
    Logger.log("Agregando fila: " + JSON.stringify(fila).substring(0, 200));
    hoja.appendRow(fila);
    Logger.log("✓ Fila agregada exitosamente");

    Logger.log("=== FIN doPost ===");
    return respuestaJSON({ 
      resultado: "ok", 
      mensaje: "Denuncia guardada correctamente",
      fotoGuardada: urlFoto ? true : false,
      fotoLength: urlFoto.length
    });
  } catch (error) {
    Logger.log("✗✗✗ EXCEPCION EN doPost: " + error.message);
    Logger.log("Stack: " + error.stack);
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
