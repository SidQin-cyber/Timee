import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createEvent(createEventDto: CreateEventDto): Promise<{
        id: any;
        tcCode: any;
        title: any;
        description: any;
        startDate: any;
        endDate: any;
        timezone: any;
        createdAt: any;
        updatedAt: any;
    }>;
    findByTcCode(tcCode: string): Promise<{
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
    }>;
    findById(id: string): Promise<{
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
    }>;
    updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<any>;
    deleteEvent(id: string): Promise<any>;
    findAll(page?: number, limit?: number): Promise<{
        events: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    generateTcCode(): string;
    isTcCodeAvailable(tcCode: string): Promise<boolean>;
}
