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
var ResponsesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsesController = void 0;
const common_1 = require("@nestjs/common");
const responses_service_1 = require("./responses.service");
const create_response_dto_1 = require("./dto/create-response.dto");
let ResponsesController = ResponsesController_1 = class ResponsesController {
    constructor(responsesService) {
        this.responsesService = responsesService;
        this.logger = new common_1.Logger(ResponsesController_1.name);
    }
    healthCheck() {
        return {
            success: true,
            message: 'Responses service is healthy',
            timestamp: new Date().toISOString(),
        };
    }
    async getEventRoomData(eventId) {
        this.logger.log(`🔍 Fetching room data for event: ${eventId}`);
        try {
            const roomData = await this.responsesService.getEventRoomData(eventId);
            return {
                success: true,
                data: roomData,
                message: 'Room data fetched successfully',
            };
        }
        catch (error) {
            this.logger.error(`❌ Failed to fetch room data:`, error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to fetch room data');
        }
    }
    async getUserResponse(eventId, participantName) {
        this.logger.log(`🔍 Fetching user response for ${participantName} in event: ${eventId}`);
        try {
            const userResponse = await this.responsesService.getUserResponse(eventId, participantName);
            return {
                success: true,
                data: userResponse,
                message: userResponse ? 'User response fetched successfully' : 'No response found for user',
            };
        }
        catch (error) {
            this.logger.error(`❌ Failed to fetch user response:`, error);
            throw new common_1.BadRequestException(error.message || 'Failed to fetch user response');
        }
    }
    async findAll(page = '1', limit = '10') {
        this.logger.log(`🔍 Fetching all responses (page: ${page}, limit: ${limit})`);
        try {
            const responses = await this.responsesService.findAll();
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedResponses = responses.slice(startIndex, endIndex);
            return {
                success: true,
                data: paginatedResponses,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: responses.length,
                    hasNext: endIndex < responses.length,
                    hasPrev: pageNum > 1,
                },
                message: 'Responses fetched successfully',
            };
        }
        catch (error) {
            this.logger.error(`❌ Failed to fetch responses:`, error);
            throw new common_1.BadRequestException(error.message || 'Failed to fetch responses');
        }
    }
    async createOrUpdateResponse(createResponseDto) {
        this.logger.log(`📝 Creating/updating response for user: ${createResponseDto.participantName}`);
        try {
            const response = await this.responsesService.createOrUpdateResponse(createResponseDto);
            this.logger.log(`✅ Response created/updated successfully: ${response.id}`);
            return {
                success: true,
                data: response,
                message: 'Response created/updated successfully',
            };
        }
        catch (error) {
            this.logger.error(`❌ Failed to create/update response:`, error);
            throw new common_1.BadRequestException(error.message || 'Failed to create/update response');
        }
    }
    async findOne(id) {
        this.logger.log(`🔍 Fetching response: ${id}`);
        try {
            const response = await this.responsesService.findOne(id);
            return {
                success: true,
                data: response,
                message: 'Response fetched successfully',
            };
        }
        catch (error) {
            this.logger.error(`❌ Failed to fetch response:`, error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to fetch response');
        }
    }
    async deleteResponse(id) {
        this.logger.log(`🗑️ Deleting response: ${id}`);
        try {
            await this.responsesService.deleteResponse(id);
            this.logger.log(`✅ Response deleted successfully: ${id}`);
            return {
                success: true,
                message: 'Response deleted successfully',
            };
        }
        catch (error) {
            this.logger.error(`❌ Failed to delete response:`, error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || 'Failed to delete response');
        }
    }
};
exports.ResponsesController = ResponsesController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ResponsesController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('room/:eventId'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "getEventRoomData", null);
__decorate([
    (0, common_1.Get)('user/:eventId/:participantName'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('participantName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "getUserResponse", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_response_dto_1.CreateResponseDto]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "createOrUpdateResponse", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "deleteResponse", null);
exports.ResponsesController = ResponsesController = ResponsesController_1 = __decorate([
    (0, common_1.Controller)('responses'),
    __metadata("design:paramtypes", [responses_service_1.ResponsesService])
], ResponsesController);
//# sourceMappingURL=responses.controller.js.map