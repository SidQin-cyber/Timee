import { PrismaService } from '../prisma/prisma.service';
import { CreateResponseDto } from './dto/create-response.dto';
export declare class ResponsesService {
    private prisma;
    constructor(prisma: PrismaService);
    submitResponse(createResponseDto: CreateResponseDto): Promise<any>;
    getEventResponses(eventId: string): Promise<any[]>;
    getUserResponse(eventId: string, participantName: string): Promise<any | null>;
    deleteResponse(eventId: string, participantName: string): Promise<void>;
    getEventStats(eventId: string): Promise<{
        totalParticipants: number;
        responseCount: number;
        lastUpdated: string | null;
    }>;
}
