const { createLoggers, MetricsCollector, AlertManager, monitoringConfig } = require('../config/monitoring')

// 初始化监控组件
const loggers = createLoggers()
const metricsCollector = new MetricsCollector()
const alertManager = new AlertManager(loggers)

// HTTP请求监控中间件
function requestMonitoring(req, res, next) {
  const startTime = Date.now()
  const originalSend = res.send

  // 记录请求开始
  loggers.access.info({
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  }, `${req.method} ${req.url}`)

  // 拦截响应
  res.send = function(data) {
    const endTime = Date.now()
    const responseTime = endTime - startTime
    const statusCode = res.statusCode

    // 记录响应
    loggers.access.info({
      method: req.method,
      url: req.url,
      statusCode,
      responseTime,
      responseSize: data ? data.length : 0,
    }, `${req.method} ${req.url} ${statusCode} ${responseTime}ms`)

    // 收集指标
    metricsCollector.recordHttpRequest(req.method, req.url, statusCode, responseTime)

    // 性能告警
    if (responseTime > monitoringConfig.performance.slowRequestThreshold) {
      alertManager.sendAlert(
        monitoringConfig.alerts.types.PERFORMANCE,
        `Slow request detected: ${req.method} ${req.url} took ${responseTime}ms`,
        { method: req.method, url: req.url, responseTime, statusCode }
      )
    }

    // 错误告警
    if (statusCode >= 500) {
      alertManager.sendAlert(
        monitoringConfig.alerts.types.ERROR,
        `Server error: ${req.method} ${req.url} returned ${statusCode}`,
        { method: req.method, url: req.url, statusCode, responseTime }
      )
    }

    return originalSend.call(this, data)
  }

  next()
}

// 错误监控中间件
function errorMonitoring(err, req, res, next) {
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  }

  // 记录错误
  loggers.error.error(errorInfo, `Unhandled error: ${err.message}`)

  // 发送错误告警
  alertManager.sendAlert(
    monitoringConfig.alerts.types.ERROR,
    `Unhandled error in ${req.method} ${req.url}: ${err.message}`,
    errorInfo
  )

  // 返回错误响应
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    timestamp: new Date().toISOString(),
  })
}

// WebSocket监控
function websocketMonitoring(io) {
  let activeConnections = 0

  io.on('connection', (socket) => {
    activeConnections++
    metricsCollector.metrics.websocket.connections = activeConnections

    loggers.app.info({
      socketId: socket.id,
      activeConnections,
    }, 'WebSocket connection established')

    socket.on('disconnect', () => {
      activeConnections--
      metricsCollector.metrics.websocket.connections = activeConnections

      loggers.app.info({
        socketId: socket.id,
        activeConnections,
      }, 'WebSocket connection closed')
    })

    // 监控消息
    const originalEmit = socket.emit
    socket.emit = function(...args) {
      metricsCollector.metrics.websocket.messages++
      return originalEmit.apply(this, args)
    }
  })
}

// 系统指标监控
function startSystemMonitoring() {
  const interval = setInterval(() => {
    // 收集系统指标
    metricsCollector.recordSystemMetrics()
    const metrics = metricsCollector.getAllMetrics()

    // 记录性能指标
    loggers.performance.info({
      memory: metrics.system.memory,
      cpu: metrics.system.cpu,
      uptime: metrics.system.uptime,
      avgResponseTime: metrics.calculated.avgResponseTime,
      errorRate: metrics.calculated.errorRate,
    }, 'System metrics')

    // 内存使用告警
    if (metrics.calculated.memoryUsagePercent > monitoringConfig.alerts.thresholds.memoryUsage) {
      alertManager.sendAlert(
        monitoringConfig.alerts.types.SYSTEM,
        `High memory usage: ${(metrics.calculated.memoryUsagePercent * 100).toFixed(2)}%`,
        { memoryUsage: metrics.calculated.memoryUsagePercent, threshold: monitoringConfig.alerts.thresholds.memoryUsage }
      )
    }

    // 错误率告警
    if (metrics.calculated.errorRate > monitoringConfig.alerts.thresholds.errorRate) {
      alertManager.sendAlert(
        monitoringConfig.alerts.types.ERROR,
        `High error rate: ${(metrics.calculated.errorRate * 100).toFixed(2)}%`,
        { errorRate: metrics.calculated.errorRate, threshold: monitoringConfig.alerts.thresholds.errorRate }
      )
    }

  }, monitoringConfig.metrics.interval)

  // 优雅关闭时清理
  process.on('SIGTERM', () => {
    clearInterval(interval)
  })

  process.on('SIGINT', () => {
    clearInterval(interval)
  })
}

