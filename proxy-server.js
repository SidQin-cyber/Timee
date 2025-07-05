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

// 增强的错误处理函数
const handleProxyError = (serviceName, targetUrl) => (err, req, res) => {
  console.error(`${serviceName} Proxy Error:`, {
    error: err.message,
    code: err.code,
    target: targetUrl,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // 如果响应已经发送，不要再发送
  if (res.headersSent) {
    return;
  }
  
  // 根据错误类型返回不同的错误信息
  if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
    res.status(503).json({
      error: 'Service Unavailable',
      message: `${serviceName} is temporarily unavailable. Please try again in a few moments.`,
      code: err.code,
      timestamp: new Date().toISOString(),
      retryAfter: 10
    });
  } else if (err.code === 'ETIMEDOUT') {
    res.status(504).json({
      error: 'Gateway Timeout',
      message: `${serviceName} is taking too long to respond.`,
      code: err.code,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(502).json({
      error: 'Bad Gateway',
      message: `Unable to connect to ${serviceName}.`,
      code: err.code,
      timestamp: new Date().toISOString()
    });
  }
};

// 增强的代理配置
const createEnhancedProxy = (target, serviceName, options = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    timeout: 30000, // 30秒超时
    proxyTimeout: 30000,
    ...options,
    onError: handleProxyError(serviceName, target),
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[${serviceName}] ${req.method} ${req.path} -> ${target}${req.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[${serviceName}] ${req.method} ${req.path} <- ${proxyRes.statusCode}`);
    }
  });
};

// Proxy API requests to backend
app.use('/api', createEnhancedProxy('http://localhost:3000', 'Backend API', {
  pathRewrite: {
    '^/api': '/api'  // Keep the /api prefix
  }
}));

// Simple HTTP check function
const checkService = (url) => {
  return new Promise((resolve) => {
    const http = require('http');
    const request = http.get(url, { timeout: 5000 }, (response) => {
      resolve(response.statusCode >= 200 && response.statusCode < 400);
    });
    
    request.on('error', () => resolve(false));
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
  });
};

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'OK',
    message: 'Proxy server is running',
    timestamp: new Date().toISOString(),
    services: {
      proxy: 'OK'
    }
  };
  
  // Check backend health
  try {
    const backendOk = await checkService('http://localhost:3000/api/health');
    healthStatus.services.backend = backendOk ? 'OK' : 'ERROR';
    healthStatus.services.backendUrl = 'http://localhost:3000';
  } catch (error) {
    healthStatus.services.backend = 'ERROR';
    healthStatus.services.backendError = error.message;
  }
  
  // Check frontend health
  try {
    const frontendOk = await checkService('http://localhost:5173');
    healthStatus.services.frontend = frontendOk ? 'OK' : 'ERROR';
    healthStatus.services.frontendUrl = 'http://localhost:5173';
  } catch (error) {
    healthStatus.services.frontend = 'ERROR';
    healthStatus.services.frontendError = error.message;
  }
  
  // Determine overall status
  const allServicesOk = Object.values(healthStatus.services).every(
    status => status === 'OK' || typeof status === 'string' && status.includes('http')
  );
  
  if (!allServicesOk) {
    healthStatus.status = 'DEGRADED';
    healthStatus.message = 'Some services are not responding';
  }
  
  res.status(allServicesOk ? 200 : 503).json(healthStatus);
});

// Proxy all other requests to frontend
app.use('/', createEnhancedProxy('http://localhost:5173', 'Frontend App', {
  ws: true, // Enable WebSocket proxying
}));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    });
  }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`🌐 External access: https://wmxkwzbmhflj.sealoshzh.site`);
  console.log(`📱 Frontend: http://localhost:5173`);
  console.log(`📡 API: http://localhost:3000`);
  console.log(`💡 Routing:`);
  console.log(`   - /api/* -> Backend API (port 3000)`);
  console.log(`   - /health -> Enhanced Health Check`);
  console.log(`   - /* -> Frontend App (port 5173)`);
  console.log(`🔧 Enhanced error handling and retry logic enabled`);
});

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
}); 