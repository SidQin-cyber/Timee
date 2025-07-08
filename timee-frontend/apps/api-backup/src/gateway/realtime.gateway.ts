import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface JoinRoomPayload {
  eventId: string;
}

interface UserJoinedPayload {
  eventId: string;
  userName: string;
  userInitials: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(RealtimeGateway.name);
  private userRooms = new Map<string, string>(); // socketId -> eventId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const eventId = this.userRooms.get(client.id);
    if (eventId) {
      client.leave(eventId);
      this.userRooms.delete(client.id);
      this.logger.log(`Client disconnected from event ${eventId}: ${client.id}`);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_event')
  handleJoinEvent(
    @MessageBody() data: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { eventId } = data;
    
    // Leave previous room if any
    const previousEventId = this.userRooms.get(client.id);
    if (previousEventId) {
      client.leave(previousEventId);
    }
    
    // Join new room
    client.join(eventId);
    this.userRooms.set(client.id, eventId);
    
    this.logger.log(`Client ${client.id} joined event: ${eventId}`);
    
    // Notify others in the room
    client.to(eventId).emit('user_joined', {
      eventId,
      socketId: client.id,
    });
  }

  @SubscribeMessage('leave_event')
  handleLeaveEvent(
    @MessageBody() data: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { eventId } = data;
    
    client.leave(eventId);
    this.userRooms.delete(client.id);
    
    this.logger.log(`Client ${client.id} left event: ${eventId}`);
    
    // Notify others in the room
    client.to(eventId).emit('user_left', {
      eventId,
      socketId: client.id,
    });
  }

  @SubscribeMessage('user_activity')
  handleUserActivity(
    @MessageBody() data: UserJoinedPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { eventId, userName, userInitials } = data;
    
    // Broadcast user activity to others in the room
    client.to(eventId).emit('user_activity_update', {
      eventId,
      userName,
      userInitials,
      socketId: client.id,
    });
  }

  // Method to broadcast event updates (called from services)
  broadcastEventUpdate(eventId: string, eventData: any) {
    this.server.to(eventId).emit('event_updated', {
      eventId,
      data: eventData,
    });
    this.logger.log(`Broadcasted event update for: ${eventId}`);
  }

  // Method to broadcast response updates (called from services)
  broadcastResponseUpdate(eventId: string, responseData: any) {
    this.server.to(eventId).emit('response_updated', {
      eventId,
      data: responseData,
    });
    this.logger.log(`Broadcasted response update for: ${eventId}`);
  }

  // Method to broadcast new responses (called from services)
  broadcastNewResponse(eventId: string, responseData: any) {
    this.server.to(eventId).emit('response_added', {
      eventId,
      data: responseData,
    });
    this.logger.log(`Broadcasted new response for: ${eventId}`);
  }

  // Method to broadcast response deletions (called from services)
  broadcastResponseDeleted(eventId: string, participantName: string) {
    this.server.to(eventId).emit('response_deleted', {
      eventId,
      participantName,
    });
    this.logger.log(`Broadcasted response deletion for: ${eventId}, user: ${participantName}`);
  }
} 