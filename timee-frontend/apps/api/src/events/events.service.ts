import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique T-Code
   */
  private generateTCode(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `tc-${randomNum}`;
  }

  /**
   * Create a new event
   */
  async create(createEventDto: CreateEventDto): Promise<any> {
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

  /**
   * Find all events
   */
  async findAll(): Promise<any[]> {
    return this.prisma.event.findMany({
      include: {
        responses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find an event by ID
   */
  async findOne(id: string): Promise<any> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        responses: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return event;
  }

  /**
   * Update an event
   */
  async update(id: string, updateData: Partial<CreateEventDto>): Promise<any> {
    const event = await this.findOne(id);
    
    const updatePayload: any = {};
    
    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.description !== undefined) updatePayload.description = updateData.description;
    if (updateData.timezone !== undefined) updatePayload.timezone = updateData.timezone;
    if (updateData.startDate !== undefined) updatePayload.startDate = new Date(updateData.startDate);
    if (updateData.endDate !== undefined) updatePayload.endDate = new Date(updateData.endDate);
    if (updateData.startTime !== undefined) updatePayload.startTime = updateData.startTime;
    if (updateData.endTime !== undefined) updatePayload.endTime = updateData.endTime;
    if (updateData.eventType !== undefined) updatePayload.eventType = updateData.eventType;
    if (updateData.includeTime !== undefined) updatePayload.includeTime = updateData.includeTime;
    if (updateData.selectedDates !== undefined) {
      updatePayload.selectedDates = JSON.stringify(updateData.selectedDates);
    }

    return this.prisma.event.update({
      where: { id },
      data: updatePayload,
    });
  }

  /**
   * Delete an event
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists
    
    await this.prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Get recent events
   */
  async findRecent(limit: number = 10): Promise<any[]> {
    return this.prisma.event.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
} 