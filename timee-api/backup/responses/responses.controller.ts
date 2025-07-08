import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';

@Controller('responses')
export class ResponsesController {
  private readonly logger = new Logger(ResponsesController.name);

  constructor(private readonly responsesService: ResponsesService) {}

  /**
   * 健康检查端点 - 必须放在 :id 路由之前
   * GET /api/responses/health
   */
  @Get('health')
  healthCheck() {
    return {
      success: true,
      message: 'Responses service is healthy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取事件的完整房间数据 - 必须放在 :id 路由之前
   * GET /api/responses/room/:eventId
   */
  @Get('room/:eventId')
  async getEventRoomData(@Param('eventId') eventId: string) {
    this.logger.log(`🔍 Fetching room data for event: ${eventId}`);
    
    try {
      const roomData = await this.responsesService.getEventRoomData(eventId);
      
      return {
        success: true,
        data: roomData,
        message: 'Room data fetched successfully',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch room data:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to fetch room data');
    }
  }

  /**
   * 获取用户的个人响应数据 - 必须放在 :id 路由之前
   * GET /api/responses/user/:eventId/:participantName
   */
  @Get('user/:eventId/:participantName')
  async getUserResponse(
    @Param('eventId') eventId: string,
    @Param('participantName') participantName: string,
  ) {
    this.logger.log(`🔍 Fetching user response for ${participantName} in event: ${eventId}`);
    
    try {
      const userResponse = await this.responsesService.getUserResponse(eventId, participantName);
      
      return {
        success: true,
        data: userResponse,
        message: userResponse ? 'User response fetched successfully' : 'No response found for user',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch user response:`, error);
      throw new BadRequestException(error.message || 'Failed to fetch user response');
    }
  }

  /**
   * 获取所有响应
   * GET /api/responses
   */
  @Get()
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    this.logger.log(`🔍 Fetching all responses (page: ${page}, limit: ${limit})`);
    
    try {
      const responses = await this.responsesService.findAll();
      
      // 简单的分页逻辑
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedResponses = responses.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedResponses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: responses.length,
          hasNext: endIndex < responses.length,
          hasPrev: pageNum > 1,
        },
        message: 'Responses fetched successfully',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch responses:`, error);
      throw new BadRequestException(error.message || 'Failed to fetch responses');
    }
  }

  /**
   * 创建或更新用户响应
   * POST /api/responses
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrUpdateResponse(@Body() createResponseDto: CreateResponseDto) {
    this.logger.log(`📝 Creating/updating response for user: ${createResponseDto.participantName}`);
    
    try {
      const response = await this.responsesService.createOrUpdateResponse(createResponseDto);
      
      this.logger.log(`✅ Response created/updated successfully: ${response.id}`);
      return {
        success: true,
        data: response,
        message: 'Response created/updated successfully',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to create/update response:`, error);
      throw new BadRequestException(error.message || 'Failed to create/update response');
    }
  }

  /**
   * 获取单个响应 - 通用路由，必须放在最后
   * GET /api/responses/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`🔍 Fetching response: ${id}`);
    
    try {
      const response = await this.responsesService.findOne(id);
      
      return {
        success: true,
        data: response,
        message: 'Response fetched successfully',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch response:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to fetch response');
    }
  }

  /**
   * 删除响应
   * DELETE /api/responses/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResponse(@Param('id') id: string) {
    this.logger.log(`🗑️ Deleting response: ${id}`);
    
    try {
      await this.responsesService.deleteResponse(id);
      
      this.logger.log(`✅ Response deleted successfully: ${id}`);
      return {
        success: true,
        message: 'Response deleted successfully',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to delete response:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to delete response');
    }
  }
} 