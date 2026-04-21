// Dashboard.jsx — Panel de admin con datos completos
import React, { useState, useEffect, useCallback } from "react";

function Dashboard({ user, idToken, scriptUrl, onLogout }) {
  const [denuncias, setDenuncias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [filtroBarrio, setFiltroBarrio] = useState("");
  const [fotoModal, setFotoModal] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const url = `${scriptUrl}?accion=listar_admin&token=${encodeURIComponent(idToken)}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data.error) {
        setError(data.error);
        // Si el token es inválido, cerrar sesión
        if (data.error.includes("inválido") || data.error.includes("expirado") || data.error.includes("no autorizado")) {
          onLogout();
        }
      } else if (data.denuncias) {
        setDenuncias(data.denuncias);
      }
    } catch (err) {
      console.error("Error cargando:", err);
      setError("Error de conexión al cargar denuncias.");
    } finally {
      setCargando(false);
    }
  }, [scriptUrl, idToken, onLogout]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtradas = filtroBarrio
    ? denuncias.filter((d) => d.barrio === filtroBarrio)
    : denuncias;

  const barrios = [...new Set(denuncias.map((d) => d.barrio))].sort();

  const formatFecha = (f) => {
    if (!f) return "—";
    try {
      const d = new Date(f);
      return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
        + " " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    } catch (_) { return String(f); }
  };

  // Exportar CSV
  const exportarCSV = () => {
    const header = "Fecha,Barrio,Denuncia,Lat,Lng,Foto\n";
    const rows = filtradas.map((d) =>
      [d.fecha, d.barrio, `"${(d.denuncia || "").replace(/"/g, '""')}"`, d.lat, d.lng, d.foto].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `denuncias_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>📋 Panel de Administración</h1>
        </div>
        <div className="admin-header-right">
          <div className="admin-user">
            {user.picture && <img src={user.picture} alt="" className="admin-avatar" referrerPolicy="no-referrer" />}
            <span>{user.email}</span>
          </div>
          <button onClick={onLogout} className="btn-logout">Cerrar sesión</button>
        </div>
      </header>

      {/* Controls */}
      <div className="admin-controls">
        <button onClick={cargar} className="btn-action" disabled={cargando}>
          🔄 {cargando ? "Cargando..." : "Recargar"}
        </button>
        <select value={filtroBarrio} onChange={(e) => setFiltroBarrio(e.target.value)} className="select-barrio">
          <option value="">Todos los barrios</option>
          {barrios.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <button onClick={exportarCSV} className="btn-action" disabled={filtradas.length === 0}>
          📥 Exportar CSV
        </button>
        <span className="admin-count">
          {filtradas.length} de {denuncias.length} denuncias
        </span>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Table */}
      {filtradas.length > 0 && (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Barrio</th>
                <th>Denuncia</th>
                <th>Foto</th>
                <th>Coordenadas</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="td-fecha">{formatFecha(d.fecha)}</td>
                  <td>{d.barrio}</td>
                  <td className="td-denuncia">{d.denuncia}</td>
                  <td>
                    {d.foto ? (
                      <button className="btn-foto" onClick={() => setFotoModal(d.foto)}>
                        🖼️ Ver
                      </button>
                    ) : "—"}
                  </td>
                  <td className="td-coords">
                    {d.lat && d.lng ? (
                      <>
                        {parseFloat(d.lat).toFixed(4)}, {parseFloat(d.lng).toFixed(4)}
                        <br />
                        <a href={`https://www.google.com/maps?q=${d.lat},${d.lng}`}
                          target="_blank" rel="noopener noreferrer" className="link-maps">
                          📍 Maps
                        </a>
                      </>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && filtradas.length === 0 && !error && (
        <p className="admin-empty">No hay denuncias para mostrar.</p>
      )}

      {/* Modal de foto */}
      {fotoModal && (
        <div className="modal-overlay" onClick={() => setFotoModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setFotoModal(null)}>✕</button>
            <img src={fotoModal} alt="Foto denuncia" className="modal-img" />
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
