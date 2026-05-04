const fs = require('fs');
const https = require('https');

// Use environment variables instead of hardcoded secrets
const SCRIPT_ID = process.env.GOOGLE_SCRIPT_ID;
const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN;

if (!SCRIPT_ID || !ACCESS_TOKEN) {
  console.error('Error: Set GOOGLE_SCRIPT_ID and GOOGLE_ACCESS_TOKEN environment variables');
  process.exit(1);
}

const codeContent = fs.readFileSync('Code.gs', 'utf-8');
const manifestContent = fs.readFileSync('appsscript.json', 'utf-8');
const payload = JSON.stringify({
  files: [
    {
      name: 'appsscript',
      source: manifestContent,
      type: 'JSON'
    },
    {
      name: 'Code',
      source: codeContent,
      type: 'SERVER_JS'
    }
  ]
});

const options = {
  hostname: 'script.googleapis.com',
  port: 443,
  path: `/v1/projects/${SCRIPT_ID}/content`,
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('Desplegando Code.gs a Google Apps Script...');
console.log(`Script ID: ${SCRIPT_ID}`);
console.log(`Tamaño del código: ${Buffer.byteLength(codeContent)} bytes`);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`\nStatus: ${res.statusCode}`);
    if (data) {
      try {
        console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
      } catch (e) {
        console.log('Response:', data.substring(0, 500));
      }
    }
    if (res.statusCode === 200) {
      console.log('\n✅ Deploy exitoso!');
      process.exit(0);
    } else {
      console.log('\n❌ Error en el deploy');
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

req.write(payload);
req.end();
