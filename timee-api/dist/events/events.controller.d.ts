import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventFrontendDto } from './dto/create-event-frontend.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsController {
    private readonly eventsService;
    private readonly logger;
    constructor(eventsService: EventsService);
    healthCheck(): {
        success: boolean;
        message: string;
        timestamp: string;
    };
    generateTcCode(): Promise<{
        success: boolean;
        data: {
            tcCode: string;
        };
        message: string;
    }>;
    checkTcCodeAvailability(tcCode: string): Promise<{
        success: boolean;
        data: {
            tcCode: string;
            isAvailable: boolean;
        };
        message: string;
    }>;
    findByTcCode(tcCode: string): Promise<{
        success: boolean;
        data: {
            id: any;
            tcCode: any;
            title: any;
            description: any;
            startDate: any;
            endDate: any;
            timezone: any;
            createdAt: any;
            updatedAt: any;
            participants: any;
            stats: {
                participantCount: any;
                responseCount: any;
            };
        };
        message: string;
    }>;
    findAll(page?: string, limit?: string): Promise<{
        success: boolean;
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            hasNext: boolean;
            hasPrev: boolean;
        };
        message: string;
    }>;
    createEventFromFrontend(createEventDto: CreateEventFrontendDto): Promise<{
        success: boolean;
        data: {
            id: any;
            tcCode: any;
            title: any;
            description: any;
            startDate: any;
            endDate: any;
            timezone: any;
            createdAt: any;
            updatedAt: any;
        };
        message: string;
    }>;
    createEvent(createEventDto: CreateEventDto): Promise<{
        success: boolean;
        data: {
            id: any;
            tcCode: any;
            title: any;
            description: any;
            startDate: any;
            endDate: any;
            timezone: any;
            createdAt: any;
            updatedAt: any;
        };
        message: string;
    }>;
    findById(id: string): Promise<{
        success: boolean;
        data: {
            id: any;
            tcCode: any;
            title: any;
            description: any;
            startDate: any;
            endDate: any;
            timezone: any;
            createdAt: any;
            updatedAt: any;
            participants: any;
            stats: {
                participantCount: any;
                responseCount: any;
            };
        };
        message: string;
    }>;
    updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    deleteEvent(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
