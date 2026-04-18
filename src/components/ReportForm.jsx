// =============================================================
// ReportForm.jsx — Formulario para enviar denuncias
// Incluye: selección de barrio, texto de denuncia,
// captura opcional de geolocalización.
// =============================================================
import React, { useState } from "react";
import BARRIOS from "../config/barrios";
import { GOOGLE_SCRIPT_URL } from "../config/api";

function ReportForm() {
  // Estado del formulario
  const [barrio, setBarrio] = useState("");
  const [denuncia, setDenuncia] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [geoError, setGeoError] = useState("");

  // --- Capturar ubicación del navegador ---
  const capturarUbicacion = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      (err) => {
        setGeoError("No se pudo obtener la ubicación. Verificá los permisos.");
        console.warn("Error geolocalización:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // --- Enviar denuncia a Google Apps Script ---
  const enviarDenuncia = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!barrio) {
      setMensaje({ tipo: "error", texto: "Seleccioná un barrio." });
      return;
    }
    if (!denuncia.trim()) {
      setMensaje({ tipo: "error", texto: "Escribí una descripción del problema." });
      return;
    }
    if (denuncia.trim().length < 10) {
      setMensaje({ tipo: "error", texto: "La descripción es muy corta (mínimo 10 caracteres)." });
      return;
    }

    setEnviando(true);
    setMensaje(null);

    // Datos a enviar
    const datos = {
      barrio,
      denuncia: denuncia.trim(),
      lat: lat || "",
      lng: lng || "",
      fecha: new Date().toISOString(),
    };

    try {
      // Enviamos como POST al Google Apps Script
      const respuesta = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(datos),
      });

      // Google Apps Script redirige, así que aceptamos cualquier respuesta OK
      if (respuesta.ok || respuesta.redirected) {
        setMensaje({ tipo: "exito", texto: "¡Denuncia enviada correctamente! Gracias por tu reporte." });
        // Limpiar formulario
        setBarrio("");
        setDenuncia("");
        setLat("");
        setLng("");
      } else {
        throw new Error("Respuesta no exitosa");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      setMensaje({
        tipo: "error",
        texto: "Hubo un error al enviar. Intentá de nuevo más tarde.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="form-container">
      <h2>📝 Reportar un problema en la vía pública</h2>
      <p className="form-subtitulo">
        Tu denuncia es anónima. Los detalles <strong>no</strong> se muestran públicamente.
      </p>

      <form onSubmit={enviarDenuncia} className="report-form">
        {/* --- Selección de barrio --- */}
        <label htmlFor="barrio">Barrio *</label>
        <select
          id="barrio"
          value={barrio}
          onChange={(e) => setBarrio(e.target.value)}
          required
        >
          <option value="">— Seleccioná tu barrio —</option>
          {BARRIOS.map((b) => (
            <option key={b.nombre} value={b.nombre}>
              {b.nombre}
            </option>
          ))}
        </select>

        {/* --- Texto de la denuncia --- */}
        <label htmlFor="denuncia">Descripción del problema *</label>
        <textarea
          id="denuncia"
          rows="5"
          maxLength="1000"
          placeholder="Ej: Hay un bache enorme en la esquina de calle Belgrano y Tucumán..."
          value={denuncia}
          onChange={(e) => setDenuncia(e.target.value)}
          required
        />
        <small>{denuncia.length}/1000 caracteres</small>

        {/* --- Geolocalización opcional --- */}
        <div className="geo-section">
          <label>Ubicación (opcional)</label>
          <button
            type="button"
            className="btn-geo"
            onClick={capturarUbicacion}
          >
            📍 Capturar mi ubicación
          </button>
          {lat && lng && (
            <p className="geo-info">
              Ubicación capturada: {lat}, {lng}
            </p>
          )}
          {geoError && <p className="geo-error">{geoError}</p>}
        </div>

        {/* --- Mensajes de estado --- */}
        {mensaje && (
          <div className={`mensaje mensaje-${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        {/* --- Botón de envío --- */}
        <button type="submit" className="btn-enviar" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar denuncia"}
        </button>
      </form>
    </div>
  );
}

export default ReportForm;
