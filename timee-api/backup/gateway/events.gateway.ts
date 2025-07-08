import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ConnectedClient {
  id: string;
  socket: Socket;
  eventId?: string;
  participantName?: string;
  connectedAt: Date;
  lastPingAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://timee.sealos.run'
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
@Injectable()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private connectedClients: Map<string, ConnectedClient> = new Map();
  private eventRooms: Map<string, Set<string>> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  afterInit(server: Server) {
    this.logger.log('📡 WebSocket Gateway initialized');
    this.setupHeartbeat();
  }

  handleConnection(client: Socket, ...args: any[]) {
    const clientInfo: ConnectedClient = {
      id: client.id,
      socket: client,
      connectedAt: new Date(),
      lastPingAt: new Date(),
      ipAddress: client.handshake.address,
      userAgent: client.handshake.headers['user-agent'],
    };

    this.connectedClients.set(client.id, clientInfo);
    this.logger.log(`🔌 Client connected: ${client.id} (${clientInfo.ipAddress})`);
    
    client.emit('connection', { 
      message: 'Successfully connected to Timee WebSocket',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    
    if (clientInfo) {
      // 从事件房间中移除
      if (clientInfo.eventId) {
        this.leaveEventRoom(client.id, clientInfo.eventId);
      }
      
      // 从连接池中移除
      this.connectedClients.delete(client.id);
      
      this.logger.log(`🔌 Client disconnected: ${client.id} (was in event: ${clientInfo.eventId})`);
    }
  }

  @SubscribeMessage('join-event')
  async handleJoinEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { eventId: string; participantName?: string },
  ) {
    const { eventId, participantName } = data;
    
    this.logger.log(`🚪 Client ${client.id} joining event room: ${eventId} as ${participantName}`);
    
    try {
      // 验证事件是否存在
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        client.emit('error', { 
          message: 'Event not found',
          eventId,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 更新客户端信息
      const clientInfo = this.connectedClients.get(client.id);
      if (clientInfo) {
        clientInfo.eventId = eventId;
        clientInfo.participantName = participantName;
      }

      // 加入Socket.IO房间
    client.join(`event-${eventId}`);
      
      // 更新内存中的房间映射
      if (!this.eventRooms.has(eventId)) {
        this.eventRooms.set(eventId, new Set());
      }
      this.eventRooms.get(eventId)!.add(client.id);

      // 记录连接到数据库
      await this.prisma.roomConnection.create({
        data: {
          eventId,
          socketId: client.id,
          participantName: participantName || null,
          ipAddress: clientInfo?.ipAddress,
          userAgent: clientInfo?.userAgent,
        },
      });

      // 记录操作日志
      await this.prisma.eventLog.create({
        data: {
          eventId,
          action: 'USER_JOINED',
          details: {
            socketId: client.id,
            participantName: participantName,
            ipAddress: clientInfo?.ipAddress,
          },
          participantName: participantName || null,
          socketId: client.id,
        },
      });

      // 发送确认消息
      client.emit('joined-event', { 
        eventId, 
        participantName,
        message: 'Successfully joined event',
        timestamp: new Date().toISOString(),
      });

      // 向房间其他成员广播新用户加入
      client.to(`event-${eventId}`).emit('user-joined', {
        eventId,
        participantName,
        socketId: client.id,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`✅ Client ${client.id} successfully joined event ${eventId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to join event ${eventId}:`, error);
      client.emit('error', { 
        message: 'Failed to join event',
        eventId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('leave-event')
  async handleLeaveEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() eventId: string,
  ) {
    this.logger.log(`🚪 Client ${client.id} leaving event room: ${eventId}`);
    
    try {
      await this.leaveEventRoom(client.id, eventId);
      
      client.emit('left-event', { 
        eventId, 
        message: 'Successfully left event',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`❌ Failed to leave event ${eventId}:`, error);
      client.emit('error', { 
        message: 'Failed to leave event',
        eventId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      clientInfo.lastPingAt = new Date();
    }
    
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }

  // 私有方法：离开事件房间
  private async leaveEventRoom(clientId: string, eventId: string) {
    const clientInfo = this.connectedClients.get(clientId);
    
    if (clientInfo) {
      // 从Socket.IO房间离开
      clientInfo.socket.leave(`event-${eventId}`);
      
      // 从内存房间映射中移除
      const eventRoom = this.eventRooms.get(eventId);
      if (eventRoom) {
        eventRoom.delete(clientId);
        if (eventRoom.size === 0) {
          this.eventRooms.delete(eventId);
        }
      }

      // 更新数据库连接状态
      await this.prisma.roomConnection.updateMany({
        where: {
          eventId,
          socketId: clientId,
        },
        data: {
          isActive: false,
        },
      });

      // 记录操作日志
      await this.prisma.eventLog.create({
        data: {
          eventId,
          action: 'USER_LEFT',
          details: {
            socketId: clientId,
            participantName: clientInfo.participantName,
          },
          participantName: clientInfo.participantName || null,
          socketId: clientId,
        },
      });

      // 向房间其他成员广播用户离开
      clientInfo.socket.to(`event-${eventId}`).emit('user-left', {
        eventId,
        participantName: clientInfo.participantName,
        socketId: clientId,
        timestamp: new Date().toISOString(),
      });

      // 清除客户端事件信息
      clientInfo.eventId = undefined;
      clientInfo.participantName = undefined;
    }
  }

  // 设置心跳检测
  private setupHeartbeat() {
    setInterval(() => {
      const now = new Date();
      const timeout = 30000; // 30秒超时
      
      this.connectedClients.forEach((client, clientId) => {
        const timeSinceLastPing = now.getTime() - client.lastPingAt.getTime();
        
        if (timeSinceLastPing > timeout) {
          this.logger.warn(`⏰ Client ${clientId} timed out, disconnecting`);
          client.socket.disconnect();
        }
      });
    }, 15000); // 每15秒检查一次
  }

  // 发送响应创建通知 - 解决Bug #1的关键方法
  notifyResponseCreated(eventId: string, data: any) {
    this.logger.log(`➕ Broadcasting response created for event: ${eventId}`);
    
    const message = {
      eventId,
      ...data,
      timestamp: new Date().toISOString(),
    };

    // 向房间内所有客户端发送
    this.server.to(`event-${eventId}`).emit('response_created', message);
    
    // 额外确保：也向具体的连接发送
    const eventRoom = this.eventRooms.get(eventId);
    if (eventRoom) {
      eventRoom.forEach(clientId => {
        const client = this.connectedClients.get(clientId);
        if (client) {
          client.socket.emit('response_created', message);
        }
    });
    }
  }

  // 发送响应更新通知 - 解决Bug #1的关键方法
  notifyResponseUpdated(eventId: string, data: any) {
    this.logger.log(`📝 Broadcasting response updated for event: ${eventId}`);
    
    const message = {
      eventId,
      ...data,
      timestamp: new Date().toISOString(),
    };

    // 向房间内所有客户端发送
    this.server.to(`event-${eventId}`).emit('response_updated', message);
    
    // 额外确保：也向具体的连接发送
    const eventRoom = this.eventRooms.get(eventId);
    if (eventRoom) {
      eventRoom.forEach(clientId => {
        const client = this.connectedClients.get(clientId);
        if (client) {
          client.socket.emit('response_updated', message);
        }
    });
    }
  }

  // 发送响应删除通知
  notifyResponseDeleted(eventId: string, responseId: string) {
    this.logger.log(`🗑️ Broadcasting response deleted for event: ${eventId}`);
    
    const message = {
      eventId,
      responseId,
      timestamp: new Date().toISOString(),
    };

    this.server.to(`event-${eventId}`).emit('response_deleted', message);
    
    // 额外确保
    const eventRoom = this.eventRooms.get(eventId);
    if (eventRoom) {
      eventRoom.forEach(clientId => {
        const client = this.connectedClients.get(clientId);
        if (client) {
          client.socket.emit('response_deleted', message);
        }
    });
    }
  }

  // 发送参与者列表更新通知
  notifyParticipantsUpdated(eventId: string, participants: any[]) {
    this.logger.log(`👥 Broadcasting participants updated for event: ${eventId}`);
    
    const message = {
      eventId,
      participants,
      count: participants.length,
      timestamp: new Date().toISOString(),
    };

    this.server.to(`event-${eventId}`).emit('participants_updated', message);
    
    // 额外确保
    const eventRoom = this.eventRooms.get(eventId);
    if (eventRoom) {
      eventRoom.forEach(clientId => {
        const client = this.connectedClients.get(clientId);
        if (client) {
          client.socket.emit('participants_updated', message);
        }
      });
    }
  }

  // 发送事件更新通知
  notifyEventUpdated(eventId: string, eventData: any) {
    this.logger.log(`📝 Broadcasting event update for: ${eventId}`);
    
    const message = {
      eventId,
      data: eventData,
      timestamp: new Date().toISOString(),
    };

    this.server.to(`event-${eventId}`).emit('event_updated', message);
  }

  // 获取房间内的连接数量
  getEventRoomSize(eventId: string): number {
    const room = this.eventRooms.get(eventId);
    return room ? room.size : 0;
  }

  // 获取所有事件房间信息
  getEventRoomsInfo(): { [eventId: string]: number } {
    const rooms: { [eventId: string]: number } = {};
    this.eventRooms.forEach((clientSet, eventId) => {
      rooms[eventId] = clientSet.size;
    });
    return rooms;
  }

  // 获取连接统计信息
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      eventRooms: this.getEventRoomsInfo(),
      activeRooms: this.eventRooms.size,
    };
  }
} 