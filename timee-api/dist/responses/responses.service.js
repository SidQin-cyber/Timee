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
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createResponseDto) {
        const { paintMode, ...responseData } = createResponseDto;
        let prismaPaintMode;
        if (paintMode === 'available') {
            prismaPaintMode = 'AVAILABLE';
        }
        else if (paintMode === 'unavailable') {
            prismaPaintMode = 'UNAVAILABLE';
        }
        else {
            prismaPaintMode = 'AVAILABLE';
        }
        return this.prisma.eventResponse.create({
            data: {
                ...responseData,
                paintMode: prismaPaintMode,
            },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
        });
    }
    async findAll() {
        return this.prisma.eventResponse.findMany({
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        return this.prisma.eventResponse.findUnique({
            where: { id },
            include: {
                event: true,
            },
        });
    }
    async update(id, updateResponseDto) {
        const { paintMode, ...updateData } = updateResponseDto;
        const data = { ...updateData };
        if (paintMode) {
            data.paintMode = paintMode;
        }
        return this.prisma.eventResponse.update({
            where: { id },
            data,
            include: {
                event: true,
            },
        });
    }
    async remove(id) {
        return this.prisma.eventResponse.delete({
            where: { id },
        });
    }
    async findByEvent(eventId) {
        return this.prisma.eventResponse.findMany({
            where: { eventId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
};
exports.ResponsesService = ResponsesService;
exports.ResponsesService = ResponsesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResponsesService);
//# sourceMappingURL=responses.service.js.map