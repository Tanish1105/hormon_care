/**
 * iOS debug proxy: phone cannot send Cookie headers, so this
 * copies Authorization: Bearer <jwt> onto Cookie: session=<jwt>
 * and forwards to the live server.
 */
import http from 'node:http';

const TARGET = 'https://hormoncare.mediiqr.com';
const PORT = Number(process.env.IOS_API_PROXY_PORT || 3002);

const server = http.createServer(async (req, res) => {
  try {
    console.log(`[ios-api-proxy] ${req.method} ${req.url}`);
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value == null) continue;
      const lower = key.toLowerCase();
      if (['host', 'connection', 'content-length', 'accept-encoding'].includes(lower)) {
        continue;
      }
      headers[key] = Array.isArray(value) ? value.join(', ') : value;
    }

    const auth = typeof headers.authorization === 'string' ? headers.authorization : '';
    if (auth.toLowerCase().startsWith('bearer ')) {
      headers.cookie = `session=${auth.slice(7).trim()}`;
    }

    const upstream = await fetch(`${TARGET}${req.url}`, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
      redirect: 'manual',
    });

    const outHeaders = {};
    upstream.headers.forEach((value, key) => {
      if (['transfer-encoding', 'connection', 'content-encoding'].includes(key)) {
        return;
      }
      outHeaders[key] = value;
    });

    res.writeHead(upstream.status, outHeaders);
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    res.writeHead(502, { 'content-type': 'text/plain' });
    res.end(error instanceof Error ? error.message : String(error));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`iOS API proxy listening on http://0.0.0.0:${PORT} -> ${TARGET}`);
});
