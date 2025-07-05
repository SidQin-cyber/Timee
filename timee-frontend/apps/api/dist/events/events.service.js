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
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateTCode() {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `tc-${randomNum}`;
    }
    async create(createEventDto) {
        const tCode = createEventDto.customTCode || this.generateTCode();
        return this.prisma.event.create({
            data: {
                id: tCode,
                title: createEventDto.title,
                description: createEventDto.description,
                timezone: createEventDto.timezone,
                startDate: new Date(createEventDto.startDate),
                endDate: new Date(createEventDto.endDate),
                startTime: createEventDto.startTime,
                endTime: createEventDto.endTime,
                eventType: createEventDto.eventType,
                includeTime: createEventDto.includeTime,
                selectedDates: createEventDto.selectedDates ? JSON.stringify(createEventDto.selectedDates) : null,
            },
        });
    }
    async findAll() {
        return this.prisma.event.findMany({
            include: {
                responses: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                responses: true,
            },
        });
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID "${id}" not found`);
        }
        return event;
    }
    async update(id, updateData) {
        const event = await this.findOne(id);
        const updatePayload = {};
        if (updateData.title !== undefined)
            updatePayload.title = updateData.title;
        if (updateData.description !== undefined)
            updatePayload.description = updateData.description;
        if (updateData.timezone !== undefined)
            updatePayload.timezone = updateData.timezone;
        if (updateData.startDate !== undefined)
            updatePayload.startDate = new Date(updateData.startDate);
        if (updateData.endDate !== undefined)
            updatePayload.endDate = new Date(updateData.endDate);
        if (updateData.startTime !== undefined)
            updatePayload.startTime = updateData.startTime;
        if (updateData.endTime !== undefined)
            updatePayload.endTime = updateData.endTime;
        if (updateData.eventType !== undefined)
            updatePayload.eventType = updateData.eventType;
        if (updateData.includeTime !== undefined)
            updatePayload.includeTime = updateData.includeTime;
        if (updateData.selectedDates !== undefined) {
            updatePayload.selectedDates = JSON.stringify(updateData.selectedDates);
        }
        return this.prisma.event.update({
            where: { id },
            data: updatePayload,
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.event.delete({
            where: { id },
        });
    }
    async findRecent(limit = 10) {
        return this.prisma.event.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map