import { HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(createEventDto: CreateEventDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: any;
    }>;
    findAll(): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: any[];
    }>;
    findRecent(): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: any[];
    }>;
    findOne(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: any;
    }>;
    update(id: string, updateEventDto: Partial<CreateEventDto>): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: any;
    }>;
    remove(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
}
