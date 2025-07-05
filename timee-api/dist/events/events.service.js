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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EventsService = class EventsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateTCode() {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `tc-${randomNum}`;
    }
    async create(createEventDto) {
        const { eventType, ...eventData } = createEventDto;
        const eventId = eventData.id || this.generateTCode();
        let prismaEventType;
        if (eventType === 'group') {
            prismaEventType = 'GROUP';
        }
        else if (eventType === 'one-on-one') {
            prismaEventType = 'ONE_ON_ONE';
        }
        else {
            prismaEventType = 'GROUP';
        }
        return this.prisma.event.create({
            data: {
                ...eventData,
                id: eventId,
                startDate: new Date(createEventDto.startDate),
                endDate: new Date(createEventDto.endDate),
                eventType: prismaEventType,
            },
            include: {
                responses: true,
            },
        });
    }
    async findAll() {
        return this.prisma.event.findMany({
            include: {
                responses: {
                    select: {
                        id: true,
                        participantName: true,
                        participantEmail: true,
                        userInitials: true,
                        paintMode: true,
                        timezone: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
                _count: {
                    select: {
                        responses: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        return this.prisma.event.findUnique({
            where: { id },
            include: {
                responses: true,
            },
        });
    }
    async update(id, updateEventDto) {
        const { eventType, startDate, endDate, ...updateData } = updateEventDto;
        const data = { ...updateData };
        if (startDate) {
            data.startDate = new Date(startDate);
        }
        if (endDate) {
            data.endDate = new Date(endDate);
        }
        if (eventType) {
            data.eventType = eventType;
        }
        return this.prisma.event.update({
            where: { id },
            data,
            include: {
                responses: true,
            },
        });
    }
    async remove(id) {
        return this.prisma.event.delete({
            where: { id },
        });
    }
    async getEventResponses(eventId) {
        return this.prisma.eventResponse.findMany({
            where: { eventId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map