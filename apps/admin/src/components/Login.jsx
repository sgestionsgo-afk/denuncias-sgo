// Login.jsx — Pantalla de login con Google Sign-In
import React, { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "../config/api";

function Login({ onLogin, error }) {
  const btnRef = useRef(null);

  useEffect(() => {
    const init = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) onLogin(response.credential);
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "filled_blue",
        size: "large",
        text: "signin_with",
        shape: "pill",
        width: 300,
      });
    };

    if (window.google) {
      init();
    } else {
      // Esperar a que cargue GSI
      const interval = setInterval(() => {
        if (window.google) { clearInterval(interval); init(); }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [onLogin]);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔒 Panel de Administración</h1>
        <p>Denuncias Vía Pública — Santiago del Estero</p>
        <p className="login-hint">
          Iniciá sesión con tu cuenta de Google autorizada.
        </p>
        <div ref={btnRef} className="google-btn-wrapper"></div>
        {error && <p className="login-error">{error}</p>}
        <p className="login-footer">
          Solo los emails autorizados pueden acceder.
        </p>
      </div>
    </div>
  );
}

export default Login;
