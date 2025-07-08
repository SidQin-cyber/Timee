/**
 * TimeeWebSocketClient - 完整的WebSocket客户端实现
 * 支持实时同步、状态恢复、错误处理等功能
 */
class TimeeWebSocketClient {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || 'http://localhost:3000/api',
      wsUrl: config.wsUrl || 'ws://localhost:3000',
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectInterval: config.reconnectInterval || 2000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      debug: config.debug || false,
      ...config
    };

    this.socket = null;
    this.isConnected = false;
    this.isReconnecting = false;
    this.reconnectCount = 0;
    this.heartbeatTimer = null;
    this.eventHandlers = new Map();
    this.currentEventId = null;
    this.currentParticipantName = null;
    this.lastKnownState = null;

    this.log('WebSocket client initialized', this.config);
  }

  /**
   * 连接到WebSocket服务器
   */
  async connect() {
    try {
      this.log('Connecting to WebSocket server...');
      
      // 动态导入socket.io-client
      const { io } = await import('https://cdn.socket.io/4.7.2/socket.io.esm.min.js');
      
      this.socket = io(this.config.wsUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
      });

      this.setupEventHandlers();
      this.startHeartbeat();
      
      return new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          this.isConnected = true;
          this.isReconnecting = false;
          this.reconnectCount = 0;
          this.log('Connected to WebSocket server');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          this.log('Connection error:', error);
          reject(error);
        });
      });
    } catch (error) {
      this.log('Failed to connect:', error);
      throw error;
    }
  }

  /**
   * 设置WebSocket事件处理程序
   */
  setupEventHandlers() {
    this.socket.on('disconnect', (reason) => {
      this.log('Disconnected:', reason);
      this.isConnected = false;
      this.stopHeartbeat();
      
      if (reason === 'io server disconnect') {
        // 服务器主动断开，不自动重连
        this.emit('disconnected', { reason });
      } else {
        // 网络问题等，尝试重连
        this.attemptReconnect();
      }
    });

    this.socket.on('pong', () => {
      this.log('Received pong from server');
    });

    this.socket.on('room-update', (data) => {
      this.log('Room update received:', data);
      this.emit('room-update', data);
    });

    this.socket.on('user-joined', (data) => {
      this.log('User joined:', data);
      this.emit('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      this.log('User left:', data);
      this.emit('user-left', data);
    });

    this.socket.on('response-updated', (data) => {
      this.log('Response updated:', data);
      this.emit('response-updated', data);
    });

    this.socket.on('error', (error) => {
      this.log('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  /**
   * 开始心跳检测
   */
  startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.socket.emit('ping');
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * 停止心跳检测
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 尝试重连
   */
  attemptReconnect() {
    if (this.isReconnecting || this.reconnectCount >= this.config.reconnectAttempts) {
      return;
    }

    this.isReconnecting = true;
    this.reconnectCount++;
    
    this.log(`Attempting to reconnect (${this.reconnectCount}/${this.config.reconnectAttempts})`);
    
    setTimeout(() => {
      this.socket.connect();
    }, this.config.reconnectInterval);
  }

  /**
   * 加入活动房间
   */
  async joinEvent(eventId, participantName) {
    if (!this.isConnected) {
      throw new Error('Not connected to WebSocket server');
    }

    this.currentEventId = eventId;
    this.currentParticipantName = participantName;

    this.log(`Joining event: ${eventId} as ${participantName}`);
    
    this.socket.emit('join-event', { eventId, participantName });
    
    // 获取初始状态
    try {
      const roomData = await this.getRoomData(eventId);
      this.lastKnownState = roomData;
      this.emit('initial-state', roomData);
    } catch (error) {
      this.log('Failed to get initial state:', error);
      this.emit('error', error);
    }
  }

  /**
   * 离开活动房间
   */
  leaveEvent() {
    if (!this.isConnected || !this.currentEventId) {
      return;
    }

    this.log(`Leaving event: ${this.currentEventId}`);
    
    this.socket.emit('leave-event', { 
      eventId: this.currentEventId, 
      participantName: this.currentParticipantName 
    });
    
    this.currentEventId = null;
    this.currentParticipantName = null;
    this.lastKnownState = null;
  }

  /**
   * 提交用户响应
   */
  async submitResponse(responseData) {
    if (!this.currentEventId || !this.currentParticipantName) {
      throw new Error('Not joined to any event');
    }

    this.log('Submitting response:', responseData);

    try {
      const response = await fetch(`${this.config.apiUrl}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: this.currentEventId,
          participantName: this.currentParticipantName,
          ...responseData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      this.log('Response submitted successfully:', result);
      
      return result;
    } catch (error) {
      this.log('Failed to submit response:', error);
      throw error;
    }
  }

  /**
   * 获取房间数据
   */
  async getRoomData(eventId) {
    try {
      const response = await fetch(`${this.config.apiUrl}/responses/room/${eventId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      this.log('Failed to get room data:', error);
      throw error;
    }
  }

  /**
   * 获取用户响应数据
   */
  async getUserResponse(eventId, participantName) {
    try {
      const response = await fetch(`${this.config.apiUrl}/responses/user/${eventId}/${participantName}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      this.log('Failed to get user response:', error);
      throw error;
    }
  }

  /**
   * 恢复用户状态
   */
  async restoreUserState(eventId, participantName) {
    try {
      this.log(`Restoring state for ${participantName} in event ${eventId}`);
      
      const [roomData, userResponse] = await Promise.all([
        this.getRoomData(eventId),
        this.getUserResponse(eventId, participantName)
      ]);

      this.lastKnownState = roomData;
      
      this.emit('state-restored', {
        roomData,
        userResponse,
        eventId,
        participantName
      });

      return { roomData, userResponse };
    } catch (error) {
      this.log('Failed to restore state:', error);
      throw error;
    }
  }

  /**
   * 创建新活动
   */
  async createEvent(eventData) {
    try {
      const response = await fetch(`${this.config.apiUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      this.log('Failed to create event:', error);
      throw error;
    }
  }

  /**
   * 获取活动信息
   */
  async getEvent(tcCode) {
    try {
      const response = await fetch(`${this.config.apiUrl}/events/tc/${tcCode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      this.log('Failed to get event:', error);
      throw error;
    }
  }

  /**
   * 生成新的tcCode
   */
  async generateTcCode() {
    try {
      const response = await fetch(`${this.config.apiUrl}/events/generate/tc-code`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data.tcCode;
    } catch (error) {
      this.log('Failed to generate tcCode:', error);
      throw error;
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.log('Disconnecting from WebSocket server');
    
    this.leaveEvent();
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isReconnecting = false;
    this.reconnectCount = 0;
  }

  /**
   * 添加事件监听器
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * 移除事件监听器
   */
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          this.log('Error in event handler:', error);
        }
      });
    }
  }

  /**
   * 日志输出
   */
  log(message, ...args) {
    if (this.config.debug) {
      console.log(`[TimeeWebSocketClient] ${message}`, ...args);
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionState() {
    return {
      isConnected: this.isConnected,
      isReconnecting: this.isReconnecting,
      reconnectCount: this.reconnectCount,
      currentEventId: this.currentEventId,
      currentParticipantName: this.currentParticipantName,
      hasLastKnownState: !!this.lastKnownState
    };
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimeeWebSocketClient;
} else {
  window.TimeeWebSocketClient = TimeeWebSocketClient;
} 