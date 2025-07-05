import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto) {
    try {
      return await this.eventsService.create(createEventDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create event',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.findOne(id);
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
    return event;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    try {
      return await this.eventsService.update(id, updateEventDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update event',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.eventsService.remove(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete event',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id/responses')
  async getEventResponses(@Param('id') id: string) {
    return this.eventsService.getEventResponses(id);
  }
} 