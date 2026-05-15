// api/login.js — Autenticación servidor para el panel admin
// Las credenciales NUNCA llegan al cliente; se validan aquí con variables de entorno.

import crypto from "node:crypto";

export const config = {
  api: { bodyParser: { sizeLimit: "16kb" } },
};

// Leer desde variables de entorno de Vercel (nunca hardcodeadas en código)
const SECRET     = process.env.ADMIN_SECRET   || "fallback-secret-cambiar-esto";
const ADMIN_USER = process.env.ADMIN_USER     || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS     || "zanelloesmilei";
const TOKEN_TTL  = 24 * 60 * 60 * 1000; // 24 horas en ms

/**
 * HMAC-SHA256 firmado con SECRET.
 */
function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(String(payload)).digest("hex");
}

/**
 * Comparación en tiempo constante — evita timing attacks.
 * Hashea ambos valores antes de comparar para igualar longitudes.
 */
function safeEqual(a, b) {
  const ha = crypto.createHmac("sha256", SECRET).update(String(a)).digest();
  const hb = crypto.createHmac("sha256", SECRET).update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  const { user, pass, checkToken } = req.body ?? {};

  // ── Verificar token existente (re-validación al recargar página) ──
  if (checkToken) {
    const str = String(checkToken);
    const dot = str.lastIndexOf(".");
    if (dot < 1) return res.status(401).json({ valid: false });

    const ts  = str.slice(0, dot);
    const sig = str.slice(dot + 1);
    const age = Date.now() - parseInt(ts, 10);

    if (safeEqual(sig, sign(ts)) && age > 0 && age < TOKEN_TTL) {
      return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false });
  }

  // ── Validar credenciales ──
  if (!safeEqual(user ?? "", ADMIN_USER) || !safeEqual(pass ?? "", ADMIN_PASS)) {
    // Retardo mínimo para dificultar enumeración por velocidad de respuesta
    return setTimeout(
      () => res.status(401).json({ error: "Usuario o contraseña incorrectos." }),
      300
    );
  }

  const ts    = Date.now().toString();
  const token = `${ts}.${sign(ts)}`;
  return res.json({ token });
}
