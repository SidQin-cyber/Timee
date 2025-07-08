const pino = require('pino')
const fs = require('fs')
const path = require('path')

// 监控配置
const monitoringConfig = {
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV === 'development',
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    
    // 日志文件路径
    files: {
      app: path.join(__dirname, '../logs/app.log'),
      error: path.join(__dirname, '../logs/error.log'),
      access: path.join(__dirname, '../logs/access.log'),
      performance: path.join(__dirname, '../logs/performance.log'),
      security: path.join(__dirname, '../logs/security.log'),
    },

    // 日志轮转配置
    rotation: {
      maxSize: '100MB',
      maxFiles: 30, // 保留30天
      datePattern: 'YYYY-MM-DD',
    }
  },

  // 性能监控
  performance: {
    // 响应时间阈值（毫秒）
    slowRequestThreshold: 1000,
    // 内存使用阈值（MB）
    memoryThreshold: 512,
    // CPU使用阈值（%）
    cpuThreshold: 80,
    // 数据库连接池阈值
    dbConnectionThreshold: 80,
  },

  // 告警配置
  alerts: {
    // 告警类型
    types: {
      ERROR: 'error',
      PERFORMANCE: 'performance',
      SECURITY: 'security',
      SYSTEM: 'system',
    },

    // 告警渠道
    channels: {
      console: true,
      log: true,
      webhook: process.env.ALERT_WEBHOOK_URL || null,
      email: process.env.ALERT_EMAIL || null,
    },

    // 告警阈值
    thresholds: {
      errorRate: 0.05, // 5% 错误率
      responseTime: 2000, // 2秒
      memoryUsage: 0.85, // 85% 内存使用
      diskSpace: 0.90, // 90% 磁盘使用
    }
  },

  // 健康检查配置
  healthCheck: {
    interval: 30000, // 30秒
    timeout: 5000, // 5秒超时
    endpoints: [
      'http://localhost:3000/health',
      'http://localhost:3000/api/rooms',
    ],
    database: true,
    redis: false, // 暂未使用Redis
  },

  // 指标收集
  metrics: {
    enabled: true,
    interval: 60000, // 1分钟
    retention: 7 * 24 * 60 * 60 * 1000, // 7天
    
    // 收集的指标
    collect: {
      http: true,        // HTTP请求指标
      system: true,      // 系统指标
      database: true,    // 数据库指标
      websocket: true,   // WebSocket指标
      business: true,    // 业务指标
    }
  }
}

// 创建日志目录
function ensureLogDirectories() {
  const logDir = path.join(__dirname, '../logs')
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
}

// 创建分层日志记录器
function createLoggers() {
  ensureLogDirectories()

  const baseOptions = {
    level: monitoringConfig.logging.level,
    timestamp: monitoringConfig.logging.timestamp,
  }

  // 开发环境美化输出
  if (process.env.NODE_ENV === 'development') {
    baseOptions.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:standard'
      }
    }
  }

  // 主应用日志
  const appLogger = pino({
    ...baseOptions,
    name: 'timee-api'
  })

  // 错误日志
  const errorLogger = pino({
    ...baseOptions,
    level: 'error',
    name: 'timee-error'
  })

  // 访问日志
  const accessLogger = pino({
    ...baseOptions,
    name: 'timee-access'
  })

  // 性能日志
  const performanceLogger = pino({
    ...baseOptions,
    name: 'timee-performance'
  })

  // 安全日志
  const securityLogger = pino({
    ...baseOptions,
    name: 'timee-security'
  })

  return {
    app: appLogger,
    error: errorLogger,
    access: accessLogger,
    performance: performanceLogger,
    security: securityLogger,
  }
}

// 系统指标收集器
class MetricsCollector {
  constructor() {
    this.metrics = {
      http: {
        requests: 0,
        errors: 0,
        responseTimes: [],
      },
      system: {
        memory: 0,
        cpu: 0,
        uptime: 0,
      },
      database: {
        connections: 0,
        queries: 0,
        errors: 0,
      },
      websocket: {
        connections: 0,
        messages: 0,
      },
      business: {
        rooms: 0,
        participants: 0,
        responses: 0,
      }
    }
  }

  // 记录HTTP请求
  recordHttpRequest(method, url, statusCode, responseTime) {
    this.metrics.http.requests++
    this.metrics.http.responseTimes.push(responseTime)
    
    if (statusCode >= 400) {
      this.metrics.http.errors++
    }

    // 保留最近1000个响应时间
    if (this.metrics.http.responseTimes.length > 1000) {
      this.metrics.http.responseTimes = this.metrics.http.responseTimes.slice(-1000)
    }
  }

