const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

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

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('API Proxy Error:', err.message);
    res.status(502).json({
      error: 'API service unavailable',
      message: 'The API service is not responding. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Proxy server is running',
    timestamp: new Date().toISOString(),
    services: {
      proxy: 'OK',
      frontend: 'http://localhost:5173',
      api: 'http://localhost:3000'
    }
  });
});

// API health check proxy
app.get('/api/health', createProxyMiddleware({
  target: 'http://localhost:3000/api/health',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('API Health Check Error:', err.message);
    res.status(502).json({
      status: 'ERROR',
      message: 'API service unavailable',
      timestamp: new Date().toISOString()
    });
  }
}));

// Proxy all other requests to frontend
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  onError: (err, req, res) => {
    console.error('Frontend Proxy Error:', err.message);
    res.status(502).send(`
      <html>
        <head><title>Service Unavailable</title></head>
        <body>
          <h1>Service Temporarily Unavailable</h1>
          <p>The application is starting up. Please refresh in a few moments.</p>
          <p>Error: ${err.message}</p>
        </body>
      </html>
    `);
  }
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`🌐 External access: http://wmxkwzbmhlj.sealoshzh.site`);
  console.log(`📱 Frontend: http://localhost:5173`);
  console.log(`📡 API: http://localhost:3000`);
  console.log(`💡 Routing:`)
  console.log(`   - /api/* -> Backend API (port 3000)`);
  console.log(`   - /health -> API Health Check`);
  console.log(`   - /* -> Frontend App (port 5173)`);
}); 