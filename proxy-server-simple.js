const express = require('express');
const http = require('http');
const { URL } = require('url');

const app = express();
const PORT = process.env.PROXY_PORT || 8080;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '1728000');
    res.header('Content-Type', 'text/plain charset=UTF-8');
    res.header('Content-Length', '0');
    return res.status(204).end();
  }
  
  next();
});

// Simple proxy function
function proxyRequest(targetUrl, req, res) {
  const url = new URL(req.url, targetUrl);
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: url.host
    }
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(502).json({
      error: 'Proxy error',
      message: 'Unable to reach target service',
      timestamp: new Date().toISOString()
    });
  });

  req.pipe(proxy, { end: true });
}

// Health check endpoint for proxy itself
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Simple proxy server is running',
    timestamp: new Date().toISOString(),
    services: {
      proxy: 'OK',
      frontend: 'http://localhost:5173',
      api: 'http://localhost:3000'
    }
  });
});

// API proxy - must come before frontend proxy
app.use('/api', (req, res) => {
  // Reconstruct the full API path
  const apiPath = `/api${req.url}`;
  const targetUrl = `http://localhost:3000${apiPath}`;
  console.log(`Proxying API request: ${req.method} /api${req.url} -> ${targetUrl}`);
  
  // Modify req.url to include /api prefix for the target
  const originalUrl = req.url;
  req.url = apiPath;
  proxyRequest('http://localhost:3000', req, res);
  req.url = originalUrl; // restore original url
});

// Frontend proxy - catch all other routes
app.use('/', (req, res) => {
  console.log(`Proxying frontend request: ${req.method} ${req.url} -> http://localhost:5173${req.url}`);
  proxyRequest('http://localhost:5173', req, res);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple proxy server running on port ${PORT}`);
  console.log(`🌐 External access: https://wmxkwzbmhflj.sealoshzh.site`);
  console.log(`📱 Frontend: http://localhost:5173`);
  console.log(`📡 API: http://localhost:3000`);
  console.log(`💡 Routing:`);
  console.log(`   - /api/* -> Backend API (port 3000)`);
  console.log(`   - /health -> Proxy Health Check`);
  console.log(`   - /* -> Frontend App (port 5173)`);
}); 