// 健康检查中间件
function healthCheck(req, res, next) {
  if (req.path === '/health') {
    const metrics = metricsCollector.getAllMetrics()
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: metrics.system.memory,
        usage: `${(metrics.calculated.memoryUsagePercent * 100).toFixed(2)}%`,
      },
      http: {
        requests: metrics.http.requests,
        errors: metrics.http.errors,
        errorRate: `${(metrics.calculated.errorRate * 100).toFixed(2)}%`,
        avgResponseTime: `${metrics.calculated.avgResponseTime.toFixed(2)}ms`,
      },
      websocket: {
        connections: metrics.websocket.connections,
        messages: metrics.websocket.messages,
      },
      business: metrics.business,
    }

    res.json(health)
    return
  }
  next()
}

// 指标端点中间件
function metricsEndpoint(req, res, next) {
  if (req.path === '/metrics') {
    const metrics = metricsCollector.getAllMetrics()
    res.json({
      success: true,
      data: metrics,
      alerts: alertManager.getAlertHistory(50),
    })
    return
  }
  next()
}

// 安全监控中间件
function securityMonitoring(req, res, next) {
  const suspiciousPatterns = [
    /\.\.\//,  // 路径遍历
    /<script/i, // XSS
    /union.*select/i, // SQL注入
    /javascript:/i, // JavaScript协议
  ]

  const userAgent = req.get('User-Agent') || ''
  const url = req.url
  const body = JSON.stringify(req.body || {})

  // 检查可疑模式
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body) || pattern.test(userAgent)) {
      const securityEvent = {
        type: 'suspicious_request',
        pattern: pattern.toString(),
        url,
        userAgent,
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
      }

      loggers.security.warn(securityEvent, 'Suspicious request detected')

      alertManager.sendAlert(
        monitoringConfig.alerts.types.SECURITY,
        `Suspicious request detected from ${securityEvent.ip}`,
        securityEvent
      )
      break
    }
  }

  // 限制请求频率（简单实现）
  const clientIp = req.ip || req.connection.remoteAddress
  const now = Date.now()
  
  if (!req.app.locals.rateLimiter) {
    req.app.locals.rateLimiter = new Map()
  }

  const rateLimiter = req.app.locals.rateLimiter
  const clientData = rateLimiter.get(clientIp) || { requests: 0, lastReset: now }

  // 每分钟重置
  if (now - clientData.lastReset > 60000) {
    clientData.requests = 0
    clientData.lastReset = now
  }

  clientData.requests++
  rateLimiter.set(clientIp, clientData)

  // 检查限制（每分钟100个请求）
  if (clientData.requests > 100) {
    loggers.security.warn({
      ip: clientIp,
      requests: clientData.requests,
      timeWindow: '1 minute',
    }, 'Rate limit exceeded')

    alertManager.sendAlert(
      monitoringConfig.alerts.types.SECURITY,
      `Rate limit exceeded for IP ${clientIp}: ${clientData.requests} requests/min`,
      { ip: clientIp, requests: clientData.requests }
    )

    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      retryAfter: 60,
    })
  }

  next()
}

module.exports = {
  requestMonitoring,
  errorMonitoring,
  websocketMonitoring,
  healthCheck,
  metricsEndpoint,
  securityMonitoring,
  startSystemMonitoring,
  loggers,
  metricsCollector,
  alertManager,
} 