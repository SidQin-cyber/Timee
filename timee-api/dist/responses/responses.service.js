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
var ResponsesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../gateway/events.gateway");
let ResponsesService = ResponsesService_1 = class ResponsesService {
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
        this.logger = new common_1.Logger(ResponsesService_1.name);
    }
    async createOrUpdateResponse(createResponseDto) {
        this.logger.log(`📝 Creating/updating response for user: ${createResponseDto.participantName}`);
        return await this.prisma.executeTransaction(async (prisma) => {
            const event = await prisma.event.findUnique({
                where: { id: createResponseDto.eventId },
                include: { participants: true }
            });
            if (!event) {
                throw new common_1.NotFoundException(`Event with ID ${createResponseDto.eventId} not found`);
            }
            const participant = await prisma.participant.upsert({
                where: {
                    eventId_name: {
                        eventId: createResponseDto.eventId,
                        name: createResponseDto.participantName,
                    },
                },
                create: {
                    eventId: createResponseDto.eventId,
                    name: createResponseDto.participantName,
                    email: createResponseDto.participantEmail,
                    initials: createResponseDto.userInitials,
                    timezone: createResponseDto.timezone || 'UTC',
                },
                update: {
                    email: createResponseDto.participantEmail,
                    initials: createResponseDto.userInitials,
                    timezone: createResponseDto.timezone || 'UTC',
                },
            });
            const response = await prisma.response.upsert({
                where: {
                    participantId: participant.id,
                },
                create: {
                    participantId: participant.id,
                    eventId: createResponseDto.eventId,
                    availability: createResponseDto.availability || [],
                    paintMode: createResponseDto.paintMode || 'available',
                    version: 1,
                },
                update: {
                    availability: createResponseDto.availability || [],
                    paintMode: createResponseDto.paintMode || 'available',
                    version: {
                        increment: 1,
                    },
                },
                include: {
                    participant: true,
                    event: true,
                },
            });
            await prisma.eventLog.create({
                data: {
                    eventId: createResponseDto.eventId,
                    action: 'RESPONSE_UPDATED',
                    details: {
                        participantId: participant.id,
                        participantName: participant.name,
                        availabilityCount: createResponseDto.availability?.length || 0,
                        paintMode: createResponseDto.paintMode,
                        version: response.version,
                    },
                    participantName: participant.name,
                },
            });
            this.logger.log(`✅ Response created/updated for ${participant.name} in event ${event.tcCode}`);
            return response;
        }).then(async (response) => {
            this.logger.log(`📡 Broadcasting response update for event: ${response.eventId}`);
            const roomData = await this.getEventRoomData(response.eventId);
            this.eventsGateway.notifyResponseUpdated(response.eventId, {
                response: response,
                roomData: roomData,
                timestamp: new Date().toISOString(),
            });
            return response;
        });
    }
    async getEventRoomData(eventId) {
        this.logger.log(`🔍 Fetching room data for event: ${eventId}`);
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                participants: {
                    include: {
                        response: true,
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${eventId} not found`);
        }
        const heatmapData = this.buildHeatmapData(event.participants);
        return {
            event: {
                id: event.id,
                tcCode: event.tcCode,
                title: event.title,
                startDate: event.startDate,
                endDate: event.endDate,
                timezone: event.timezone,
            },
            participants: event.participants.map(p => ({
                id: p.id,
                name: p.name,
                email: p.email,
                initials: p.initials,
                timezone: p.timezone,
                hasResponse: !!p.response,
                response: p.response ? {
                    id: p.response.id,
                    availability: p.response.availability,
                    paintMode: p.response.paintMode,
                    version: p.response.version,
                    updatedAt: p.response.updatedAt,
                } : null,
            })),
            heatmapData,
            participantCount: event.participants.length,
            responseCount: event.participants.filter(p => p.response).length,
        };
    }
    async getUserResponse(eventId, participantName) {
        this.logger.log(`🔍 Fetching user response for ${participantName} in event: ${eventId}`);
        const participant = await this.prisma.participant.findUnique({
            where: {
                eventId_name: {
                    eventId: eventId,
                    name: participantName,
                },
            },
            include: {
                response: true,
            },
        });
        if (!participant) {
            this.logger.warn(`⚠️ Participant ${participantName} not found in event ${eventId}`);
            return null;
        }
        return {
            participant: {
                id: participant.id,
                name: participant.name,
                email: participant.email,
                initials: participant.initials,
                timezone: participant.timezone,
            },
            response: participant.response ? {
                id: participant.response.id,
                availability: participant.response.availability,
                paintMode: participant.response.paintMode,
                version: participant.response.version,
                updatedAt: participant.response.updatedAt,
            } : null,
        };
    }
    buildHeatmapData(participants) {
        const heatmapData = new Map();
        participants.forEach(participant => {
            if (participant.response && participant.response.availability) {
                const availability = participant.response.availability;
                const slots = Array.isArray(availability) ? availability : [];
                slots.forEach((slot) => {
                    if (slot && typeof slot === 'object') {
                        let slotKey;
                        if (slot.date && slot.time) {
                            slotKey = `${slot.date}_${slot.time}`;
                        }
                        else if (slot.timestamp) {
                            slotKey = slot.timestamp;
                        }
                        else if (typeof slot === 'string') {
                            slotKey = slot;
                        }
                        else {
                            return;
                        }
                        heatmapData.set(slotKey, (heatmapData.get(slotKey) || 0) + 1);
                    }
                });
            }
        });
        return Array.from(heatmapData.entries()).map(([slot, count]) => ({
            slot,
            count,
            percentage: participants.length > 0 ? (count / participants.length) * 100 : 0,
        })).sort((a, b) => b.count - a.count);
    }
    async deleteResponse(responseId) {
        this.logger.log(`🗑️ Deleting response: ${responseId}`);
        return await this.prisma.executeTransaction(async (prisma) => {
            const response = await prisma.response.findUnique({
                where: { id: responseId },
                include: { participant: true },
            });
            if (!response) {
                throw new common_1.NotFoundException(`Response with ID ${responseId} not found`);
            }
            await prisma.response.delete({
                where: { id: responseId },
            });
            await prisma.eventLog.create({
                data: {
                    eventId: response.eventId,
                    action: 'RESPONSE_DELETED',
                    details: {
                        participantId: response.participantId,
                        participantName: response.participant.name,
                        responseId: responseId,
                    },
                    participantName: response.participant.name,
                },
            });
            return response;
        }).then(async (response) => {
            this.eventsGateway.notifyResponseDeleted(response.eventId, responseId);
            const roomData = await this.getEventRoomData(response.eventId);
            this.eventsGateway.notifyResponseUpdated(response.eventId, {
                roomData: roomData,
                timestamp: new Date().toISOString(),
            });
            return response;
        });
    }
    async findAll() {
        return await this.prisma.response.findMany({
            include: {
                participant: true,
                event: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const response = await this.prisma.response.findUnique({
            where: { id },
            include: {
                participant: true,
                event: true,
            },
        });
        if (!response) {
            throw new common_1.NotFoundException(`Response with ID ${id} not found`);
        }
        return response;
    }
};
exports.ResponsesService = ResponsesService;
exports.ResponsesService = ResponsesService = ResponsesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], ResponsesService);
//# sourceMappingURL=responses.service.js.map