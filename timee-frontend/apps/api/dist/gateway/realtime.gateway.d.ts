import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
interface JoinRoomPayload {
    eventId: string;
}
interface UserJoinedPayload {
    eventId: string;
    userName: string;
    userInitials: string;
}
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    private userRooms;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinEvent(data: JoinRoomPayload, client: Socket): void;
    handleLeaveEvent(data: JoinRoomPayload, client: Socket): void;
    handleUserActivity(data: UserJoinedPayload, client: Socket): void;
    broadcastEventUpdate(eventId: string, eventData: any): void;
    broadcastResponseUpdate(eventId: string, responseData: any): void;
    broadcastNewResponse(eventId: string, responseData: any): void;
    broadcastResponseDeleted(eventId: string, participantName: string): void;
}
export {};
