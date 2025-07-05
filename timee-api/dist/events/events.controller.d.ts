import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(createEventDto: CreateEventDto): Promise<{
        responses: {
            id: string;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
            eventId: string;
            participantName: string;
            participantEmail: string | null;
            userInitials: string;
            paintMode: import(".prisma/client").$Enums.PaintMode;
            availableSlots: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        timezone: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        eventType: import(".prisma/client").$Enums.EventType;
        includeTime: boolean;
        selectedDates: string | null;
        finalizedSlots: string[];
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        responses: {
            id: string;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
            participantName: string;
            participantEmail: string;
            userInitials: string;
            paintMode: import(".prisma/client").$Enums.PaintMode;
        }[];
        _count: {
            responses: number;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        timezone: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        eventType: import(".prisma/client").$Enums.EventType;
        includeTime: boolean;
        selectedDates: string | null;
        finalizedSlots: string[];
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        responses: {
            id: string;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
            eventId: string;
            participantName: string;
            participantEmail: string | null;
            userInitials: string;
            paintMode: import(".prisma/client").$Enums.PaintMode;
            availableSlots: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        timezone: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        eventType: import(".prisma/client").$Enums.EventType;
        includeTime: boolean;
        selectedDates: string | null;
        finalizedSlots: string[];
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateEventDto: UpdateEventDto): Promise<{
        responses: {
            id: string;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
            eventId: string;
            participantName: string;
            participantEmail: string | null;
            userInitials: string;
            paintMode: import(".prisma/client").$Enums.PaintMode;
            availableSlots: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        timezone: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        eventType: import(".prisma/client").$Enums.EventType;
        includeTime: boolean;
        selectedDates: string | null;
        finalizedSlots: string[];
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        timezone: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        eventType: import(".prisma/client").$Enums.EventType;
        includeTime: boolean;
        selectedDates: string | null;
        finalizedSlots: string[];
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getEventResponses(id: string): Promise<{
        id: string;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
        eventId: string;
        participantName: string;
        participantEmail: string | null;
        userInitials: string;
        paintMode: import(".prisma/client").$Enums.PaintMode;
        availableSlots: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
