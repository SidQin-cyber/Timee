import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';

@Injectable()
export class ResponsesService {
  constructor(private prisma: PrismaService) {}

  async create(createResponseDto: CreateResponseDto) {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: createResponseDto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if response already exists for this participant and time slot
    const existingResponse = await this.prisma.eventResponse.findFirst({
      where: {
        eventId: createResponseDto.eventId,
        participantName: createResponseDto.participantName,
        timeSlot: createResponseDto.timeSlot,
      },
    });

    if (existingResponse) {
      throw new ConflictException('Response already exists for this participant and time slot');
    }

    return this.prisma.eventResponse.create({
      data: createResponseDto,
    });
  }

  async findAll() {
    return this.prisma.eventResponse.findMany({
      include: {
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByEvent(eventId: string) {
    return this.prisma.eventResponse.findMany({
      where: { eventId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByParticipant(eventId: string, participantName: string) {
    return this.prisma.eventResponse.findMany({
      where: {
        eventId,
        participantName,
      },
      orderBy: {
        timeSlot: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const response = await this.prisma.eventResponse.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    return response;
  }

  async update(id: string, updateResponseDto: UpdateResponseDto) {
    const response = await this.prisma.eventResponse.findUnique({
      where: { id },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    return this.prisma.eventResponse.update({
      where: { id },
      data: updateResponseDto,
    });
  }

  async remove(id: string) {
    const response = await this.prisma.eventResponse.findUnique({
      where: { id },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    return this.prisma.eventResponse.delete({
      where: { id },
    });
  }

  async removeByParticipant(eventId: string, participantName: string) {
    return this.prisma.eventResponse.deleteMany({
      where: {
        eventId,
        participantName,
      },
    });
  }

  async bulkCreateOrUpdate(eventId: string, participantName: string, responses: Array<{
    timeSlot: string;
    availability: string;
    note?: string;
  }>) {
    // First, delete existing responses for this participant
    await this.removeByParticipant(eventId, participantName);

    // Then create new responses
    const createPromises = responses.map(response => 
      this.prisma.eventResponse.create({
        data: {
          eventId,
          participantName,
          timeSlot: response.timeSlot,
          availability: response.availability as any,
          note: response.note,
        },
      })
    );

    return Promise.all(createPromises);
  }
} 