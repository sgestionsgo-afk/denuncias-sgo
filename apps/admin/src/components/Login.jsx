// Login.jsx — Pantalla de login con usuario y contraseña
import React, { useState } from "react";

function Login({ onLogin, error }) {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(usuario, clave);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔒 Panel de Administración</h1>
        <p>Denuncias Vía Pública — Santiago del Estero</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="submit">Ingresar</button>
        </form>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
