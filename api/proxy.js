// Vercel Serverless Function - Proxy para Google Apps Script
// Evita problemas de CORS llamando a GAS desde el servidor

const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || 
  "https://script.google.com/macros/s/AKfycbzGU_lTtBTRB_u-13kqz2y7Ngy20HcAp7lMuNEdxsz03SqaG4BngkqZ6hhM9b93PlFehQ/exec";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const method = req.method;
    const body = req.method === 'POST' ? req.body : null;
    const query = req.query;

    // Para desarrollo/pruebas: si el token es "test-token-development",
    // simular un éxito en lugar de validar realmente
    if (method === 'POST' && body && body.captchaToken === 'test-token-development') {
      // Reemplazar el token con un string vacío para que Google Apps Script lo omita
      body.captchaToken = '';
      console.log('Test token detected - removing CAPTCHA token for testing');
    }

    // Construir URL con parámetros si es GET
    let url = GOOGLE_SCRIPT_URL;
    if (method === 'GET' && query.accion) {
      const params = new URLSearchParams();
      Object.keys(query).forEach(key => {
        params.append(key, query[key]);
      });
      url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    }

    // Hacer fetch a Google Apps Script
    const fetchOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    if (method === 'POST' && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`Google Apps Script responded with status ${response.status}`);
    }

    const data = await response.json();
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Error al conectar con el servidor',
      details: error.message,
    });
  }
}
