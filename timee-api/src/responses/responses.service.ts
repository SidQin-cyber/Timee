import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResponseDto } from './dto/create-response.dto';

@Injectable()
export class ResponsesService {
  constructor(private prisma: PrismaService) {}

  async create(createResponseDto: CreateResponseDto) {
    const { paintMode, ...responseData } = createResponseDto;
    
    // 映射枚举值
    let prismaPaintMode;
    if (paintMode === 'available') {
      prismaPaintMode = 'AVAILABLE';
    } else if (paintMode === 'unavailable') {
      prismaPaintMode = 'UNAVAILABLE';
    } else {
      prismaPaintMode = 'AVAILABLE'; // 默认值
    }
    
    return this.prisma.eventResponse.create({
      data: {
        ...responseData,
        paintMode: prismaPaintMode as any,
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

  async findOne(id: string) {
    return this.prisma.eventResponse.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });
  }

  async update(id: string, updateResponseDto: Partial<CreateResponseDto>) {
    const { paintMode, ...updateData } = updateResponseDto;
    
    const data: any = { ...updateData };
    
    if (paintMode) {
      data.paintMode = paintMode as any;
    }

    return this.prisma.eventResponse.update({
      where: { id },
      data,
      include: {
        event: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.eventResponse.delete({
      where: { id },
    });
  }

  async findByEvent(eventId: string) {
    return this.prisma.eventResponse.findMany({
      where: { eventId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
} 