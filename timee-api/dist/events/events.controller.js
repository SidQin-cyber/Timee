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
var EventsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const create_event_frontend_dto_1 = require("./dto/create-event-frontend.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
let EventsController = EventsController_1 = class EventsController {
    constructor(eventsService) {
        this.eventsService = eventsService;
        this.logger = new common_1.Logger(EventsController_1.name);
    }
    healthCheck() {
        return {
            success: true,
            message: 'Events service is healthy',
            timestamp: new Date().toISOString(),
        };
    }
    async generateTcCode() {
        this.logger.log('Generating new tcCode');
        try {
            let tcCode;
            let attempts = 0;
            const maxAttempts = 10;
            do {
                tcCode = this.eventsService.generateTcCode();
                attempts++;
                if (attempts > maxAttempts) {
                    throw new Error('Failed to generate unique tcCode after multiple attempts');
                }
            } while (!(await this.eventsService.isTcCodeAvailable(tcCode)));
            return {
                success: true,
                data: { tcCode },
                message: 'tcCode generated successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error generating tcCode: ${error.message}`);
            throw new common_1.BadRequestException(error.message || 'Failed to generate tcCode');
        }
    }
    async checkTcCodeAvailability(tcCode) {
        this.logger.log(`Checking tcCode availability: ${tcCode}`);
        try {
            const isAvailable = await this.eventsService.isTcCodeAvailable(tcCode);
            return {
                success: true,
                data: { tcCode, isAvailable },
                message: isAvailable ? 'tcCode is available' : 'tcCode is already taken',
            };
        }
        catch (error) {
            this.logger.error(`Error checking tcCode availability: ${error.message}`);
            throw new common_1.BadRequestException(error.message || 'Failed to check tcCode availability');
        }
    }
    async findByTcCode(tcCode) {
        this.logger.log(`Finding event by tcCode: ${tcCode}`);
        try {
            const event = await this.eventsService.findByTcCode(tcCode);
            return {
                success: true,
                data: event,
                message: 'Event found successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error finding event: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to find event');
        }
    }
    async findAll(page = '1', limit = '10') {
        this.logger.log(`Finding all events (page: ${page}, limit: ${limit})`);
        try {
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const result = await this.eventsService.findAll(pageNum, limitNum);
            return {
                success: true,
                data: result.events,
                pagination: result.pagination,
                message: 'Events fetched successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error finding events: ${error.message}`);
            throw new common_1.BadRequestException(error.message || 'Failed to fetch events');
        }
    }
    async createEventFromFrontend(createEventDto) {
        this.logger.log(`Creating event from frontend with data: ${JSON.stringify(createEventDto)}`);
        try {
            let tcCode;
            if (createEventDto.id) {
                tcCode = createEventDto.id;
                if (tcCode.startsWith('tc-')) {
                    tcCode = tcCode.substring(3);
                }
                if (tcCode.length !== 6 || !/^\d{6}$/.test(tcCode)) {
                    throw new common_1.BadRequestException('活动代码必须是6位数字');
                }
            }
            else {
                tcCode = this.eventsService.generateTcCode();
                this.logger.log(`Auto-generated TC Code: ${tcCode}`);
            }
            const internalDto = {
                tcCode: tcCode,
            };
            if (createEventDto.title) {
                internalDto.title = createEventDto.title;
            }
            if (createEventDto.description) {
                internalDto.description = createEventDto.description;
            }
            if (createEventDto.startDate) {
                internalDto.startDate = createEventDto.startDate;
            }
            if (createEventDto.endDate) {
                internalDto.endDate = createEventDto.endDate;
            }
            if (createEventDto.timezone) {
                internalDto.timezone = createEventDto.timezone;
            }
            const result = await this.eventsService.createEvent(internalDto);
            return {
                success: true,
                data: result,
                message: 'Event created successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error creating event from frontend: ${error.message}`);
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to create event');
        }
    }
    async createEvent(createEventDto) {
        this.logger.log(`Creating event with data: ${JSON.stringify(createEventDto)}`);
        try {
            const result = await this.eventsService.createEvent(createEventDto);
            return {
                success: true,
                data: result,
                message: 'Event created successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error creating event: ${error.message}`);
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to create event');
        }
    }
    async findById(id) {
        this.logger.log(`Finding event by ID: ${id}`);
        try {
            const event = await this.eventsService.findById(id);
            return {
                success: true,
                data: event,
                message: 'Event found successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error finding event: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to find event');
        }
    }
    async updateEvent(id, updateEventDto) {
        this.logger.log(`Updating event: ${id}`);
        try {
            const event = await this.eventsService.updateEvent(id, updateEventDto);
            return {
                success: true,
                data: event,
                message: 'Event updated successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error updating event: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to update event');
        }
    }
    async deleteEvent(id) {
        this.logger.log(`Deleting event: ${id}`);
        try {
            await this.eventsService.deleteEvent(id);
            return {
                success: true,
                message: 'Event deleted successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error deleting event: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to delete event');
        }
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('generate/tc-code'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "generateTcCode", null);
__decorate([
    (0, common_1.Get)('check/tc-code/:tcCode'),
    __param(0, (0, common_1.Param)('tcCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "checkTcCodeAvailability", null);
__decorate([
    (0, common_1.Get)('tc/:tcCode'),
    __param(0, (0, common_1.Param)('tcCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findByTcCode", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('frontend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_frontend_dto_1.CreateEventFrontendDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "createEventFromFrontend", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "deleteEvent", null);
exports.EventsController = EventsController = EventsController_1 = __decorate([
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map