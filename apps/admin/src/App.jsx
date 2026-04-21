// App.jsx — Admin: Google Sign-In → Dashboard
import React, { useState, useEffect, useCallback } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { GOOGLE_SCRIPT_URL, GOOGLE_CLIENT_ID } from "./config/api";

function App() {
  const [user, setUser] = useState(null);       // { email, name, picture }
  const [idToken, setIdToken] = useState(null);  // JWT de Google
  const [error, setError] = useState("");

  // Restaurar sesión (sessionStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_id_token");
    if (stored) {
      try {
        const payload = JSON.parse(atob(stored.split(".")[1]));
        // Verificar que no esté expirado
        if (payload.exp * 1000 > Date.now()) {
          setIdToken(stored);
          setUser({ email: payload.email, name: payload.name, picture: payload.picture });
        } else {
          sessionStorage.removeItem("admin_id_token");
        }
      } catch (_) {
        sessionStorage.removeItem("admin_id_token");
      }
    }
  }, []);

  const handleLogin = useCallback((credential) => {
    try {
      const payload = JSON.parse(atob(credential.split(".")[1]));
      setIdToken(credential);
      setUser({ email: payload.email, name: payload.name, picture: payload.picture });
      sessionStorage.setItem("admin_id_token", credential);
      setError("");
    } catch (err) {
      setError("Error al procesar el token de Google.");
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setIdToken(null);
    sessionStorage.removeItem("admin_id_token");
    // Revoke Google session
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  if (!user || !idToken) {
    return <Login onLogin={handleLogin} error={error} />;
  }

  return (
    <Dashboard
      user={user}
      idToken={idToken}
      scriptUrl={GOOGLE_SCRIPT_URL}
      onLogout={handleLogout}
    />
  );
}

export default App;
