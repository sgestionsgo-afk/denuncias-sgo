// =============================================================
// MapView.jsx — Página de mapa ampliado con estadísticas
// Muestra SOLO la ubicación y cantidad, NUNCA el texto.
// Usa React Leaflet + MarkerCluster para agrupar marcadores.
// =============================================================
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { GOOGLE_SCRIPT_URL, MAP_CENTER, MAP_ZOOM } from "../config/api";
import BARRIOS from "../config/barrios";

function MapView() {
  const [denuncias, setDenuncias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const clusterRef = useRef(null);

  // --- Cargar denuncias desde Google Sheet (solo datos públicos) ---
  useEffect(() => {
    const cargarDenuncias = async () => {
      try {
        // Pedimos datos al Apps Script con acción "listar"
        const url = `${GOOGLE_SCRIPT_URL}?accion=listar_publico`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data && data.denuncias) {
          setDenuncias(data.denuncias);
        }
      } catch (err) {
        console.error("Error cargando denuncias:", err);
        setError("No se pudieron cargar las denuncias. Intentá más tarde.");
      } finally {
        setCargando(false);
      }
    };

    cargarDenuncias();
  }, []);

  // --- Crear capa de cluster cuando el mapa y los datos estén listos ---
  useEffect(() => {
    const mapa = mapRef.current;
    if (!mapa || denuncias.length === 0) return;

    // Limpiar cluster anterior si existe
    if (clusterRef.current) {
      mapa.removeLayer(clusterRef.current);
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      iconCreateFunction: (clusterObj) => {
        const count = clusterObj.getChildCount();
        let size = "small";
        let bgColor = "#7B2CBF";
        
        if (count > 10) {
          size = "medium";
          bgColor = "#9D4EDD";
        }
        if (count > 30) {
          size = "large";
          bgColor = "#5A1F8E";
        }

        return L.divIcon({
          html: `<div class="cluster-icon cluster-${size}" style="background: ${bgColor};">${count}</div>`,
          className: "custom-cluster",
          iconSize: L.point(40, 40),
        });
      },
    });

    denuncias.forEach((d) => {
      // PRIVACIDAD: Usar ubicación aleatoria dentro del rango del barrio
      // NUNCA mostrar coordenadas exactas en el mapa público
      const barrioInfo = BARRIOS.find((b) => b.nombre === d.barrio);
      if (!barrioInfo) return; // Sin barrio válido, no mostrar

      // Generar ubicación aleatoria en rango del barrio (±0.01 en lat/lng ≈ 1km)
      const latitud = barrioInfo.lat + (Math.random() - 0.5) * 0.015;
      const longitud = barrioInfo.lng + (Math.random() - 0.5) * 0.015;

      // Marcador rojo brillante — solo barrio (sin información privada)
      const marker = L.circleMarker([latitud, longitud], {
        radius: 5,
        fillColor: "#FF2E57",
        color: "#CC0033",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.95,
      });
      
      // Efecto de brillo añadido dinámicamente
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.style.filter = "drop-shadow(0 0 8px #FF2E57) drop-shadow(0 0 12px rgba(255, 46, 87, 0.6))";
        markerElement.style.animation = "pulse-red 2s infinite";
      }
      
      // Popup solo con barrio (sin ubicación exacta)
      marker.bindPopup(`<strong>Barrio:</strong> ${sanitizarTexto(d.barrio)}<br/><small style="opacity: 0.7">Ubicación aproximada por privacidad</small>`);
      cluster.addLayer(marker);
    });

    mapa.addLayer(cluster);
    clusterRef.current = cluster;
  }, [denuncias]);

  // Sanitizar texto para prevenir XSS en popups
  const sanitizarTexto = (texto) => {
    const div = document.createElement("div");
    div.textContent = texto || "";
    return div.innerHTML;
  };

  // --- Conteo por barrio para estadísticas ---
  const conteoPorBarrio = denuncias.reduce((acc, d) => {
    acc[d.barrio] = (acc[d.barrio] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="map-container">
      <h2>🗺️ Mapa de denuncias</h2>
      <p className="map-subtitulo">
        Se muestran solo las ubicaciones y cantidades. Los detalles son privados.
      </p>

      {/* Información sobre privacidad */}
      <div className="privacy-notice">
        <p>
          <strong>🔒 Privacidad garantizada:</strong> Las ubicaciones mostradas son <strong>aproximadas</strong> dentro del barrio. 
          Los puntos rojos marcan el sector general, no el lugar exacto de la denuncia. Esto protege la privacidad de quien reporta el problema.
        </p>
      </div>

      {cargando && <p className="cargando">Cargando denuncias...</p>}
      {error && <p className="mensaje mensaje-error">{error}</p>}

      {/* Mapa de Leaflet */}
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        className="leaflet-mapa"
        ref={mapRef}
        whenReady={(mapInstance) => {
          mapRef.current = mapInstance.target;
        }}
      >
        {/* TileLayer oscuro: CartoDB Positron Dark */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
      </MapContainer>

      {/* Carrusel de estadísticas por barrio - tipo consola */}
      {!cargando && denuncias.length > 0 && (
        <div className="stats-carousel">
          <div className="carousel-track">
            {Object.entries(conteoPorBarrio)
              .sort((a, b) => b[1] - a[1])
              .map(([nombre, cantidad]) => (
                <div key={nombre} className="carousel-item">
                  <span className="console-text">[{nombre}] → {cantidad}</span>
                </div>
              ))}
            {/* Duplicar items para efecto infinito */}
            {Object.entries(conteoPorBarrio)
              .sort((a, b) => b[1] - a[1])
              .map(([nombre, cantidad]) => (
                <div key={`${nombre}-clone`} className="carousel-item">
                  <span className="console-text">[{nombre}] → {cantidad}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {!cargando && denuncias.length === 0 && !error && (
        <p className="sin-datos">Todavía no hay denuncias registradas.</p>
      )}
    </div>
  );
}

export default MapView;
