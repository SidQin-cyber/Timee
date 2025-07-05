import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';
export declare class ResponsesController {
    private readonly responsesService;
    constructor(responsesService: ResponsesService);
    create(createResponseDto: CreateResponseDto): Promise<{
        event: {
            id: string;
            title: string;
            startDate: Date;
            endDate: Date;
        };
    } & {
        id: string;
        eventId: string;
        participantName: string;
        participantEmail: string | null;
        userInitials: string;
        paintMode: import(".prisma/client").$Enums.PaintMode;
        timezone: string;
        availableSlots: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        event: {
            id: string;
            title: string;
            startDate: Date;
            endDate: Date;
        };
    } & {
        id: string;
        eventId: string;
        participantName: string;
        participantEmail: string | null;
        userInitials: string;
        paintMode: import(".prisma/client").$Enums.PaintMode;
        timezone: string;
        availableSlots: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        event: {
            id: string;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
            startTime: string;
            endTime: string;
            eventType: import(".prisma/client").$Enums.EventType;
            includeTime: boolean;
            selectedDates: string | null;
            finalizedSlots: string[];
            createdBy: string | null;
        };
    } & {
        id: string;
        eventId: string;
        participantName: string;
        participantEmail: string | null;
        userInitials: string;
        paintMode: import(".prisma/client").$Enums.PaintMode;
        timezone: string;
        availableSlots: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateResponseDto: Partial<CreateResponseDto>): Promise<{
        event: {
            id: string;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
            startTime: string;
            endTime: string;
            eventType: import(".prisma/client").$Enums.EventType;
            includeTime: boolean;
            selectedDates: string | null;
            finalizedSlots: string[];
            createdBy: string | null;
        };
    } & {
        id: string;
        eventId: string;
        participantName: string;
        participantEmail: string | null;
        userInitials: string;
        paintMode: import(".prisma/client").$Enums.PaintMode;
        timezone: string;
        availableSlots: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        eventId: string;
        participantName: string;
        participantEmail: string | null;
        userInitials: string;
        paintMode: import(".prisma/client").$Enums.PaintMode;
        timezone: string;
        availableSlots: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEvent(eventId: string): Promise<{
        id: string;
        eventId: string;
        participantName: string;
        participantEmail: string | null;
        userInitials: string;
        paintMode: import(".prisma/client").$Enums.PaintMode;
        timezone: string;
        availableSlots: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
