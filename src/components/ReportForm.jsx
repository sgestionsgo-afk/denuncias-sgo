// =============================================================
// ReportForm.jsx — Formulario para enviar denuncias
// Incluye: selección de barrio, texto de denuncia,
// selección de ubicación en mapa, contacto opcional
// =============================================================
import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import BARRIOS from "../config/barrios";
import { GOOGLE_SCRIPT_URL, MAP_CENTER, MAP_ZOOM } from "../config/api";

function ReportForm() {
  // Estado del formulario
  const [barrio, setBarrio] = useState("");
  const [denuncia, setDenuncia] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [ubicacionTexto, setUbicacionTexto] = useState("");
  const [contacto, setContacto] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [mostrarMapaSeleccion, setMostrarMapaSeleccion] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // --- Componente para detectar clicks en el mapa ---
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat: newLat, lng: newLng } = e.latlng;
        setLat(newLat.toFixed(6));
        setLng(newLng.toFixed(6));
        
        // Actualizar marker en el mapa
        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        } else {
          const marker = L.marker([newLat, newLng], {
            icon: L.icon({
              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            }),
          }).addTo(mapRef.current);
          markerRef.current = marker;
        }
      },
    });
    return null;
  }

  // --- Validar contacto (básico) ---
  const validarContacto = (valor) => {
    // Máximo 100 caracteres
    if (valor.length > 100) return false;
    // Permitir: números, caracteres comunes de teléfono y email
    const regex = /^[a-zA-Z0-9@._+\-() ]*$/;
    return regex.test(valor);
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
    // Requerir ubicación
    if (!lat || !lng) {
      setMensaje({ tipo: "error", texto: "Seleccioná la ubicación del problema en el mapa." });
      return;
    }
    // Validar contacto si se proporcionó
    if (contacto && !validarContacto(contacto)) {
      setMensaje({ tipo: "error", texto: "El contacto contiene caracteres inválidos (máx 100 caracteres)." });
      return;
    }

    setEnviando(true);
    setMensaje(null);

    // Datos a enviar
    const datos = {
      barrio,
      denuncia: denuncia.trim(),
      contacto: contacto.trim() || null,
      ubicacionProblema: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        texto: ubicacionTexto || null,
      },
      fecha: new Date().toISOString(),
    };
    
    // IMPORTANTE: Solo agregar fotoBase64 si hay foto
    if (fotoPreview && fotoPreview.startsWith("data:")) {
      datos.fotoBase64 = fotoPreview;
    }

    // DEBUG: Log para ver qué se envía
    console.log("=== ENVIANDO DENUNCIA ===");
    console.log("Barrio:", datos.barrio);
    console.log("Denuncia length:", datos.denuncia.length);
    console.log("Contacto:", datos.contacto);
    console.log("Ubicación:", datos.ubicacionProblema);
    console.log("Tiene foto:", datos.fotoBase64 ? true : false);

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
        setUbicacionTexto("");
        setContacto("");
        setFoto(null);
        setFotoPreview("");
        setMostrarMapaSeleccion(false);
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
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

      <h2>Denuncia Ciudad Capital – Santiago del Estero</h2>
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

        {/* --- Ubicación del problema (REQUERIDA) --- */}
        <div className="ubicacion-section">
          <label>Ubicación del problema *</label>
          <div className="ubicacion-display">
            <div className="ubicacion-info">
              {lat && lng ? (
                <>
                  <span className="ubicacion-texto">✓ Ubicación seleccionada en el mapa</span>
                  {ubicacionTexto && <span className="ubicacion-texto-detalle">({ubicacionTexto})</span>}
                  <br />
                  <small className="ubicacion-coords">{lat}, {lng}</small>
                </>
              ) : (
                <span className="ubicacion-texto placeholder">Seleccioná en el mapa tocando una ubicación</span>
              )}
            </div>
            <button
              type="button"
              className="btn-ubicacion"
              onClick={() => setMostrarMapaSeleccion(!mostrarMapaSeleccion)}
            >
              {lat && lng ? "Cambiar" : "Seleccionar en mapa"}
            </button>
          </div>

          {/* --- Mapa para seleccionar ubicación --- */}
          {mostrarMapaSeleccion && (
            <div className="mapa-seleccion-wrapper">
              <MapContainer
                center={MAP_CENTER}
                zoom={MAP_ZOOM}
                className="mapa-seleccion"
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler />
              </MapContainer>
              <small className="mapa-instruccion">Toca en el mapa para marcar la ubicación</small>
            </div>
          )}

          {/* Input opcional para buscar dirección */}
          <input
            type="text"
            placeholder="Ej: Calle Belgrano y Tucumán (opcional)"
            maxLength="100"
            className="ubicacion-search"
            value={ubicacionTexto}
            onChange={(e) => setUbicacionTexto(e.target.value)}
          />
        </div>

        {/* --- Contacto del emisor (OPCIONAL) --- */}
        <label htmlFor="contacto">Contacto (opcional)</label>
        <input
          type="text"
          id="contacto"
          placeholder="Teléfono o email (si deseas ser contactado)"
          maxLength="100"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
        />
        <small>No será público. Máx 100 caracteres.</small>

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
