// =============================================================
// Google Apps Script — Code.gs
// API para recibir y listar denuncias desde Google Sheets
//
// INSTRUCCIONES DE DESPLIEGUE:
// 1. Creá una Google Sheet nueva
// 2. En la primera hoja ("Denuncias"), poné estos encabezados en fila 1:
//    A: Fecha | B: Barrio | C: Denuncia | D: Latitud | E: Longitud
// 3. Andá a Extensiones > Apps Script
// 4. Pegá este código completo en Code.gs
// 5. Desplegá como "Aplicación web":
//    - Ejecutar como: tu cuenta
//    - Acceso: Cualquier persona
// 6. Copiá la URL generada y pegala en src/config/api.js
// =============================================================

// Contraseña para el panel de administración
// DEBE coincidir con la de src/config/api.js
const CLAVE_ADMIN = "admin2026";

// Nombre de la hoja donde se guardan las denuncias
const NOMBRE_HOJA = "Denuncias";

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
    // Parsear datos del cuerpo de la petición
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

    // Obtener la hoja
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);

    if (!hoja) {
      return respuestaJSON({ error: "No se encontró la hoja '" + NOMBRE_HOJA + "'" });
    }

    // Agregar fila con los datos
    hoja.appendRow([fecha, barrio, denuncia, lat, lng]);

    return respuestaJSON({ resultado: "ok", mensaje: "Denuncia guardada correctamente" });
  } catch (error) {
    return respuestaJSON({ error: "Error al procesar: " + error.message });
  }
}

// --- Listar datos públicos (solo barrio y ubicación, SIN texto de denuncia) ---
function listarPublico() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);

  if (!hoja || hoja.getLastRow() < 2) {
    return respuestaJSON({ denuncias: [] });
  }

  const datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 5).getValues();

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

// --- Listar TODOS los datos para administradores (con texto de denuncia) ---
function listarAdmin() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);

  if (!hoja || hoja.getLastRow() < 2) {
    return respuestaJSON({ denuncias: [] });
  }

  const datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 5).getValues();

  const denunciasCompletas = datos.map(function(fila) {
    return {
      fecha: fila[0],     // Columna A: Fecha
      barrio: fila[1],    // Columna B: Barrio
      denuncia: fila[2],  // Columna C: Denuncia (solo para admin)
      lat: fila[3],       // Columna D: Latitud
      lng: fila[4],       // Columna E: Longitud
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
