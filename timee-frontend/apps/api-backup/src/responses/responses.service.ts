import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResponseDto } from './dto/create-response.dto';

@Injectable()
export class ResponsesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit or update user response
   */
  async submitResponse(createResponseDto: CreateResponseDto): Promise<any> {
    if (!createResponseDto.eventId) {
      throw new Error('Event ID is required');
    }

    return this.prisma.eventResponse.upsert({
      where: {
        eventId_participantName: {
          eventId: createResponseDto.eventId,
          participantName: createResponseDto.participantName,
        },
      },
      update: {
        participantEmail: createResponseDto.participantEmail,
        userInitials: createResponseDto.userInitials,
        paintMode: createResponseDto.paintMode as any,
        timezone: createResponseDto.timezone,
        availableSlots: createResponseDto.availableSlots,
      },
      create: {
        eventId: createResponseDto.eventId,
        participantName: createResponseDto.participantName,
        participantEmail: createResponseDto.participantEmail,
        userInitials: createResponseDto.userInitials,
        paintMode: createResponseDto.paintMode as any,
        timezone: createResponseDto.timezone,
        availableSlots: createResponseDto.availableSlots,
      },
    });
  }

  /**
   * Get all responses for an event
   */
  async getEventResponses(eventId: string): Promise<any[]> {
    return this.prisma.eventResponse.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get specific user response
   */
  async getUserResponse(eventId: string, participantName: string): Promise<any | null> {
    return this.prisma.eventResponse.findUnique({
      where: {
        eventId_participantName: {
          eventId,
          participantName,
        },
      },
    });
  }

  /**
   * Delete user response
   */
  async deleteResponse(eventId: string, participantName: string): Promise<void> {
    const response = await this.getUserResponse(eventId, participantName);
    
    if (!response) {
      throw new NotFoundException(`Response for user "${participantName}" in event "${eventId}" not found`);
    }

    await this.prisma.eventResponse.delete({
      where: {
        eventId_participantName: {
          eventId,
          participantName,
        },
      },
    });
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: string): Promise<{
    totalParticipants: number;
    responseCount: number;
    lastUpdated: string | null;
  }> {
    const responses = await this.prisma.eventResponse.findMany({
      where: { eventId },
      select: {
        updatedAt: true,
      },
    });

    const lastUpdated = responses.length > 0 
      ? responses.reduce((latest, response) => 
          response.updatedAt > latest ? response.updatedAt : latest, 
          responses[0].updatedAt
        )
      : null;

    return {
      totalParticipants: responses.length,
      responseCount: responses.length,
      lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
    };
  }
} 