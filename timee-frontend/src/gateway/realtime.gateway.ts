import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('RealtimeGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-event')
  handleJoinEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { eventId: string },
  ) {
    client.join(`event:${data.eventId}`);
    this.logger.log(`Client ${client.id} joined event: ${data.eventId}`);
    return { status: 'joined', eventId: data.eventId };
  }

  @SubscribeMessage('leave-event')
  handleLeaveEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { eventId: string },
  ) {
    client.leave(`event:${data.eventId}`);
    this.logger.log(`Client ${client.id} left event: ${data.eventId}`);
    return { status: 'left', eventId: data.eventId };
  }

  // Broadcast event update to all clients in the event room
  broadcastEventUpdate(eventId: string, event: any) {
    this.server.to(`event:${eventId}`).emit('event-updated', {
      type: 'event-updated',
      payload: event,
    });
    this.logger.log(`Broadcasted event update for event: ${eventId}`);
  }

  // Broadcast new response to all clients in the event room
  broadcastNewResponse(eventId: string, response: any) {
    this.server.to(`event:${eventId}`).emit('response-created', {
      type: 'response-created',
      payload: response,
    });
    this.logger.log(`Broadcasted new response for event: ${eventId}`);
  }

  // Broadcast response update to all clients in the event room
  broadcastResponseUpdate(eventId: string, response: any) {
    this.server.to(`event:${eventId}`).emit('response-updated', {
      type: 'response-updated',
      payload: response,
    });
    this.logger.log(`Broadcasted response update for event: ${eventId}`);
  }

  // Broadcast response deletion to all clients in the event room
  broadcastResponseDelete(eventId: string, responseId: string) {
    this.server.to(`event:${eventId}`).emit('response-deleted', {
      type: 'response-deleted',
      payload: { id: responseId },
    });
    this.logger.log(`Broadcasted response deletion for event: ${eventId}`);
  }
} 