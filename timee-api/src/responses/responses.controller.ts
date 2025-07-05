import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  async create(@Body() createResponseDto: CreateResponseDto) {
    try {
      return await this.responsesService.create(createResponseDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create response',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll() {
    return this.responsesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const response = await this.responsesService.findOne(id);
    if (!response) {
      throw new HttpException('Response not found', HttpStatus.NOT_FOUND);
    }
    return response;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateResponseDto: Partial<CreateResponseDto>) {
    try {
      return await this.responsesService.update(id, updateResponseDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update response',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.responsesService.remove(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete response',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('event/:eventId')
  async findByEvent(@Param('eventId') eventId: string) {
    return this.responsesService.findByEvent(eventId);
  }
} 