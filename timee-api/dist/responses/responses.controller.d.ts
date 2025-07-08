import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';
export declare class ResponsesController {
    private readonly responsesService;
    private readonly logger;
    constructor(responsesService: ResponsesService);
    healthCheck(): {
        success: boolean;
        message: string;
        timestamp: string;
    };
    getEventRoomData(eventId: string): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    getUserResponse(eventId: string, participantName: string): Promise<{
        success: boolean;
        data: {
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
    createOrUpdateResponse(createResponseDto: CreateResponseDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    deleteResponse(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
