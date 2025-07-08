import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新活动
   */
  async createEvent(createEventDto: CreateEventDto) {
    this.logger.log(`Creating event with tcCode: ${createEventDto.tcCode}`);
    this.logger.log(`Event data: ${JSON.stringify(createEventDto)}`);
    
    try {
      // 解析日期字符串（如果需要）
      let startDate = null;
      let endDate = null;
      
      if (createEventDto.startDate) {
        // 如果是YYYY-MM-DD格式，转换为ISO字符串
        if (createEventDto.startDate.length === 10) {
          startDate = new Date(createEventDto.startDate + 'T00:00:00.000Z');
        } else {
          startDate = new Date(createEventDto.startDate);
        }
      }
      
      if (createEventDto.endDate) {
        // 如果是YYYY-MM-DD格式，转换为ISO字符串
        if (createEventDto.endDate.length === 10) {
          endDate = new Date(createEventDto.endDate + 'T23:59:59.999Z');
        } else {
          endDate = new Date(createEventDto.endDate);
        }
      }

      const eventData = {
        id: randomUUID(),
        tcCode: createEventDto.tcCode,
        title: createEventDto.title || `Event ${createEventDto.tcCode}`,
        description: createEventDto.description,
        startDate: startDate,
        endDate: endDate,
        timezone: createEventDto.timezone || 'UTC',
      };

      this.logger.log(`Event data to be created: ${JSON.stringify(eventData)}`);
      this.logger.log(`Event data field lengths: tcCode=${eventData.tcCode?.length}, title=${eventData.title?.length}, description=${eventData.description?.length}, timezone=${eventData.timezone?.length}`);

      const event = await this.prisma.event.create({
        data: eventData,
      });

      // 记录操作日志
      await this.prisma.eventLog.create({
        data: {
          eventId: event.id,
          action: 'EVENT_CREATED',
          details: {
            tcCode: event.tcCode,
            title: event.title,
            timezone: event.timezone,
          },
        },
      });

      this.logger.log(`Event created successfully: ${event.id}`);
      return {
        id: event.id,
        tcCode: event.tcCode,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        timezone: event.timezone,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create event: ${error.message}`);
      this.logger.error(`Error details: ${JSON.stringify(error)}`);
      
      // 如果是重复tcCode错误，返回更友好的消息
      if (error.code === 'P2002' && error.meta?.target?.includes('tc_code')) {
        throw new ConflictException(`活动代码 ${createEventDto.tcCode} 已存在，请使用其他代码`);
      }
      
      throw error;
    }
  }

  /**
   * 根据 tcCode 获取活动
   */
  async findByTcCode(tcCode: string) {
    this.logger.log(`Finding event by tcCode: ${tcCode}`);
    
    const event = await this.prisma.event.findUnique({
      where: { tcCode },
      include: {
        participants: {
          include: {
            response: true,
          },
        },
        _count: {
          select: {
            participants: true,
            responses: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`活动代码 ${tcCode} 不存在`);
    }

    return {
      id: event.id,
      tcCode: event.tcCode,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      timezone: event.timezone,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      participants: event.participants.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        initials: p.initials,
        timezone: p.timezone,
        hasResponse: !!p.response,
      })),
      stats: {
        participantCount: event._count.participants,
        responseCount: event._count.responses,
      },
    };
  }

  /**
   * 根据 ID 获取活动
   */
  async findById(id: string) {
    this.logger.log(`Finding event by ID: ${id}`);
    
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            response: true,
          },
        },
        _count: {
          select: {
            participants: true,
            responses: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`活动 ID ${id} 不存在`);
    }

    return {
      id: event.id,
      tcCode: event.tcCode,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      timezone: event.timezone,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      participants: event.participants.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        initials: p.initials,
        timezone: p.timezone,
        hasResponse: !!p.response,
      })),
      stats: {
        participantCount: event._count.participants,
        responseCount: event._count.responses,
      },
    };
  }

  /**
   * 更新活动
   */
  async updateEvent(id: string, updateEventDto: UpdateEventDto) {
    this.logger.log(`Updating event: ${id}`);
    
    try {
      const event = await this.prisma.event.update({
        where: { id },
        data: {
          title: updateEventDto.title,
          description: updateEventDto.description,
          startDate: updateEventDto.startDate,
          endDate: updateEventDto.endDate,
          timezone: updateEventDto.timezone,
        },
      });

      // 记录操作日志
      await this.prisma.eventLog.create({
        data: {
          eventId: event.id,
          action: 'EVENT_UPDATED',
          details: {
            updatedFields: Object.keys(updateEventDto),
            ...updateEventDto,
          },
        },
      });

      this.logger.log(`Event updated successfully: ${event.id}`);
      return event;
    } catch (error) {
      this.logger.error(`Failed to update event: ${error.message}`);
      
      if (error.code === 'P2025') {
        throw new NotFoundException(`活动 ID ${id} 不存在`);
      }
      
      throw error;
    }
  }

  /**
   * 删除活动
   */
  async deleteEvent(id: string) {
    this.logger.log(`Deleting event: ${id}`);
    
    try {
      const event = await this.prisma.event.delete({
        where: { id },
      });

      this.logger.log(`Event deleted successfully: ${event.id}`);
      return event;
    } catch (error) {
      this.logger.error(`Failed to delete event: ${error.message}`);
      
      if (error.code === 'P2025') {
        throw new NotFoundException(`活动 ID ${id} 不存在`);
      }
      
      throw error;
    }
  }

  /**
   * 获取所有活动
   */
  async findAll(page: number = 1, limit: number = 10) {
    this.logger.log(`Finding all events (page: ${page}, limit: ${limit})`);
    
    const skip = (page - 1) * limit;
    
    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              participants: true,
              responses: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.event.count(),
    ]);

    return {
      events: events.map(event => ({
        id: event.id,
        tcCode: event.tcCode,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        timezone: event.timezone,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        stats: {
          participantCount: event._count.participants,
          responseCount: event._count.responses,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 生成随机的 tcCode (6位数字)
   */
  generateTcCode(): string {
    // 生成6位数字，范围从100000到999999
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * 检查 tcCode 是否可用
   */
  async isTcCodeAvailable(tcCode: string): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: { tcCode },
    });
    return !event;
  }
} 