// Dashboard.jsx — Panel admin con sort, fotos embebidas, coords corregidas y auditoría
import React, { useState, useEffect, useCallback } from "react";

// Convierte URL de Drive viewer al formato de imagen directa embebible
function getDriveImageUrl(url) {
  if (!url) return null;
  // Ya está en formato uc?id=
  if (url.includes("drive.google.com/uc")) return url;
  // Formato viewer: /file/d/FILE_ID/view
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?id=${match[1]}&export=view`;
  // lh3 CDN — ya es directo
  if (url.includes("lh3.googleusercontent.com")) return url;
  return url;
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <span className="sort-icon sort-none">⇅</span>;
  return <span className="sort-icon">{sortDir === "asc" ? "↑" : "↓"}</span>;
}

function Dashboard({ scriptUrl, apiKey }) {
  const [denuncias, setDenuncias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [filtroBarrio, setFiltroBarrio] = useState("");
  const [fotoModal, setFotoModal] = useState(null);
  const [sortField, setSortField] = useState("fecha");
  const [sortDir, setSortDir] = useState("desc");
  const [auditoria, setAuditoria] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    const inicio = Date.now();
    try {
      const url = `${scriptUrl}?accion=listar_admin&apiKey=${encodeURIComponent(apiKey)}`;
      const resp = await fetch(url);
      const data = await resp.json();
      const ms = Date.now() - inicio;

      if (data.error) {
        setError(data.error);
        setAuditoria({ estado: "error", errorMsg: data.error, ms, scriptUrl: !!scriptUrl, apiKey: !!apiKey });
      } else if (data.denuncias) {
        setDenuncias(data.denuncias);
        const conFoto = data.denuncias.filter((d) => d.foto).length;
        const conCoords = data.denuncias.filter((d) => d.lat && d.lng).length;
        const conContacto = data.denuncias.filter((d) => d.contacto).length;
        setAuditoria({
          estado: "ok", ms,
          total: data.denuncias.length,
          conFoto, conCoords, conContacto,
          scriptUrl: !!scriptUrl, apiKey: !!apiKey,
        });
      }
    } catch (err) {
      const ms = Date.now() - inicio;
      setError("Error de conexión al cargar denuncias.");
      setAuditoria({ estado: "error", errorMsg: err.message, ms, scriptUrl: !!scriptUrl, apiKey: !!apiKey });
    } finally {
      setCargando(false);
    }
  }, [scriptUrl, apiKey]);

  useEffect(() => {
    setAuditoria({ estado: "cargando", scriptUrl: !!scriptUrl, apiKey: !!apiKey });
    cargar();
  }, [cargar]);

  // Filtrar
  const filtradas = filtroBarrio
    ? denuncias.filter((d) => d.barrio === filtroBarrio)
    : denuncias;

  // Ordenar
  const sorted = [...filtradas].sort((a, b) => {
    let va = a[sortField] ?? "";
    let vb = b[sortField] ?? "";
    if (sortField === "fecha") {
      const ta = new Date(va).getTime() || 0;
      const tb = new Date(vb).getTime() || 0;
      return sortDir === "asc" ? ta - tb : tb - ta;
    }
    va = String(va).toLowerCase();
    vb = String(vb).toLowerCase();
    return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const barrios = [...new Set(denuncias.map((d) => d.barrio))].sort();

  const formatFecha = (f) => {
    if (!f) return "—";
    try {
      const d = new Date(f);
      return (
        d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
        " " +
        d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      );
    } catch (_) { return String(f); }
  };

  const exportarCSV = () => {
    const header = "Fecha,Barrio,Denuncia,Lat,Lng,Foto,Contacto,Ubicacion\n";
    const rows = sorted.map((d) =>
      [
        d.fecha, d.barrio,
        `"${(d.denuncia || "").replace(/"/g, '""')}"`,
        d.lat, d.lng, d.foto, d.contacto,
        `"${(d.ubicacionTexto || "").replace(/"/g, '""')}"`,
      ].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `denuncias_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Columna con sort clickeable
  const Th = ({ field, children }) => (
    <th
      className={`th-sortable${sortField === field ? " th-active" : ""}`}
      onClick={() => handleSort(field)}
    >
      {children} <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
    </th>
  );

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>📋 Panel de Administración</h1>
        </div>
        <div className="admin-header-right">
          <span className="admin-system-label">Denuncias Santiago Capital</span>
        </div>
      </header>

      {/* Auditoría en pantalla */}
      {auditoria && (
        <div className="audit-panel">
          <span className="audit-title">🔍 Estado del sistema</span>
          <span className={`audit-badge ${auditoria.scriptUrl ? "badge-ok" : "badge-fail"}`}>
            {auditoria.scriptUrl ? "✅" : "❌"} Script URL
          </span>
          <span className={`audit-badge ${auditoria.apiKey ? "badge-ok" : "badge-fail"}`}>
            {auditoria.apiKey ? "✅" : "❌"} API Key
          </span>
          <span className={`audit-badge ${auditoria.estado === "ok" ? "badge-ok" : auditoria.estado === "cargando" ? "badge-warn" : "badge-fail"}`}>
            {auditoria.estado === "ok" ? "✅" : auditoria.estado === "cargando" ? "⏳" : "❌"} Conexión
            {auditoria.ms ? ` (${auditoria.ms}ms)` : ""}
          </span>
          {auditoria.estado === "ok" && (
            <>
              <span className="audit-badge badge-ok">📄 {auditoria.total} registros</span>
              <span className={`audit-badge ${auditoria.conFoto > 0 ? "badge-ok" : "badge-warn"}`}>
                🖼️ {auditoria.conFoto} con foto
              </span>
              <span className={`audit-badge ${auditoria.conCoords > 0 ? "badge-ok" : "badge-warn"}`}>
                📍 {auditoria.conCoords} con coords
              </span>
              {auditoria.conContacto > 0 && (
                <span className="audit-badge badge-ok">📞 {auditoria.conContacto} con contacto</span>
              )}
            </>
          )}
          {auditoria.errorMsg && (
            <span className="audit-badge badge-fail" title={auditoria.errorMsg}>
              ⚠️ {auditoria.errorMsg.substring(0, 80)}
            </span>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="admin-controls">
        <button onClick={cargar} className="btn-action" disabled={cargando}>
          🔄 {cargando ? "Cargando..." : "Recargar"}
        </button>
        <select value={filtroBarrio} onChange={(e) => setFiltroBarrio(e.target.value)} className="select-barrio">
          <option value="">Todos los barrios</option>
          {barrios.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <button onClick={exportarCSV} className="btn-action" disabled={sorted.length === 0}>
          📥 Exportar CSV
        </button>
        <span className="admin-count">
          {sorted.length} de {denuncias.length} denuncias
        </span>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Tabla */}
      {sorted.length > 0 && (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <Th field="fecha">Fecha</Th>
                <Th field="barrio">Barrio</Th>
                <Th field="denuncia">Denuncia</Th>
                <th>Foto</th>
                <th>Coordenadas</th>
                <Th field="contacto">Contacto</Th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d, i) => {
                const imgUrl = getDriveImageUrl(d.foto);
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="td-fecha">{formatFecha(d.fecha)}</td>
                    <td>{d.barrio}</td>
                    <td className="td-denuncia">{d.denuncia}</td>
                    <td className="td-foto">
                      {imgUrl ? (
                        <div className="foto-thumb-wrap" onClick={() => setFotoModal(imgUrl)}>
                          <img
                            src={imgUrl}
                            alt="Foto"
                            className="foto-thumb"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextSibling.style.display = "inline-flex";
                            }}
                          />
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-foto"
                            style={{ display: "none" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            🔗 Abrir
                          </a>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="td-coords">
                      {d.lat && d.lng ? (
                        <>
                          {parseFloat(d.lat).toFixed(5)}, {parseFloat(d.lng).toFixed(5)}
                          <br />
                          <a
                            href={`https://www.google.com/maps/@${parseFloat(d.lat).toFixed(5)},${parseFloat(d.lng).toFixed(5)},15z`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-maps"
                          >
                            📍 Ver en Maps
                          </a>
                        </>
                      ) : "—"}
                    </td>
                    <td>{d.contacto || "—"}</td>
                    <td className="td-ubicacion">{d.ubicacionTexto || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && sorted.length === 0 && !error && (
        <p className="admin-empty">No hay denuncias para mostrar.</p>
      )}

      {/* Modal foto */}
      {fotoModal && (
        <div className="modal-overlay" onClick={() => setFotoModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setFotoModal(null)}>✕</button>
            <img
              src={fotoModal}
              alt="Foto denuncia"
              className="modal-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.insertAdjacentHTML(
                  "afterend",
                  `<p class="modal-img-error">No se pudo cargar la imagen.<br/><a href="${fotoModal}" target="_blank" rel="noopener noreferrer">Abrir en Drive →</a></p>`
                );
              }}
            />
            <a href={fotoModal} target="_blank" rel="noopener noreferrer" className="modal-link">
              Abrir en nueva pestaña
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
