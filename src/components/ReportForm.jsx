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
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");
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

  // --- Manejar subida de foto ---
  const manejarFoto = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Validar tipo de archivo
    if (!archivo.type.startsWith("image/")) {
      setMensaje({ tipo: "error", texto: "Por favor selecciona una imagen." });
      return;
    }

    // Validar tamaño (máx 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      setMensaje({ tipo: "error", texto: "La imagen no puede superar 5MB." });
      return;
    }

    setFoto(archivo);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setFotoPreview(event.target?.result || "");
    };
    reader.readAsDataURL(archivo);
  };

  // --- Limpiar foto ---
  const limpiarFoto = () => {
    setFoto(null);
    setFotoPreview("");
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
      {/* Logo de La Libertad Avanza */}
      <div className="form-logo-container">
        <img 
          src="/assets/logo lla.png" 
          alt="Logo La Libertad Avanza" 
          className="form-logo"
        />
      </div>

      <h2>📝 Reportar un problema en tu zona/barrio</h2>
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

        {/* --- Subida de foto opcional --- */}
        <div className="foto-section">
          <label htmlFor="foto">📸 Foto de la situación (opcional)</label>
          <div className="foto-input-wrapper">
            <input
              type="file"
              id="foto"
              accept="image/*"
              onChange={manejarFoto}
              className="foto-input"
            />
            <label htmlFor="foto" className="foto-label">
              Seleccionar imagen
            </label>
          </div>
          {fotoPreview && (
            <div className="foto-preview">
              <img src={fotoPreview} alt="Vista previa" className="preview-img"/>
              <button
                type="button"
                className="btn-limpiar-foto"
                onClick={limpiarFoto}
              >
                ✕ Quitar foto
              </button>
            </div>
          )}
          <small>Máximo 5MB. Formatos: JPG, PNG, WebP</small>
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
