// MapBackground.jsx — Fondo con datos agregados (barrio + cantidad)
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { GOOGLE_SCRIPT_URL, PROXY_API_URL, API_KEY, MAP_CENTER, MAP_ZOOM } from "../config/api";
import BARRIOS from "../config/barrios";

function MapBackground() {
  const [stats, setStats] = useState([]);
  const mapRef = useRef(null);
  const clusterRef = useRef(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const url = `${PROXY_API_URL}?accion=listar_publico&apiKey=${encodeURIComponent(API_KEY)}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data && data.denuncias) setStats(data.denuncias);
      } catch (err) {
        console.error("Error cargando denuncias para background:", err);
      }
    };
    cargar();
    const interval = setInterval(cargar, 60000); // cada 60s (no 30)
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mapa = mapRef.current;
    if (!mapa) return;
    if (clusterRef.current) mapa.removeLayer(clusterRef.current);
    if (stats.length === 0) return;

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
        cluster.addLayer(marker);
      }
    });

    mapa.addLayer(cluster);
    clusterRef.current = cluster;
  }, [stats]);

  return (
    <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM}
      className="leaflet-mapa-bg" zoomControl={false} dragging={false}
      scrollWheelZoom={false} doubleClickZoom={false} attributionControl={false}
      ref={mapRef} whenReady={(m) => { mapRef.current = m.target; }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={19} />
    </MapContainer>
  );
}

export default MapBackground;
