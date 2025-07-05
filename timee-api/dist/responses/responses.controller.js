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
    constructor(responsesService) {
        this.responsesService = responsesService;
    }
    async create(createResponseDto) {
        try {
            return await this.responsesService.create(createResponseDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create response', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async findAll() {
        return this.responsesService.findAll();
    }
    async findOne(id) {
        const response = await this.responsesService.findOne(id);
        if (!response) {
            throw new common_1.HttpException('Response not found', common_1.HttpStatus.NOT_FOUND);
        }
        return response;
    }
    async update(id, updateResponseDto) {
        try {
            return await this.responsesService.update(id, updateResponseDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update response', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async remove(id) {
        try {
            return await this.responsesService.remove(id);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to delete response', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async findByEvent(eventId) {
        return this.responsesService.findByEvent(eventId);
    }
};
exports.ResponsesController = ResponsesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_response_dto_1.CreateResponseDto]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResponsesController.prototype, "findByEvent", null);
exports.ResponsesController = ResponsesController = __decorate([
    (0, common_1.Controller)('responses'),
    __metadata("design:paramtypes", [responses_service_1.ResponsesService])
], ResponsesController);
//# sourceMappingURL=responses.controller.js.map