// App.jsx — App pública: formulario + mapa (SIN admin)
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReportForm from "./components/ReportForm";
import MapView from "./components/MapView";
import MapBackground from "./components/MapBackground";

function App() {
  const [tema, setTema] = useState(() => localStorage.getItem("tema") || "dark");

  useEffect(() => {
    localStorage.setItem("tema", tema);
    document.documentElement.className = tema === "light" ? "light-mode" : "";
  }, [tema]);

  const toggleTema = () => setTema(tema === "dark" ? "light" : "dark");

  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="map-background">
          <MapBackground />
        </div>
        <div className="map-overlay"></div>
        <div className="app-content">
          <Navbar tema={tema} toggleTema={toggleTema} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ReportForm />} />
              <Route path="/mapa" element={<MapView />} />
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
