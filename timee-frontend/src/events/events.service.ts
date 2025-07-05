import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    // Check if tcode already exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { tcode: createEventDto.tcode },
    });

    if (existingEvent) {
      throw new ConflictException('Event code already exists');
    }

    return this.prisma.event.create({
      data: createEventDto,
      include: {
        responses: true,
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

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        responses: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findByTcode(tcode: string) {
    const event = await this.prisma.event.findUnique({
      where: { tcode },
      include: {
        responses: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
      include: {
        responses: true,
      },
    });
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.delete({
      where: { id },
    });
  }

  async getStatistics(id: string) {
    const event = await this.findOne(id);
    
    const totalResponses = event.responses.length;
    const uniqueParticipants = new Set(event.responses.map(r => r.participantName)).size;
    
    // Calculate time slot statistics
    const timeSlotStats = event.timeSlots.reduce((acc, slot) => {
      const responses = event.responses.filter(r => r.timeSlot === slot);
      const available = responses.filter(r => r.availability === 'AVAILABLE').length;
      const maybe = responses.filter(r => r.availability === 'MAYBE').length;
      const unavailable = responses.filter(r => r.availability === 'UNAVAILABLE').length;
      
      acc[slot] = {
        available,
        maybe,
        unavailable,
        total: responses.length,
      };
      
      return acc;
    }, {} as Record<string, any>);

    return {
      totalResponses,
      uniqueParticipants,
      timeSlotStats,
      event: {
        id: event.id,
        title: event.title,
        tcode: event.tcode,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate,
      },
    };
  }
} 