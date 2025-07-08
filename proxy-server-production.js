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
    message: 'Production proxy server is running',
    timestamp: new Date().toISOString(),
    services: {
      proxy: 'OK',
      frontend: 'static files',
      api: 'http://localhost:3000'
    }
  });
});

// Static files from frontend build
const frontendDistPath = path.join(__dirname, 'timee-frontend/apps/web/dist');
console.log(`📁 Serving static files from: ${frontendDistPath}`);

// Serve static files with proper caching
app.use(express.static(frontendDistPath, {
  maxAge: '1d', // Cache static assets for 1 day
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache'); // Don't cache HTML files
    }
  }
}));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production proxy server running on port ${PORT}`);
  console.log(`🌐 External access: https://wmxkwzbmhflj.sealoshzh.site`);
  console.log(`📁 Frontend: Static files from ${frontendDistPath}`);
  console.log(`📡 API: http://localhost:3000`);
  console.log(`💡 Routing:`)
  console.log(`   - /api/* -> Backend API (port 3000)`);
  console.log(`   - /health -> Proxy Health Check`);
  console.log(`   - /* -> Static Frontend Files`);
}); 