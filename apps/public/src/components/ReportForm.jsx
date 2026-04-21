// ReportForm.jsx — Formulario con Cloudflare Turnstile CAPTCHA
import React, { useState, useEffect, useRef, useCallback } from "react";
import BARRIOS from "../config/barrios";
import { GOOGLE_SCRIPT_URL, API_KEY, TURNSTILE_SITE_KEY } from "../config/api";

function ReportForm() {
  const [barrio, setBarrio] = useState("");
  const [denuncia, setDenuncia] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [geoError, setGeoError] = useState("");

  // --- Turnstile CAPTCHA ---
  const [captchaToken, setCaptchaToken] = useState("");
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

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

  // --- Geolocalización ---
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
      () => setGeoError("No se pudo obtener la ubicación. Verificá los permisos."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
    if (!captchaToken) {
      setMensaje({ tipo: "error", texto: "Completá la verificación CAPTCHA." });
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
      lat: lat || "",
      lng: lng || "",
    };

    if (fotoPreview && fotoPreview.startsWith("data:image/")) {
      datos.fotoBase64 = fotoPreview;
    }

    try {
      const resp = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(datos),
      });

      let data = {};
      try { data = await resp.json(); } catch (_) {}

      if (data.resultado === "ok") {
        setMensaje({ tipo: "exito", texto: "¡Denuncia enviada correctamente! Gracias por tu reporte." });
        setBarrio(""); setDenuncia(""); setLat(""); setLng("");
        setFoto(null); setFotoPreview("");
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
        throw new Error("Respuesta no exitosa");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      setMensaje({ tipo: "error", texto: "Hubo un error al enviar. Intentá de nuevo más tarde." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-logo-container">
        <img src="/assets/logo lla.png" alt="Logo La Libertad Avanza" className="form-logo" />
      </div>

      <h2>📝 Reportar un problema en tu zona/barrio</h2>
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

        {/* Foto */}
        <div className="foto-section">
          <label>Foto (opcional)</label>
          <input type="file" accept="image/*" capture="environment" onChange={manejarFoto} />
          {fotoPreview && (
            <div className="foto-preview">
              <img src={fotoPreview} alt="Preview" style={{ maxHeight: 150, borderRadius: 8 }} />
              <button type="button" onClick={limpiarFoto} className="btn-geo">✕ Quitar foto</button>
            </div>
          )}
        </div>

        {/* Geolocalización */}
        <div className="geo-section">
          <button type="button" onClick={capturarUbicacion} className="btn-geo">
            📍 Capturar mi ubicación
          </button>
          {lat && lng && <small>Lat: {lat}, Lng: {lng}</small>}
          {geoError && <small className="mensaje-error">{geoError}</small>}
        </div>

        {/* CAPTCHA Turnstile */}
        <div ref={turnstileRef} style={{ margin: "1rem 0" }}></div>

        {/* Enviar */}
        <button type="submit" className="btn-enviar" disabled={enviando || !captchaToken}>
          {enviando ? "Enviando..." : "Enviar denuncia"}
        </button>
      </form>

      {mensaje && (
        <p className={`mensaje ${mensaje.tipo === "exito" ? "mensaje-exito" : "mensaje-error"}`}>
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}

export default ReportForm;
