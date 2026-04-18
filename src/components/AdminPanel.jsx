// =============================================================
// AdminPanel.jsx — Panel de administración protegido
// Los administradores pueden ver TODAS las denuncias con detalles.
// Protegido por contraseña simple (del lado del cliente).
// =============================================================
import React, { useState } from "react";
import { GOOGLE_SCRIPT_URL, ADMIN_PASSWORD } from "../config/api";

function AdminPanel() {
  const [autenticado, setAutenticado] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorAuth, setErrorAuth] = useState("");

  const [denuncias, setDenuncias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [filtroBarrio, setFiltroBarrio] = useState("");
  
  // Estado para modal de foto
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);

  // --- Verificar contraseña ---
  const verificarPassword = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAutenticado(true);
      setErrorAuth("");
      cargarDenuncias();
    } else {
      setErrorAuth("Contraseña incorrecta.");
    }
  };

  // --- Cargar TODAS las denuncias (con detalles) ---
  const cargarDenuncias = async () => {
    setCargando(true);
    setError("");
    try {
      const url = `${GOOGLE_SCRIPT_URL}?accion=listar_admin&clave=${encodeURIComponent(ADMIN_PASSWORD)}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data && data.denuncias) {
        setDenuncias(data.denuncias);
      } else if (data && data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error("Error cargando denuncias admin:", err);
      setError("Error al cargar las denuncias.");
    } finally {
      setCargando(false);
    }
  };

  // --- Cerrar sesión ---
  const cerrarSesion = () => {
    setAutenticado(false);
    setPasswordInput("");
    setDenuncias([]);
  };

  // --- Filtrar denuncias por barrio ---
  const denunciasFiltradas = filtroBarrio
    ? denuncias.filter((d) => d.barrio === filtroBarrio)
    : denuncias;

  // Barrios únicos en los datos
  const barriosEnDatos = [...new Set(denuncias.map((d) => d.barrio))].sort();

  // --- Si no está autenticado, mostrar login ---
  if (!autenticado) {
    return (
      <div className="admin-container">
        <h2>🔒 Panel de Administración</h2>
        <p>Ingresá la contraseña para acceder a las denuncias.</p>
        <form onSubmit={verificarPassword} className="admin-login">
          <input
            type="password"
            placeholder="Contraseña"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-enviar">
            Ingresar
          </button>
        </form>
        {errorAuth && <p className="mensaje mensaje-error">{errorAuth}</p>}
      </div>
    );
  }

  // --- Panel autenticado ---
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>🔓 Panel de Administración</h2>
        <button onClick={cerrarSesion} className="btn-cerrar-sesion">
          Cerrar sesión
        </button>
      </div>

      <div className="admin-controles">
        <button onClick={cargarDenuncias} className="btn-geo" disabled={cargando}>
          🔄 Recargar datos
        </button>

        {/* Filtro por barrio */}
        <select
          value={filtroBarrio}
          onChange={(e) => setFiltroBarrio(e.target.value)}
        >
          <option value="">Todos los barrios</option>
          {barriosEnDatos.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <span className="admin-conteo">
          Mostrando {denunciasFiltradas.length} de {denuncias.length} denuncias
        </span>
      </div>

      {cargando && <p className="cargando">Cargando denuncias...</p>}
      {error && <p className="mensaje mensaje-error">{error}</p>}

      {/* Tabla de denuncias */}
      {denunciasFiltradas.length > 0 && (
        <div className="tabla-wrapper">
          <table className="tabla-denuncias">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Barrio</th>
                <th>Denuncia</th>
                <th>Foto</th>
                <th>Coordenadas Exactas</th>
              </tr>
            </thead>
            <tbody>
              {denunciasFiltradas.map((d, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="col-fecha">{formatearFecha(d.fecha)}</td>
                  <td>{d.barrio}</td>
                  <td className="col-denuncia">{d.denuncia}</td>
                  <td className="col-foto">
                    {d.foto ? (
                      <button
                        className="btn-ver-foto"
                        onClick={() => setFotoSeleccionada(d.foto)}
                        title="Ver foto"
                      >
                        🖼️ Ver foto
                      </button>
                    ) : (
                      <span className="sin-foto">Sin foto</span>
                    )}
                  </td>
                  <td className="col-ubicacion">
                    {d.lat && d.lng ? (
                      <>
                        <div className="coords-display">
                          <strong>Lat:</strong> {parseFloat(d.lat).toFixed(4)} | <strong>Lng:</strong> {parseFloat(d.lng).toFixed(4)}
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${d.lat},${d.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginTop: "0.5rem", display: "inline-block" }}
                        >
                          📍 Abrir en Google Maps
                        </a>
                      </>
                    ) : (
                      <span className="sin-ubicacion">Sin ubicación exacta</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de foto ampliada */}
      {fotoSeleccionada && (
        <div className="modal-foto" onClick={() => setFotoSeleccionada(null)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-cerrar-modal"
              onClick={() => setFotoSeleccionada(null)}
              title="Cerrar"
            >
              ✕
            </button>
            <img src={fotoSeleccionada} alt="Foto de denuncia" className="img-modal" />
            <a
              href={fotoSeleccionada}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-descargar-foto"
            >
              ⬇️ Descargar
            </a>
          </div>
        </div>
      )}

      {!cargando && denunciasFiltradas.length === 0 && !error && (
        <p className="sin-datos">No hay denuncias para mostrar.</p>
      )}
    </div>
  );
}

// Formatear fecha ISO a formato legible
function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";
  try {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fechaISO;
  }
}

export default AdminPanel;
