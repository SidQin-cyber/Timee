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
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let EventsService = EventsService_1 = class EventsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EventsService_1.name);
    }
    async createEvent(createEventDto) {
        this.logger.log(`Creating event with tcCode: ${createEventDto.tcCode}`);
        this.logger.log(`Event data: ${JSON.stringify(createEventDto)}`);
        try {
            let startDate = null;
            let endDate = null;
            if (createEventDto.startDate) {
                if (createEventDto.startDate.length === 10) {
                    startDate = new Date(createEventDto.startDate + 'T00:00:00.000Z');
                }
                else {
                    startDate = new Date(createEventDto.startDate);
                }
            }
            if (createEventDto.endDate) {
                if (createEventDto.endDate.length === 10) {
                    endDate = new Date(createEventDto.endDate + 'T23:59:59.999Z');
                }
                else {
                    endDate = new Date(createEventDto.endDate);
                }
            }
            const eventData = {
                id: (0, crypto_1.randomUUID)(),
                tcCode: createEventDto.tcCode,
                title: createEventDto.title || `Event ${createEventDto.tcCode}`,
                description: createEventDto.description,
                startDate: startDate,
                endDate: endDate,
                timezone: createEventDto.timezone || 'UTC',
            };
            this.logger.log(`Event data to be created: ${JSON.stringify(eventData)}`);
            this.logger.log(`Event data field lengths: tcCode=${eventData.tcCode?.length}, title=${eventData.title?.length}, description=${eventData.description?.length}, timezone=${eventData.timezone?.length}`);
            const event = await this.prisma.event.create({
                data: eventData,
            });
            await this.prisma.eventLog.create({
                data: {
                    eventId: event.id,
                    action: 'EVENT_CREATED',
                    details: {
                        tcCode: event.tcCode,
                        title: event.title,
                        timezone: event.timezone,
                    },
                },
            });
            this.logger.log(`Event created successfully: ${event.id}`);
            return {
                id: event.id,
                tcCode: event.tcCode,
                title: event.title,
                description: event.description,
                startDate: event.startDate,
                endDate: event.endDate,
                timezone: event.timezone,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create event: ${error.message}`);
            this.logger.error(`Error details: ${JSON.stringify(error)}`);
            if (error.code === 'P2002' && error.meta?.target?.includes('tc_code')) {
                throw new common_1.ConflictException(`活动代码 ${createEventDto.tcCode} 已存在，请使用其他代码`);
            }
            throw error;
        }
    }
    async findByTcCode(tcCode) {
        this.logger.log(`Finding event by tcCode: ${tcCode}`);
        const event = await this.prisma.event.findUnique({
            where: { tcCode },
            include: {
                participants: {
                    include: {
                        response: true,
                    },
                },
                _count: {
                    select: {
                        participants: true,
                        responses: true,
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException(`活动代码 ${tcCode} 不存在`);
        }
        return {
            id: event.id,
            tcCode: event.tcCode,
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            timezone: event.timezone,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            participants: event.participants.map(p => ({
                id: p.id,
                name: p.name,
                email: p.email,
                initials: p.initials,
                timezone: p.timezone,
                hasResponse: !!p.response,
            })),
            stats: {
                participantCount: event._count.participants,
                responseCount: event._count.responses,
            },
        };
    }
    async findById(id) {
        this.logger.log(`Finding event by ID: ${id}`);
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        response: true,
                    },
                },
                _count: {
                    select: {
                        participants: true,
                        responses: true,
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException(`活动 ID ${id} 不存在`);
        }
        return {
            id: event.id,
            tcCode: event.tcCode,
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            timezone: event.timezone,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            participants: event.participants.map(p => ({
                id: p.id,
                name: p.name,
                email: p.email,
                initials: p.initials,
                timezone: p.timezone,
                hasResponse: !!p.response,
            })),
            stats: {
                participantCount: event._count.participants,
                responseCount: event._count.responses,
            },
        };
    }
    async updateEvent(id, updateEventDto) {
        this.logger.log(`Updating event: ${id}`);
        try {
            const event = await this.prisma.event.update({
                where: { id },
                data: {
                    title: updateEventDto.title,
                    description: updateEventDto.description,
                    startDate: updateEventDto.startDate,
                    endDate: updateEventDto.endDate,
                    timezone: updateEventDto.timezone,
                },
            });
            await this.prisma.eventLog.create({
                data: {
                    eventId: event.id,
                    action: 'EVENT_UPDATED',
                    details: {
                        updatedFields: Object.keys(updateEventDto),
                        ...updateEventDto,
                    },
                },
            });
            this.logger.log(`Event updated successfully: ${event.id}`);
            return event;
        }
        catch (error) {
            this.logger.error(`Failed to update event: ${error.message}`);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`活动 ID ${id} 不存在`);
            }
            throw error;
        }
    }
    async deleteEvent(id) {
        this.logger.log(`Deleting event: ${id}`);
        try {
            const event = await this.prisma.event.delete({
                where: { id },
            });
            this.logger.log(`Event deleted successfully: ${event.id}`);
            return event;
        }
        catch (error) {
            this.logger.error(`Failed to delete event: ${error.message}`);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`活动 ID ${id} 不存在`);
            }
            throw error;
        }
    }
    async findAll(page = 1, limit = 10) {
        this.logger.log(`Finding all events (page: ${page}, limit: ${limit})`);
        const skip = (page - 1) * limit;
        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            participants: true,
                            responses: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.event.count(),
        ]);
        return {
            events: events.map(event => ({
                id: event.id,
                tcCode: event.tcCode,
                title: event.title,
                description: event.description,
                startDate: event.startDate,
                endDate: event.endDate,
                timezone: event.timezone,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
                stats: {
                    participantCount: event._count.participants,
                    responseCount: event._count.responses,
                },
            })),
            pagination: {
                page,
                limit,
                total,
                hasNext: skip + limit < total,
                hasPrev: page > 1,
            },
        };
    }
    generateTcCode() {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }
    async isTcCodeAvailable(tcCode) {
        const event = await this.prisma.event.findUnique({
            where: { tcCode },
        });
        return !event;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map