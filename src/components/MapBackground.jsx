// =============================================================
// MapBackground.jsx — Mapa como fondo fullscreen
// Versión simplificada del MapView para ser el background de la app
// =============================================================
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { GOOGLE_SCRIPT_URL, MAP_CENTER, MAP_ZOOM } from "../config/api";
import BARRIOS from "../config/barrios";

function MapBackground() {
  const [denuncias, setDenuncias] = useState([]);
  const mapRef = useRef(null);
  const clusterRef = useRef(null);

  // --- Cargar denuncias desde Google Sheet ---
  useEffect(() => {
    const cargarDenuncias = async () => {
      try {
        const url = `${GOOGLE_SCRIPT_URL}?accion=listar_publico`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data && data.denuncias) {
          setDenuncias(data.denuncias);
        }
      } catch (err) {
        console.error("Error cargando denuncias para background:", err);
      }
    };

    cargarDenuncias();

    // Recargar denuncias cada 30 segundos para mantener actualizado
    const interval = setInterval(cargarDenuncias, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- Crear capa de cluster cuando el mapa y los datos estén listos ---
  useEffect(() => {
    const mapa = mapRef.current;
    if (!mapa) return;

    // Limpiar cluster anterior si existe
    if (clusterRef.current) {
      mapa.removeLayer(clusterRef.current);
    }

    if (denuncias.length === 0) return;

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      iconCreateFunction: (clusterObj) => {
        const count = clusterObj.getChildCount();
        let size = "small";
        let bgColor = "#7B2CBF"; // violeta principal
        
        if (count > 10) {
          size = "medium";
          bgColor = "#9D4EDD"; // violeta claro
        }
        if (count > 30) {
          size = "large";
          bgColor = "#5A1F8E"; // violeta oscuro
        }

        return L.divIcon({
          html: `<div class="cluster-icon cluster-${size}" style="background: ${bgColor};">${count}</div>`,
          className: "custom-cluster",
          iconSize: L.point(40, 40),
        });
      },
    });

    denuncias.forEach((d) => {
      let latitud = parseFloat(d.lat);
      let longitud = parseFloat(d.lng);

      if (isNaN(latitud) || isNaN(longitud)) {
        const barrioInfo = BARRIOS.find((b) => b.nombre === d.barrio);
        if (barrioInfo) {
          latitud = barrioInfo.lat + (Math.random() - 0.5) * 0.005;
          longitud = barrioInfo.lng + (Math.random() - 0.5) * 0.005;
        } else {
          return;
        }
      }

      // Marcador violeta (acentuación)
      const marker = L.circleMarker([latitud, longitud], {
        radius: 8,
        fillColor: "#7B2CBF",
        color: "#5A1F8E",
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7,
      });

      marker.bindPopup(`<strong>Denuncias:</strong> ${sanitizarTexto(d.barrio)}`);
      cluster.addLayer(marker);
    });

    mapa.addLayer(cluster);
    clusterRef.current = cluster;
  }, [denuncias]);

  const sanitizarTexto = (texto) => {
    const div = document.createElement("div");
    div.textContent = texto || "";
    return div.innerHTML;
  };

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      className="leaflet-mapa-fondo"
      ref={mapRef}
      zoomControl={false}
      attributionControl={true}
      whenReady={(mapInstance) => {
        mapRef.current = mapInstance.target;
      }}
    >
      {/* TileLayer oscuro: CartoDB Dark */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />
    </MapContainer>
  );
}

export default MapBackground;
