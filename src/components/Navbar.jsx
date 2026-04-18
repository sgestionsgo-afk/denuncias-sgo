// =============================================================
// Navbar.jsx — Barra de navegación simple
// =============================================================
import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  // Resalta el link activo
  const esActivo = (ruta) => location.pathname === ruta ? "nav-link activo" : "nav-link";

  return (
    <nav className="navbar">
      <div className="navbar-marca">
        <span role="img" aria-label="megáfono">📢</span>{" "}
        Denuncias Santiago Capital
      </div>
      <div className="navbar-links">
        <Link to="/" className={esActivo("/")}>Denunciar</Link>
        <Link to="/mapa" className={esActivo("/mapa")}>Mapa</Link>
        <Link to="/admin" className={esActivo("/admin")}>Admin</Link>
      </div>
    </nav>
  );
}

export default Navbar;
