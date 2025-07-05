"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    server;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    userRooms = new Map();
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        const eventId = this.userRooms.get(client.id);
        if (eventId) {
            client.leave(eventId);
            this.userRooms.delete(client.id);
            this.logger.log(`Client disconnected from event ${eventId}: ${client.id}`);
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleJoinEvent(data, client) {
        const { eventId } = data;
        const previousEventId = this.userRooms.get(client.id);
        if (previousEventId) {
            client.leave(previousEventId);
        }
        client.join(eventId);
        this.userRooms.set(client.id, eventId);
        this.logger.log(`Client ${client.id} joined event: ${eventId}`);
        client.to(eventId).emit('user_joined', {
            eventId,
            socketId: client.id,
        });
    }
    handleLeaveEvent(data, client) {
        const { eventId } = data;
        client.leave(eventId);
        this.userRooms.delete(client.id);
        this.logger.log(`Client ${client.id} left event: ${eventId}`);
        client.to(eventId).emit('user_left', {
            eventId,
            socketId: client.id,
        });
    }
    handleUserActivity(data, client) {
        const { eventId, userName, userInitials } = data;
        client.to(eventId).emit('user_activity_update', {
            eventId,
            userName,
            userInitials,
            socketId: client.id,
        });
    }
    broadcastEventUpdate(eventId, eventData) {
        this.server.to(eventId).emit('event_updated', {
            eventId,
            data: eventData,
        });
        this.logger.log(`Broadcasted event update for: ${eventId}`);
    }
    broadcastResponseUpdate(eventId, responseData) {
        this.server.to(eventId).emit('response_updated', {
            eventId,
            data: responseData,
        });
        this.logger.log(`Broadcasted response update for: ${eventId}`);
    }
    broadcastNewResponse(eventId, responseData) {
        this.server.to(eventId).emit('response_added', {
            eventId,
            data: responseData,
        });
        this.logger.log(`Broadcasted new response for: ${eventId}`);
    }
    broadcastResponseDeleted(eventId, participantName) {
        this.server.to(eventId).emit('response_deleted', {
            eventId,
            participantName,
        });
        this.logger.log(`Broadcasted response deletion for: ${eventId}, user: ${participantName}`);
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_event'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleJoinEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_event'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleLeaveEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('user_activity'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleUserActivity", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
        },
        namespace: '/',
    })
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map