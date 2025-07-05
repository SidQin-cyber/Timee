import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  ValidationPipe,
} from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';

@Controller('events/:eventId/responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  async submitResponse(
    @Param('eventId') eventId: string,
    @Body(ValidationPipe) createResponseDto: CreateResponseDto,
  ) {
    try {
      createResponseDto.eventId = eventId;
      
      const response = await this.responsesService.submitResponse(createResponseDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Response submitted successfully',
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Failed to submit response',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async getEventResponses(@Param('eventId') eventId: string) {
    try {
      const responses = await this.responsesService.getEventResponses(eventId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Event responses fetched successfully',
        data: responses,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch event responses',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':participantName')
  async deleteResponse(
    @Param('eventId') eventId: string,
    @Param('participantName') participantName: string,
  ) {
    try {
      await this.responsesService.deleteResponse(eventId, participantName);
      return {
        statusCode: HttpStatus.OK,
        message: 'Response deleted successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to delete response',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 