// =============================================================
// App.jsx — Componente principal con rutas
// Estructura: Mapa como fondo fullscreen + componentes superpuestos
// =============================================================
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReportForm from "./components/ReportForm";
import MapView from "./components/MapView";
import AdminPanel from "./components/AdminPanel";
import MapBackground from "./components/MapBackground";

function App() {
  // Estado del tema (dark/light) - se guarda en localStorage
  const [tema, setTema] = useState(() => {
    const temaSaved = localStorage.getItem("tema");
    return temaSaved || "dark";
  });

  // Guardar preferencia de tema en localStorage
  useEffect(() => {
    localStorage.setItem("tema", tema);
    // Actualizar clase en el elemento raíz
    document.documentElement.className = tema === "light" ? "light-mode" : "";
  }, [tema]);

  // Toggle entre dark y light mode
  const toggleTema = () => {
    setTema(tema === "dark" ? "light" : "dark");
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Mapa como fondo fullscreen (siempre visible) */}
        <div className="map-background">
          <MapBackground />
        </div>
        
        {/* Overlay oscuro sobre el mapa */}
        <div className="map-overlay"></div>
        
        {/* Contenido principal (encima del mapa) */}
        <div className="app-content">
          <Navbar tema={tema} toggleTema={toggleTema} />
          <main className="main-content">
            <Routes>
              {/* Página principal: formulario de denuncia */}
              <Route path="/" element={<ReportForm />} />
              {/* Página especial: mapa ampliado */}
              <Route path="/mapa" element={<MapView />} />
              {/* Panel de administración protegido */}
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </main>
          <footer className="app-footer">
            <p>Denuncias Vía Pública — Santiago del Estero Capital — 2026</p>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
