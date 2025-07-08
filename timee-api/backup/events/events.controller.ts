import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Logger, 
  HttpCode, 
  HttpStatus, 
  BadRequestException, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventFrontendDto } from './dto/create-event-frontend.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  /**
   * 健康检查端点 - 必须放在 :id 路由之前
   * GET /api/events/health
   */
  @Get('health')
  healthCheck() {
    return {
      success: true,
      message: 'Events service is healthy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 生成新的 tcCode - 必须放在 :id 路由之前
   * GET /api/events/generate/tc-code
   */
  @Get('generate/tc-code')
  async generateTcCode() {
    this.logger.log('Generating new tcCode');
    
    try {
      let tcCode: string;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        tcCode = this.eventsService.generateTcCode();
        attempts++;
        
        if (attempts > maxAttempts) {
          throw new Error('Failed to generate unique tcCode after multiple attempts');
        }
      } while (!(await this.eventsService.isTcCodeAvailable(tcCode)));
      
      return {
        success: true,
        data: { tcCode },
        message: 'tcCode generated successfully',
      };
    } catch (error) {
      this.logger.error(`Error generating tcCode: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to generate tcCode');
    }
  }

  /**
   * 检查 tcCode 是否可用 - 必须放在 :id 路由之前
   * GET /api/events/check/tc-code/:tcCode
   */
  @Get('check/tc-code/:tcCode')
  async checkTcCodeAvailability(@Param('tcCode') tcCode: string) {
    this.logger.log(`Checking tcCode availability: ${tcCode}`);
    
    try {
      const isAvailable = await this.eventsService.isTcCodeAvailable(tcCode);
      
      return {
        success: true,
        data: { tcCode, isAvailable },
        message: isAvailable ? 'tcCode is available' : 'tcCode is already taken',
      };
    } catch (error) {
      this.logger.error(`Error checking tcCode availability: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to check tcCode availability');
    }
  }

  /**
   * 根据 tcCode 获取活动 - 必须放在 :id 路由之前
   * GET /api/events/tc/:tcCode
   */
  @Get('tc/:tcCode')
  async findByTcCode(@Param('tcCode') tcCode: string) {
    this.logger.log(`Finding event by tcCode: ${tcCode}`);
    
    try {
      const event = await this.eventsService.findByTcCode(tcCode);
      
      return {
        success: true,
        data: event,
        message: 'Event found successfully',
      };
    } catch (error) {
      this.logger.error(`Error finding event: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(error.message || 'Failed to find event');
    }
  }

  /**
   * 获取所有活动
   * GET /api/events
   */
  @Get()
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    this.logger.log(`Finding all events (page: ${page}, limit: ${limit})`);
    
    try {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      
      const result = await this.eventsService.findAll(pageNum, limitNum);
      
      return {
        success: true,
        data: result.events,
        pagination: result.pagination,
        message: 'Events fetched successfully',
      };
    } catch (error) {
      this.logger.error(`Error finding events: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to fetch events');
    }
  }

  /**
   * 创建活动 - 前端专用
   * POST /api/events/frontend
   */
  @Post('frontend')
  @HttpCode(HttpStatus.CREATED)
  async createEventFromFrontend(@Body() createEventDto: CreateEventFrontendDto) {
    this.logger.log(`Creating event from frontend with data: ${JSON.stringify(createEventDto)}`);
    
    try {
      // 获取或生成活动代码
      let tcCode: string;
      
      if (createEventDto.id) {
        // 从前端的id字段中提取tcCode
        // 前端发送格式: "tc-123456" 或 "123456"
        tcCode = createEventDto.id;
        if (tcCode.startsWith('tc-')) {
          tcCode = tcCode.substring(3); // 去掉 "tc-" 前缀
        }
        
        // 验证tcCode长度和格式
        if (tcCode.length !== 6 || !/^\d{6}$/.test(tcCode)) {
          throw new BadRequestException('活动代码必须是6位数字');
        }
      } else {
        // 自动生成6位数字TC Code
        tcCode = this.eventsService.generateTcCode();
        this.logger.log(`Auto-generated TC Code: ${tcCode}`);
      }

      // 转换前端DTO到内部DTO，只传递有值的字段
      const internalDto: CreateEventDto = {
        tcCode: tcCode, // 使用提取或生成的6位tcCode
      };
      
      if (createEventDto.title) {
        internalDto.title = createEventDto.title;
      }
      
      if (createEventDto.description) {
        internalDto.description = createEventDto.description;
      }
      
      if (createEventDto.startDate) {
        internalDto.startDate = createEventDto.startDate;
      }
      
      if (createEventDto.endDate) {
        internalDto.endDate = createEventDto.endDate;
      }
      
      if (createEventDto.timezone) {
        internalDto.timezone = createEventDto.timezone;
      }

      const result = await this.eventsService.createEvent(internalDto);
      
      return {
        success: true,
        data: result,
        message: 'Event created successfully',
      };
    } catch (error) {
      this.logger.error(`Error creating event from frontend: ${error.message}`);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new BadRequestException(error.message || 'Failed to create event');
    }
  }

  /**
   * 创建活动 - 标准API
   * POST /api/events
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(@Body() createEventDto: CreateEventDto) {
    this.logger.log(`Creating event with data: ${JSON.stringify(createEventDto)}`);
    
    try {
      const result = await this.eventsService.createEvent(createEventDto);
      
      return {
        success: true,
        data: result,
        message: 'Event created successfully',
      };
    } catch (error) {
      this.logger.error(`Error creating event: ${error.message}`);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new BadRequestException(error.message || 'Failed to create event');
    }
  }

  /**
   * 根据 ID 获取活动 - 通用路由，必须放在最后
   * GET /api/events/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    this.logger.log(`Finding event by ID: ${id}`);
    
    try {
      const event = await this.eventsService.findById(id);
      
      return {
        success: true,
        data: event,
        message: 'Event found successfully',
      };
    } catch (error) {
      this.logger.error(`Error finding event: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(error.message || 'Failed to find event');
    }
  }

  /**
   * 更新活动
   * PUT /api/events/:id
   */
  @Put(':id')
  async updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    this.logger.log(`Updating event: ${id}`);
    
    try {
      const event = await this.eventsService.updateEvent(id, updateEventDto);
      
      return {
        success: true,
        data: event,
        message: 'Event updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating event: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(error.message || 'Failed to update event');
    }
  }

  /**
   * 删除活动
   * DELETE /api/events/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id') id: string) {
    this.logger.log(`Deleting event: ${id}`);
    
    try {
      await this.eventsService.deleteEvent(id);
      
      return {
        success: true,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting event: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(error.message || 'Failed to delete event');
    }
  }
} 