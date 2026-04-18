// =============================================================
// Navbar.jsx — Barra de navegación simple
// =============================================================
import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar({ tema, toggleTema }) {
  const location = useLocation();

  // Resalta el link activo
  const esActivo = (ruta) => location.pathname === ruta ? "nav-link activo" : "nav-link";

  return (
    <nav className="navbar">
      <div className="navbar-marca">
        <img src="/assets/logo lla.png" alt="Logo La Libertad Avanza" className="navbar-logo"/>
        Denuncias Santiago Capital
      </div>
      <div className="navbar-links">
        <Link to="/" className={esActivo("/")}>Denunciar</Link>
        <Link to="/mapa" className={esActivo("/mapa")}>Mapa</Link>
        <Link to="/admin" className={esActivo("/admin")}>Admin</Link>
        {/* Botón toggle tema pequeño */}
        <button 
          onClick={toggleTema} 
          className="btn-tema"
          title={tema === "dark" ? "Pasar a modo claro" : "Pasar a modo oscuro"}
        >
          {tema === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
