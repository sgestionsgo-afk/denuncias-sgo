// MapView.jsx — Mapa público con datos AGREGADOS por barrio
// La API ahora devuelve { barrio, cantidad } — sin texto ni coords exactas
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { GOOGLE_SCRIPT_URL, PROXY_API_URL, API_KEY, MAP_CENTER, MAP_ZOOM } from "../config/api";
import BARRIOS from "../config/barrios";

function MapView() {
  const [stats, setStats] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const clusterRef = useRef(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const url = `${PROXY_API_URL}?accion=listar_publico&apiKey=${encodeURIComponent(API_KEY)}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data && data.denuncias) {
          setStats(data.denuncias);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error("Error cargando denuncias:", err);
        setError("No se pudieron cargar las denuncias. Intentá más tarde.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  // Crear markers a partir de datos agregados (barrio + cantidad)
  useEffect(() => {
    const mapa = mapRef.current;
    if (!mapa || stats.length === 0) return;

    if (clusterRef.current) mapa.removeLayer(clusterRef.current);

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      iconCreateFunction: (c) => {
        const count = c.getChildCount();
        let size = "small", bg = "#7B2CBF";
        if (count > 10) { size = "medium"; bg = "#9D4EDD"; }
        if (count > 30) { size = "large"; bg = "#5A1F8E"; }
        return L.divIcon({
          html: `<div class="cluster-icon cluster-${size}" style="background:${bg}">${count}</div>`,
          className: "custom-cluster",
          iconSize: L.point(40, 40),
        });
      },
    });

    // Para cada barrio, generar N puntos aleatorios según la cantidad
    stats.forEach((s) => {
      const info = BARRIOS.find((b) => b.nombre === s.barrio);
      if (!info) return;

      for (let i = 0; i < s.cantidad; i++) {
        const lat = info.lat + (Math.random() - 0.5) * 0.015;
        const lng = info.lng + (Math.random() - 0.5) * 0.015;

        const marker = L.circleMarker([lat, lng], {
          radius: 5,
          fillColor: "#FF2E57",
          color: "#CC0033",
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.95,
        });

        marker.bindPopup(
          `<strong>Barrio:</strong> ${sanitizar(s.barrio)}<br/>` +
          `<small style="opacity:.7">Ubicación aproximada por privacidad</small>`
        );
        cluster.addLayer(marker);
      }
    });

    mapa.addLayer(cluster);
    clusterRef.current = cluster;
  }, [stats]);

  const sanitizar = (t) => {
    const div = document.createElement("div");
    div.textContent = t || "";
    return div.innerHTML;
  };

  return (
    <div className="map-container">
      <h2>🗺️ Mapa de denuncias</h2>
      <p className="map-subtitulo">
        Se muestran solo ubicaciones aproximadas y cantidades. Los detalles son privados.
      </p>

      <div className="privacy-notice">
        <p>
          <strong>🔒 Privacidad garantizada:</strong> Las ubicaciones son <strong>aproximadas</strong> dentro del barrio.
          Los puntos rojos marcan el sector general, no el lugar exacto.
        </p>
      </div>

      {cargando && <p className="cargando">Cargando denuncias...</p>}
      {error && <p className="mensaje mensaje-error">{error}</p>}

      <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} className="leaflet-mapa"
        ref={mapRef} whenReady={(m) => { mapRef.current = m.target; }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attribution">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={19} />
      </MapContainer>

      {/* Estadísticas carrusel */}
      {!cargando && stats.length > 0 && (
        <div className="stats-carousel">
          <div className="carousel-track">
            {stats.sort((a, b) => b.cantidad - a.cantidad).map((s) => (
              <div key={s.barrio} className="carousel-item">
                <span className="console-text">[{s.barrio}] → {s.cantidad}</span>
              </div>
            ))}
            {stats.sort((a, b) => b.cantidad - a.cantidad).map((s) => (
              <div key={`${s.barrio}-dup`} className="carousel-item">
                <span className="console-text">[{s.barrio}] → {s.cantidad}</span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", opacity: 0.7, marginTop: "0.5rem" }}>
            Total: {total} denuncias registradas
          </p>
        </div>
      )}

      {!cargando && stats.length === 0 && !error && (
        <p className="sin-datos">Todavía no hay denuncias registradas.</p>
      )}
    </div>
  );
}

export default MapView;
