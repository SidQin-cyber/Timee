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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsesController = void 0;
const common_1 = require("@nestjs/common");
const responses_service_1 = require("./responses.service");
const create_response_dto_1 = require("./dto/create-response.dto");
let ResponsesController = class ResponsesController {
    responsesService;
    constructor(responsesService) {
        this.responsesService = responsesService;
    }
    async submitResponse(eventId, createResponseDto) {
        try {
            createResponseDto.eventId = eventId;
            const response = await this.responsesService.submitResponse(createResponseDto);
            return {
                statusCode: common_1.HttpStatus.CREATED,
                message: 'Response submitted successfully',
                data: response,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'Failed to submit response',
                error: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getEventResponses(eventId) {
        try {
            const responses = await this.responsesService.getEventResponses(eventId);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: 'Event responses fetched successfully',
                data: responses,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to fetch event responses',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteResponse(eventId, participantName) {
        try {
            await this.responsesService.deleteResponse(eventId, participantName);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: 'Response deleted successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                throw new common_1.HttpException({
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                    message: error.message,
                }, common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to delete response',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ResponsesController = ResponsesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_response_dto_1.CreateResponseDto]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "submitResponse", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "getEventResponses", null);
__decorate([
    (0, common_1.Delete)(':participantName'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('participantName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "deleteResponse", null);
exports.ResponsesController = ResponsesController = __decorate([
    (0, common_1.Controller)('events/:eventId/responses'),
    __metadata("design:paramtypes", [responses_service_1.ResponsesService])
], ResponsesController);
//# sourceMappingURL=responses.controller.js.map