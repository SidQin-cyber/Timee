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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ResponsesService = class ResponsesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submitResponse(createResponseDto) {
        if (!createResponseDto.eventId) {
            throw new Error('Event ID is required');
        }
        return this.prisma.eventResponse.upsert({
            where: {
                eventId_participantName: {
                    eventId: createResponseDto.eventId,
                    participantName: createResponseDto.participantName,
                },
            },
            update: {
                participantEmail: createResponseDto.participantEmail,
                userInitials: createResponseDto.userInitials,
                paintMode: createResponseDto.paintMode,
                timezone: createResponseDto.timezone,
                availableSlots: createResponseDto.availableSlots,
            },
            create: {
                eventId: createResponseDto.eventId,
                participantName: createResponseDto.participantName,
                participantEmail: createResponseDto.participantEmail,
                userInitials: createResponseDto.userInitials,
                paintMode: createResponseDto.paintMode,
                timezone: createResponseDto.timezone,
                availableSlots: createResponseDto.availableSlots,
            },
        });
    }
    async getEventResponses(eventId) {
        return this.prisma.eventResponse.findMany({
            where: { eventId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getUserResponse(eventId, participantName) {
        return this.prisma.eventResponse.findUnique({
            where: {
                eventId_participantName: {
                    eventId,
                    participantName,
                },
            },
        });
    }
    async deleteResponse(eventId, participantName) {
        const response = await this.getUserResponse(eventId, participantName);
        if (!response) {
            throw new common_1.NotFoundException(`Response for user "${participantName}" in event "${eventId}" not found`);
        }
        await this.prisma.eventResponse.delete({
            where: {
                eventId_participantName: {
                    eventId,
                    participantName,
                },
            },
        });
    }
    async getEventStats(eventId) {
        const responses = await this.prisma.eventResponse.findMany({
            where: { eventId },
            select: {
                updatedAt: true,
            },
        });
        const lastUpdated = responses.length > 0
            ? responses.reduce((latest, response) => response.updatedAt > latest ? response.updatedAt : latest, responses[0].updatedAt)
            : null;
        return {
            totalParticipants: responses.length,
            responseCount: responses.length,
            lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
        };
    }
};
exports.ResponsesService = ResponsesService;
exports.ResponsesService = ResponsesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResponsesService);
//# sourceMappingURL=responses.service.js.map