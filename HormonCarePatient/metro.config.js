const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const PRODUCTION_API = 'https://hormoncare.mediiqr.com';
const PROXY_PREFIX = '/__jeevanm';

function createApiProxyMiddleware(middleware) {
  return (req, res, next) => {
    if (!req.url.startsWith(PROXY_PREFIX)) {
      return middleware(req, res, next);
    }

    const path = req.url.slice(PROXY_PREFIX.length) || '/';
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const body = Buffer.concat(chunks);
        const headers = {};
        for (const [key, value] of Object.entries(req.headers)) {
          if (value == null) continue;
          const lower = key.toLowerCase();
          if (
            [
              'host',
              'connection',
              'content-length',
              'accept-encoding',
              'transfer-encoding',
            ].includes(lower)
          ) {
            continue;
          }
          headers[key] = Array.isArray(value) ? value.join(', ') : value;
        }

        const auth =
          typeof headers.authorization === 'string' ? headers.authorization : '';
        const headerToken =
          typeof headers['x-session-token'] === 'string'
            ? headers['x-session-token'].trim()
            : '';
        if (auth.toLowerCase().startsWith('bearer ')) {
          headers.cookie = `session=${auth.slice(7).trim()}`;
        } else if (headerToken) {
          headers.cookie = `session=${headerToken}`;
        }

        const upstream = await fetch(`${PRODUCTION_API}${path}`, {
          method: req.method,
          headers,
          body:
            req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
          redirect: 'manual',
        });

        res.statusCode = upstream.status;
        upstream.headers.forEach((value, key) => {
          if (
            ['transfer-encoding', 'connection', 'content-encoding'].includes(
              key,
            )
          ) {
            return;
          }
          res.setHeader(key, value);
        });
        res.end(Buffer.from(await upstream.arrayBuffer()));
      } catch (error) {
        res.statusCode = 502;
        res.setHeader('content-type', 'text/plain');
        res.end(error instanceof Error ? error.message : String(error));
      }
    });
  };
}

/**
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    enhanceMiddleware: middleware => createApiProxyMiddleware(middleware),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
