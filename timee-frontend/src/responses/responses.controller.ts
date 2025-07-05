import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createResponseDto: CreateResponseDto) {
    return this.responsesService.create(createResponseDto);
  }

  @Post('bulk/:eventId/:participantName')
  @HttpCode(HttpStatus.CREATED)
  bulkCreateOrUpdate(
    @Param('eventId') eventId: string,
    @Param('participantName') participantName: string,
    @Body() responses: Array<{
      timeSlot: string;
      availability: string;
      note?: string;
    }>,
  ) {
    return this.responsesService.bulkCreateOrUpdate(eventId, participantName, responses);
  }

  @Get()
  findAll() {
    return this.responsesService.findAll();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.responsesService.findByEvent(eventId);
  }

  @Get('event/:eventId/participant/:participantName')
  findByParticipant(
    @Param('eventId') eventId: string,
    @Param('participantName') participantName: string,
  ) {
    return this.responsesService.findByParticipant(eventId, participantName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.responsesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResponseDto: UpdateResponseDto) {
    return this.responsesService.update(id, updateResponseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.responsesService.remove(id);
  }

  @Delete('event/:eventId/participant/:participantName')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeByParticipant(
    @Param('eventId') eventId: string,
    @Param('participantName') participantName: string,
  ) {
    return this.responsesService.removeByParticipant(eventId, participantName);
  }
} 