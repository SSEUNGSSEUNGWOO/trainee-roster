import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const value = t.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/trainees') {
      req.body = req.method === 'PATCH' ? await parseBody(req) : {};
      const apiRes = {
        setHeader(key, value) {
          res.setHeader(key, value);
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(body) {
          sendJson(res, this.statusCode || 200, body);
        },
      };
      await handler(req, apiRes);
      return;
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
});

const port = Number(process.env.PORT || 3000);
const { default: handler } = await import('../api/trainees.js');
server.listen(port, '127.0.0.1');
