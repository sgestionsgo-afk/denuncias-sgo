// App.jsx — Admin: Panel con autenticación server-side
import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import { GOOGLE_SCRIPT_URL, API_KEY } from "./config/api";

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState("");

  // Al montar: re-validar token guardado en sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) { setCargando(false); return; }

    fetch("/api/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ checkToken: token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) setAutenticado(true);
        else sessionStorage.removeItem("admin_token");
      })
      .catch(() => sessionStorage.removeItem("admin_token"))
      .finally(() => setCargando(false));
  }, []);

  const handleLogin = (usuario, clave) => {
    setError("");
    fetch("/api/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ user: usuario, pass: clave }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          sessionStorage.setItem("admin_token", data.token);
          setAutenticado(true);
        } else {
          setError(data.error || "Error al iniciar sesión.");
        }
      })
      .catch(() => setError("Error de conexión. Intentá de nuevo."));
  };

  if (cargando) return null;
  if (!autenticado) return <Login onLogin={handleLogin} error={error} />;
  return <Dashboard scriptUrl={GOOGLE_SCRIPT_URL} apiKey={API_KEY} />;
}

export default App;
