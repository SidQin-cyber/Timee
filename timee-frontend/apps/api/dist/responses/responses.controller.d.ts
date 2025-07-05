import { HttpStatus } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';
export declare class ResponsesController {
    private readonly responsesService;
    constructor(responsesService: ResponsesService);
    submitResponse(eventId: string, createResponseDto: CreateResponseDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: any;
    }>;
    getEventResponses(eventId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: any[];
    }>;
    deleteResponse(eventId: string, participantName: string): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
}
