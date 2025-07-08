require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { body, param, validationResult } = require('express-validator');
const pino = require('pino');
const RoomService = require('../services/roomService');

// 监控中间件
const {
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
} = require('../middleware/monitoring');

// 使用监控系统的日志器
const logger = loggers.app;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const port = process.env.PORT || 8080;

// 初始化服务
const roomService = new RoomService();

// Socket.IO 监控
websocketMonitoring(io);

// Socket.IO 实时通信处理
io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'Client connected');

  // 用户加入房间
  socket.on('joinRoom', (shareId) => {
    if (shareId && typeof shareId === 'string') {
      socket.join(shareId);
      logger.info({ socketId: socket.id, shareId }, 'Socket joined room');
      
      // 向房间内其他用户广播新用户加入
      socket.to(shareId).emit('userJoined', {
        message: 'A user joined the room',
        timestamp: new Date().toISOString()
      });
    }
  });

  // 用户离开房间
  socket.on('leaveRoom', (shareId) => {
    if (shareId && typeof shareId === 'string') {
      socket.leave(shareId);
      logger.info({ socketId: socket.id, shareId }, 'Socket left room');
      
      // 向房间内其他用户广播用户离开
      socket.to(shareId).emit('userLeft', {
        message: 'A user left the room',
        timestamp: new Date().toISOString()
      });
    }
  });

  // 处理断开连接
  socket.on('disconnect', () => {
    logger.info({ socketId: socket.id }, 'Client disconnected');
  });

  // 心跳检测
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// 为 roomService 添加 Socket.IO 实例，用于实时广播
roomService.io = io;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 (用于监控仪表板)
app.use('/public', express.static('public'));

// 前端静态文件服务
app.use('/assets', express.static('dist/assets'));
app.use(express.static('dist'));

// 监控中间件
app.use(healthCheck);         // 健康检查
app.use(metricsEndpoint);     // 指标端点
app.use(securityMonitoring);  // 安全监控
app.use(requestMonitoring);   // 请求监控

// 参数验证错误处理中间件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// API 路由

/**
 * POST /api/rooms - 创建新房间
 */
app.post('/api/rooms', 
  [
    body('title').optional().isString().isLength({ max: 255 }),
    body('description').optional().isString(),
    body('timezone').optional().isString().isLength({ max: 100 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const roomData = {
        title: req.body.title,
        description: req.body.description,
        timezone: req.body.timezone
      };

      const room = await roomService.createRoom(roomData);
      
      res.status(201).json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create room',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/rooms/:shareId/join - 用户加入房间
 */
app.post('/api/rooms/:shareId/join',
  [
    param('shareId').isString().isLength({ min: 12, max: 12 }),
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('email').optional().isEmail(),
    body('initials').optional().isString().isLength({ max: 10 }),
    body('timezone').optional().isString().isLength({ max: 100 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { shareId } = req.params;
      const participantData = {
        name: req.body.name,
        email: req.body.email,
        initials: req.body.initials,
        timezone: req.body.timezone
      };

      const participant = await roomService.joinRoom(shareId, participantData);
      
      res.status(200).json({
        success: true,
        data: participant
      });
    } catch (error) {
      console.error('Error joining room:', error);
      const statusCode = error.message === 'Room not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }
);

/**
 * PUT /api/rooms/:shareId/availability - 更新用户可用时间
 */
app.put('/api/rooms/:shareId/availability',
  [
    param('shareId').isString().isLength({ min: 12, max: 12 }),
    body('participantId').isString().isUUID(),
    body('selectedSlots').isArray(),
    body('selectedSlots.*.startTime').isISO8601(),
    body('selectedSlots.*.endTime').isISO8601(),
    body('selectedSlots.*.isAvailable').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { shareId } = req.params;
      const { participantId, selectedSlots } = req.body;

      const result = await roomService.updateUserAvailability(shareId, participantId, selectedSlots);
      
      // 🔥 实时同步：广播房间更新事件
      try {
        const updatedRoom = await roomService.getRoomByShareId(shareId);
        io.to(shareId).emit('roomUpdated', {
          type: 'availabilityUpdated',
          data: updatedRoom,
          timestamp: new Date().toISOString()
        });
        logger.info({ shareId }, 'Broadcasted room update');
      } catch (broadcastError) {
        logger.error({ error: broadcastError.message, shareId }, 'Error broadcasting room update');
        // 不影响主要功能，继续返回成功响应
      }
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }
);

/**
 * GET /api/rooms/:shareId - 获取房间完整信息
 */
app.get('/api/rooms/:shareId',
  [
    param('shareId').isString().isLength({ min: 12, max: 12 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { shareId } = req.params;
      const room = await roomService.getRoomByShareId(shareId);
      
      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error getting room:', error);
      const statusCode = error.message === 'Room not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }
);

/**
 * GET /api/rooms/tc/:tcCode - 根据口令获取 shareId
 */
app.get('/api/rooms/tc/:tcCode',
  [
    param('tcCode').isString().isLength({ min: 6, max: 6 }).isNumeric()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { tcCode } = req.params;
      const shareId = await roomService.getShareIdByTcCode(tcCode);
      
      res.status(200).json({
        success: true,
        data: { shareId }
      });
    } catch (error) {
      console.error('Error resolving tc-code:', error);
      const statusCode = error.message === 'Invalid tc-code' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }
);

// 监控仪表板
app.get('/dashboard', (req, res) => {
  res.sendFile('monitoring.html', { root: 'public' });
});

// 健康检查端点 (已由监控中间件处理，但保留兼容性)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Timee API is running',
    timestamp: new Date().toISOString()
  });
});

// 前端路由处理 - 对于非API路由，返回前端应用
app.get('*', (req, res) => {
  // 如果是API路由，返回404 JSON
  if (req.path.startsWith('/api/') || req.path.startsWith('/health') || req.path.startsWith('/metrics') || req.path.startsWith('/dashboard')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  
  // 对于其他路由，返回前端应用
  res.sendFile('index.html', { root: 'dist' });
});

// 全局错误处理 (使用监控中间件)
app.use(errorMonitoring);

// 优雅关闭处理
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await roomService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await roomService.disconnect();
  process.exit(0);
});

// 启动服务器
server.listen(port, () => {
  logger.info({
    port,
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  }, 'Timee API server started with Socket.IO support');
  
  // 启动系统监控
  startSystemMonitoring();
  logger.info('System monitoring started');
});

module.exports = app; 