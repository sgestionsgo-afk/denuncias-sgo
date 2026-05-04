// ReportForm.jsx — Formulario con Cloudflare Turnstile CAPTCHA y selección de ubicación en mapa
import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import BARRIOS from "../config/barrios";
import { GOOGLE_SCRIPT_URL, API_KEY, TURNSTILE_SITE_KEY } from "../config/api";

function ReportForm() {
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

  // --- Turnstile CAPTCHA ---
  const [captchaToken, setCaptchaToken] = useState("");
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const renderTurnstile = useCallback(() => {
    if (window.turnstile && turnstileRef.current && widgetIdRef.current === null) {
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => setCaptchaToken(token),
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => setCaptchaToken(""),
        theme: "dark",
      });
    }
  }, []);

  useEffect(() => {
    renderTurnstile();
    const interval = setInterval(() => {
      if (widgetIdRef.current !== null) { clearInterval(interval); return; }
      renderTurnstile();
    }, 500);
    return () => clearInterval(interval);
  }, [renderTurnstile]);

  // --- Componente para detectar clicks en el mapa ---
  const mapInstanceRef = useRef(null);
  
  function MapClickHandler() {
    const map = useMap();
    
    useMapEvents({
      click(e) {
        const { lat: newLat, lng: newLng } = e.latlng;
        setLat(newLat.toFixed(6));
        setLng(newLng.toFixed(6));
        
        // Actualizar o crear marcador en el mapa
        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        } else {
          // Crear icono personalizado usando HTML
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin" style="width: 32px; height: 32px; background: #7B2CBF; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(123, 44, 191, 0.6); cursor: pointer;"><span style="color: white; font-size: 18px; font-weight: bold;">•</span></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
          });
          
          const marker = L.marker([newLat, newLng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<div style="font-size: 12px;"><strong>Ubicación:</strong><br>${newLat.toFixed(6)}, ${newLng.toFixed(6)}</div>`);
          markerRef.current = marker;
        }
      },
    });
    
    mapInstanceRef.current = map;
    return null;
  }

  // --- Componente para renderizar marcador persistente ---
  function MarkerRenderer() {
    const map = useMap();
    
    useEffect(() => {
      if (lat && lng && map) {
        // Limpiar marcador anterior si existe
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
          markerRef.current = null;
        }
        
        // Crear icono personalizado usando HTML
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-pin" style="width: 32px; height: 32px; background: #7B2CBF; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(123, 44, 191, 0.6); cursor: pointer;"><span style="color: white; font-size: 18px; font-weight: bold;">•</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });
        
        const marker = L.marker([parseFloat(lat), parseFloat(lng)], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<div style="font-size: 12px;"><strong>Ubicación:</strong><br>${lat}, ${lng}</div>`);
        markerRef.current = marker;
      }
    }, [lat, lng, map]);
    
    return null;
  }

  // --- Validar contacto (básico) ---
  const validarContacto = (valor) => {
    if (valor.length > 100) return false;
    const regex = /^[a-zA-Z0-9@._+\-() ]*$/;
    return regex.test(valor);
  };

  // --- Foto ---
  const manejarFoto = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      setMensaje({ tipo: "error", texto: "Por favor seleccioná una imagen." });
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setMensaje({ tipo: "error", texto: "La imagen no puede superar 5 MB." });
      return;
    }
    setFoto(archivo);
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target?.result || "");
    reader.readAsDataURL(archivo);
  };

  const limpiarFoto = () => { setFoto(null); setFotoPreview(""); };

  // --- Enviar ---
  const enviarDenuncia = async (e) => {
    e.preventDefault();

    if (!barrio) { setMensaje({ tipo: "error", texto: "Seleccioná un barrio." }); return; }
    if (!denuncia.trim() || denuncia.trim().length < 10) {
      setMensaje({ tipo: "error", texto: "La descripción es muy corta (mín 10 caracteres)." });
      return;
    }
    if (!lat || !lng) {
      setMensaje({ tipo: "error", texto: "Seleccioná la ubicación del problema en el mapa." });
      return;
    }
    if (!captchaToken) {
      setMensaje({ tipo: "error", texto: "Completá la verificación CAPTCHA." });
      return;
    }
    if (contacto && !validarContacto(contacto)) {
      setMensaje({ tipo: "error", texto: "El contacto contiene caracteres inválidos (máx 100 caracteres)." });
      return;
    }

    setEnviando(true);
    setMensaje(null);

    const datos = {
      accion: "crear",
      apiKey: API_KEY,
      captchaToken,
      barrio,
      denuncia: denuncia.trim(),
      contacto: contacto.trim() || null,
      ubicacionProblema: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        texto: ubicacionTexto || null,
      },
    };

    if (fotoPreview && fotoPreview.startsWith("data:image/")) {
      datos.fotoBase64 = fotoPreview;
    }

    try {
      const resp = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos),
      });

      let data = {};
      try { 
        const text = await resp.text();
        data = JSON.parse(text); 
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        console.log("Raw response:", resp);
      }

      if (data.resultado === "ok") {
        setMensaje({ tipo: "exito", texto: "¡Denuncia enviada correctamente! Gracias por tu reporte." });
        setBarrio(""); setDenuncia(""); setLat(""); setLng(""); setUbicacionTexto(""); setContacto("");
        setFoto(null); setFotoPreview(""); setMostrarMapaSeleccion(false);
        if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
        // Reset CAPTCHA
        if (widgetIdRef.current !== null && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
          setCaptchaToken("");
        }
      } else if (data.error) {
        setMensaje({ tipo: "error", texto: data.error });
      } else if (resp.ok || resp.redirected) {
        setMensaje({ tipo: "exito", texto: "¡Denuncia enviada!" });
      } else {
        throw new Error("Respuesta no exitosa: " + resp.status);
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      setMensaje({ tipo: "error", texto: "Hubo un error al enviar. Intentá de nuevo más tarde. Error: " + error.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-logo-container">
        <img src="/assets/logo lla.png" alt="Logo La Libertad Avanza" className="form-logo" />
      </div>

      <h2>Reportá un problema en tu zona/barrio</h2>
      <p className="form-subtitulo">
        Tu denuncia es anónima. Los detalles <strong>no</strong> se muestran públicamente.
      </p>

      <form onSubmit={enviarDenuncia} className="report-form">
        {/* Barrio */}
        <label htmlFor="barrio">Barrio *</label>
        <select id="barrio" value={barrio} onChange={(e) => setBarrio(e.target.value)} required>
          <option value="">— Seleccioná tu barrio —</option>
          {BARRIOS.map((b) => (
            <option key={b.nombre} value={b.nombre}>{b.nombre}</option>
          ))}
        </select>

        {/* Descripción */}
        <label htmlFor="denuncia">Descripción del problema *</label>
        <textarea id="denuncia" rows="5" maxLength="1000"
          placeholder="Ej: Hay un bache enorme en la esquina de calle Belgrano y Tucumán..."
          value={denuncia} onChange={(e) => setDenuncia(e.target.value)} required />
        <small>{denuncia.length}/1000 caracteres</small>

        {/* Ubicación del problema (REQUERIDA) */}
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

          {/* Mapa para seleccionar ubicación */}
          {mostrarMapaSeleccion && (
            <div className="mapa-seleccion-wrapper">
              <MapContainer
                center={[-27.7834, -64.2642]}
                zoom={13}
                className="mapa-seleccion"
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler />
                <MarkerRenderer />
              </MapContainer>
              <small className="mapa-instruccion">Toca en el mapa para marcar la ubicación</small>
            </div>
          )}

          {/* Input opcional para dirección */}
          <input
            type="text"
            placeholder="Ej: Calle Belgrano y Tucumán (opcional)"
            maxLength="100"
            className="ubicacion-search"
            value={ubicacionTexto}
            onChange={(e) => setUbicacionTexto(e.target.value)}
          />
        </div>

        {/* Contacto (OPCIONAL) */}
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

        {/* Foto */}
        <div className="foto-section">
          <label>📸 Foto de la situación (opcional)</label>
          <input type="file" accept="image/*" capture="environment" onChange={manejarFoto} />
          {fotoPreview && (
            <div className="foto-preview">
              <img src={fotoPreview} alt="Preview" style={{ maxHeight: 150, borderRadius: 8 }} />
              <button type="button" onClick={limpiarFoto} className="btn-geo">✕ Quitar foto</button>
            </div>
          )}
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className={`mensaje mensaje-${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        {/* CAPTCHA Turnstile */}
        <div ref={turnstileRef} style={{ margin: "1rem 0" }}></div>

        {/* Enviar */}
        <button type="submit" className="btn-enviar" disabled={enviando || !captchaToken}>
          {enviando ? "Enviando..." : "Enviar denuncia"}
        </button>
      </form>
    </div>
  );
}

export default ReportForm;
