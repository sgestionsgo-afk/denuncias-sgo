// Navbar.jsx — SIN link a admin
import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar({ tema, toggleTema }) {
  const location = useLocation();
  const esActivo = (ruta) => (location.pathname === ruta ? "nav-link activo" : "nav-link");

  return (
    <nav className="navbar">
      <div className="navbar-marca">
        <img src="/assets/logo lla.png" alt="Logo" className="navbar-logo" />
        Denuncias — Ciudad de Santiago del Estero
      </div>
      <div className="navbar-links">
        <Link to="/" className={esActivo("/")}>Denunciar</Link>
        <Link to="/mapa" className={esActivo("/mapa")}>Mapa</Link>
        <button onClick={toggleTema} className="btn-tema"
          title={tema === "dark" ? "Modo claro" : "Modo oscuro"}>
          {tema === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
