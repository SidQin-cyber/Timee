import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../gateway/events.gateway';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';

@Injectable()
export class ResponsesService {
  private readonly logger = new Logger(ResponsesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * 创建或更新用户响应
   * 解决 Bug #1：确保实时同步的可靠性
   * 解决 Bug #2：提供完整的状态恢复数据
   */
  async createOrUpdateResponse(createResponseDto: CreateResponseDto) {
    this.logger.log(`📝 Creating/updating response for user: ${createResponseDto.participantName}`);

    return await this.prisma.executeTransaction(async (prisma) => {
      // 1. 首先确保事件存在
      const event = await prisma.event.findUnique({
        where: { id: createResponseDto.eventId },
        include: { participants: true }
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${createResponseDto.eventId} not found`);
      }

      // 2. 确保参与者存在（如果不存在则创建）
      const participant = await prisma.participant.upsert({
      where: {
          eventId_name: {
            eventId: createResponseDto.eventId,
            name: createResponseDto.participantName,
          },
        },
        create: {
          eventId: createResponseDto.eventId,
          name: createResponseDto.participantName,
          email: createResponseDto.participantEmail,
          initials: createResponseDto.userInitials,
          timezone: createResponseDto.timezone || 'UTC',
      },
      update: {
          email: createResponseDto.participantEmail,
          initials: createResponseDto.userInitials,
          timezone: createResponseDto.timezone || 'UTC',
        },
      });

      // 3. 创建或更新响应
      const response = await prisma.response.upsert({
        where: {
          participantId: participant.id,
      },
      create: {
          participantId: participant.id,
          eventId: createResponseDto.eventId,
          availability: createResponseDto.availability || [],
          paintMode: createResponseDto.paintMode || 'available',
          version: 1,
        },
        update: {
          availability: createResponseDto.availability || [],
          paintMode: createResponseDto.paintMode || 'available',
          version: {
            increment: 1,
          },
        },
        include: {
          participant: true,
          event: true,
        },
      });

      // 4. 记录操作日志
      await prisma.eventLog.create({
        data: {
          eventId: createResponseDto.eventId,
          action: 'RESPONSE_UPDATED',
          details: {
            participantId: participant.id,
            participantName: participant.name,
            availabilityCount: createResponseDto.availability?.length || 0,
            paintMode: createResponseDto.paintMode,
            version: response.version,
          },
          participantName: participant.name,
        },
      });

      this.logger.log(`✅ Response created/updated for ${participant.name} in event ${event.tcCode}`);
      return response;
    }).then(async (response) => {
      // 5. 事务提交成功后，发送 WebSocket 通知
      this.logger.log(`📡 Broadcasting response update for event: ${response.eventId}`);
      
      // 获取最新的房间数据
      const roomData = await this.getEventRoomData(response.eventId);
      
      // 发送响应更新通知 - 关键：确保所有连接的客户端都收到通知
      this.eventsGateway.notifyResponseUpdated(response.eventId, {
        response: response,
        roomData: roomData,
        timestamp: new Date().toISOString(),
      });

      return response;
    });
  }

  /**
   * 获取事件的完整房间数据
   * 解决 Bug #2：提供完整的状态恢复数据
   */
  async getEventRoomData(eventId: string) {
    this.logger.log(`🔍 Fetching room data for event: ${eventId}`);

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          include: {
            response: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // 构建热力图数据
    const heatmapData = this.buildHeatmapData(event.participants);

    return {
      event: {
        id: event.id,
        tcCode: event.tcCode,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        timezone: event.timezone,
      },
      participants: event.participants.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        initials: p.initials,
        timezone: p.timezone,
        hasResponse: !!p.response,
        response: p.response ? {
          id: p.response.id,
          availability: p.response.availability,
          paintMode: p.response.paintMode,
          version: p.response.version,
          updatedAt: p.response.updatedAt,
        } : null,
      })),
      heatmapData,
      participantCount: event.participants.length,
      responseCount: event.participants.filter(p => p.response).length,
    };
  }

  /**
   * 获取用户的个人响应数据
   * 解决 Bug #2：确保刷新后能正确恢复用户状态
   */
  async getUserResponse(eventId: string, participantName: string) {
    this.logger.log(`🔍 Fetching user response for ${participantName} in event: ${eventId}`);

    const participant = await this.prisma.participant.findUnique({
        where: {
        eventId_name: {
          eventId: eventId,
          name: participantName,
        },
      },
      include: {
        response: true,
      },
    });

    if (!participant) {
      this.logger.warn(`⚠️ Participant ${participantName} not found in event ${eventId}`);
      return null;
    }

    return {
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        initials: participant.initials,
        timezone: participant.timezone,
        },
      response: participant.response ? {
        id: participant.response.id,
        availability: participant.response.availability,
        paintMode: participant.response.paintMode,
        version: participant.response.version,
        updatedAt: participant.response.updatedAt,
      } : null,
    };
  }

  /**
   * 构建热力图数据
   */
  private buildHeatmapData(participants: any[]) {
    const heatmapData = new Map<string, number>();
    
    participants.forEach(participant => {
      if (participant.response && participant.response.availability) {
        const availability = participant.response.availability;
        
        // 确保 availability 是数组
        const slots = Array.isArray(availability) ? availability : [];
        
        slots.forEach((slot: any) => {
          if (slot && typeof slot === 'object') {
            // 根据不同的数据格式处理
            let slotKey: string;
            if (slot.date && slot.time) {
              slotKey = `${slot.date}_${slot.time}`;
            } else if (slot.timestamp) {
              slotKey = slot.timestamp;
            } else if (typeof slot === 'string') {
              slotKey = slot;
            } else {
              return; // 跳过无效的插槽
            }
            
            heatmapData.set(slotKey, (heatmapData.get(slotKey) || 0) + 1);
          }
        });
      }
    });

    return Array.from(heatmapData.entries()).map(([slot, count]) => ({
      slot,
      count,
      percentage: participants.length > 0 ? (count / participants.length) * 100 : 0,
    })).sort((a, b) => b.count - a.count);
  }

  /**
   * 删除响应
   */
  async deleteResponse(responseId: string) {
    this.logger.log(`🗑️ Deleting response: ${responseId}`);

    return await this.prisma.executeTransaction(async (prisma) => {
      const response = await prisma.response.findUnique({
        where: { id: responseId },
        include: { participant: true },
      });

      if (!response) {
        throw new NotFoundException(`Response with ID ${responseId} not found`);
      }

      await prisma.response.delete({
        where: { id: responseId },
      });

      // 记录操作日志
      await prisma.eventLog.create({
        data: {
          eventId: response.eventId,
          action: 'RESPONSE_DELETED',
          details: {
            participantId: response.participantId,
            participantName: response.participant.name,
            responseId: responseId,
          },
          participantName: response.participant.name,
          },
      });

      return response;
    }).then(async (response) => {
      // 发送删除通知
      this.eventsGateway.notifyResponseDeleted(response.eventId, responseId);
      
      // 获取更新后的房间数据
      const roomData = await this.getEventRoomData(response.eventId);
      this.eventsGateway.notifyResponseUpdated(response.eventId, {
        roomData: roomData,
        timestamp: new Date().toISOString(),
      });

      return response;
    });
  }

  /**
   * 获取所有响应
   */
  async findAll() {
    return await this.prisma.response.findMany({
      include: {
        participant: true,
        event: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * 获取单个响应
   */
  async findOne(id: string) {
    const response = await this.prisma.response.findUnique({
      where: { id },
      include: {
        participant: true,
        event: true,
      },
    });

    if (!response) {
      throw new NotFoundException(`Response with ID ${id} not found`);
    }

    return response;
  }
} 