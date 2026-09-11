#!/usr/bin/env node

/**
 * ==============================================================================
 * HERRAMIENTA CLI: EJECUTOR DIRECTO DE SQL EN SUPABASE CLOUD
 * ==============================================================================
 * Lee las credenciales de forma segura desde .env.local o .agents/mcp_config.json
 * para ejecutar consultas SQL y migraciones sin exponer secretos en el código.
 * 
 * Uso:
 *   node scripts/db-execute.js "SELECT * FROM todos LIMIT 5;"
 *   node scripts/db-execute.js --file supabase/migrations/mi_migracion.sql
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Función para cargar variables de .env.local de forma segura
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[2] || '';
        val = val.trim().replace(/^['"]|['"]$/g, '');
        env[match[1]] = val;
      }
    }
  }
  return env;
}

// Función para extraer token de .agents/mcp_config.json si existe
function loadMcpToken() {
  const mcpPath = path.resolve(process.cwd(), '.agents/mcp_config.json');
  if (fs.existsSync(mcpPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
      if (config.mcpServers?.supabase?.env?.SUPABASE_ACCESS_TOKEN) {
        return config.mcpServers.supabase.env.SUPABASE_ACCESS_TOKEN;
      }
    } catch {}
  }
  return null;
}

const envVars = loadEnvLocal();
const token = process.env.SUPABASE_ACCESS_TOKEN || envVars.SUPABASE_ACCESS_TOKEN || loadMcpToken();

// Extraer el projectRef desde la URL de Supabase (ej: https://iayicsanzcbiarefjere.supabase.co -> iayicsanzcbiarefjere)
let projectRef = process.env.SUPABASE_PROJECT_REF || envVars.SUPABASE_PROJECT_REF;
if (!projectRef && envVars.NEXT_PUBLIC_SUPABASE_URL) {
  const match = envVars.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (match) {
    projectRef = match[1];
  }
}

if (!token || !projectRef) {
  console.error('❌ Error: No se encontró SUPABASE_ACCESS_TOKEN o NEXT_PUBLIC_SUPABASE_URL en .env.local.');
  process.exit(1);
}

const args = process.argv.slice(2);
let query = '';

if (args[0] === '--file' && args[1]) {
  const filePath = path.resolve(process.cwd(), args[1]);
  query = fs.readFileSync(filePath, 'utf-8');
} else if (args.length > 0) {
  query = args.join(' ');
} else {
  console.error('Uso: node scripts/db-execute.js "<QUERY_SQL>" o --file <RUTA_ARCHIVO>');
  process.exit(1);
}

const postData = JSON.stringify({ query });

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Consulta SQL ejecutada exitosamente en Supabase:');
      try {
        const parsed = JSON.parse(data);
        console.table(parsed);
      } catch {
        console.log(data);
      }
    } else {
      console.error(`❌ Error (${res.statusCode}):`, data);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error de red:', e.message);
  process.exit(1);
});

req.write(postData);
req.end();
