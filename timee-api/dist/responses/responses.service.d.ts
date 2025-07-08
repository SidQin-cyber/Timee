import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../gateway/events.gateway';
import { CreateResponseDto } from './dto/create-response.dto';
export declare class ResponsesService {
    private readonly prisma;
    private readonly eventsGateway;
    private readonly logger;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    createOrUpdateResponse(createResponseDto: CreateResponseDto): Promise<any>;
    getEventRoomData(eventId: string): Promise<{
        event: {
            id: any;
            tcCode: any;
            title: any;
            startDate: any;
            endDate: any;
            timezone: any;
        };
        participants: any;
        heatmapData: {
            slot: string;
            count: number;
            percentage: number;
        }[];
        participantCount: any;
        responseCount: any;
    }>;
    getUserResponse(eventId: string, participantName: string): Promise<{
        participant: {
            id: string;
            name: string;
            email: string;
            initials: string;
            timezone: string;
        };
        response: {
            id: any;
            availability: any;
            paintMode: any;
            version: any;
            updatedAt: any;
        };
    }>;
    private buildHeatmapData;
    deleteResponse(responseId: string): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
}
