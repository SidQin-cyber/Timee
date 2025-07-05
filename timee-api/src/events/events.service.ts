import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  private generateTCode(): string {
    // Generate 6-digit random number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `tc-${randomNum}`;
  }

  async create(createEventDto: CreateEventDto) {
    const { eventType, ...eventData } = createEventDto;
    
    // Generate T-Code if not provided
    const eventId = eventData.id || this.generateTCode();
    
    // 映射枚举值
    let prismaEventType;
    if (eventType === 'group') {
      prismaEventType = 'GROUP';
    } else if (eventType === 'one-on-one') {
      prismaEventType = 'ONE_ON_ONE';
    } else {
      prismaEventType = 'GROUP'; // 默认值
    }
    
    return this.prisma.event.create({
      data: {
        ...eventData,
        id: eventId,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        eventType: prismaEventType as any,
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
            // 不包含 availableSlots 以减少数据传输
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

  async findOne(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        responses: true,
      },
    });
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const { eventType, startDate, endDate, ...updateData } = updateEventDto;
    
    const data: any = { ...updateData };
    
    if (startDate) {
      data.startDate = new Date(startDate);
    }
    
    if (endDate) {
      data.endDate = new Date(endDate);
    }
    
    if (eventType) {
      data.eventType = eventType as any;
    }

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        responses: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.event.delete({
      where: { id },
    });
  }

  async getEventResponses(eventId: string) {
    return this.prisma.eventResponse.findMany({
      where: { eventId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
} 