  // 记录系统指标
  recordSystemMetrics() {
    const usage = process.memoryUsage()
    this.metrics.system.memory = usage.heapUsed / 1024 / 1024 // MB
    this.metrics.system.uptime = process.uptime()
    
    // CPU使用率需要额外计算
    this.updateCpuUsage()
  }

  // 更新CPU使用率
  updateCpuUsage() {
    const startUsage = process.cpuUsage()
    setTimeout(() => {
      const endUsage = process.cpuUsage(startUsage)
      const totalUsage = endUsage.user + endUsage.system
      this.metrics.system.cpu = totalUsage / 1000000 // 转换为毫秒
    }, 100)
  }

  // 获取所有指标
  getAllMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      calculated: {
        avgResponseTime: this.calculateAverageResponseTime(),
        errorRate: this.calculateErrorRate(),
        memoryUsagePercent: this.calculateMemoryUsagePercent(),
      }
    }
  }

  // 计算平均响应时间
  calculateAverageResponseTime() {
    const times = this.metrics.http.responseTimes
    if (times.length === 0) return 0
    return times.reduce((sum, time) => sum + time, 0) / times.length
  }

  // 计算错误率
  calculateErrorRate() {
    if (this.metrics.http.requests === 0) return 0
    return this.metrics.http.errors / this.metrics.http.requests
  }

  // 计算内存使用百分比
  calculateMemoryUsagePercent() {
    const total = process.memoryUsage().heapTotal / 1024 / 1024
    return this.metrics.system.memory / total
  }

  // 重置指标
  reset() {
    this.metrics.http.requests = 0
    this.metrics.http.errors = 0
    this.metrics.http.responseTimes = []
  }
}

// 告警管理器
class AlertManager {
  constructor(loggers) {
    this.loggers = loggers
    this.alertHistory = []
    this.rateLimits = new Map() // 防止告警风暴
  }

  // 发送告警
  async sendAlert(type, message, data = {}) {
    const alertId = `${type}-${Date.now()}`
    
    // 速率限制检查
    if (this.isRateLimited(type)) {
      return
    }

    const alert = {
      id: alertId,
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
      level: this.getAlertLevel(type),
    }

    // 记录告警历史
    this.alertHistory.push(alert)
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000)
    }

    // 记录到日志
    this.loggers.error.error({
      alert: true,
      ...alert
    }, `ALERT: ${message}`)

    // 控制台输出
    if (monitoringConfig.alerts.channels.console) {
      console.error(`🚨 ALERT [${type}]: ${message}`)
    }

    // Webhook通知
    if (monitoringConfig.alerts.channels.webhook) {
      await this.sendWebhookAlert(alert)
    }

    // 设置速率限制
    this.setRateLimit(type)
  }

  // 检查是否被速率限制
  isRateLimited(type) {
    const lastAlert = this.rateLimits.get(type)
    if (!lastAlert) return false
    
    const timeDiff = Date.now() - lastAlert
    return timeDiff < 60000 // 1分钟内相同类型告警只发一次
  }

  // 设置速率限制
  setRateLimit(type) {
    this.rateLimits.set(type, Date.now())
  }

  // 获取告警级别
  getAlertLevel(type) {
    const levels = {
      [monitoringConfig.alerts.types.ERROR]: 'high',
      [monitoringConfig.alerts.types.PERFORMANCE]: 'medium',
      [monitoringConfig.alerts.types.SECURITY]: 'high',
      [monitoringConfig.alerts.types.SYSTEM]: 'medium',
    }
    return levels[type] || 'low'
  }

  // 发送Webhook告警
  async sendWebhookAlert(alert) {
    try {
      const response = await fetch(monitoringConfig.alerts.channels.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 Timee API Alert`,
          attachments: [{
            color: alert.level === 'high' ? 'danger' : 'warning',
            fields: [
              { title: 'Type', value: alert.type, short: true },
              { title: 'Message', value: alert.message, short: false },
              { title: 'Time', value: alert.timestamp, short: true },
            ]
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }
    } catch (error) {
      this.loggers.error.error({ error: error.message }, 'Failed to send webhook alert')
    }
  }

  // 获取告警历史
  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit)
  }
}

module.exports = {
  monitoringConfig,
  createLoggers,
  MetricsCollector,
  AlertManager,
} 