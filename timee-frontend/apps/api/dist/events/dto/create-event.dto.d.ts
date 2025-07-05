import { EventType } from '@prisma/client';
export declare class CreateEventDto {
    title: string;
    description?: string;
    timezone: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    eventType: EventType;
    includeTime: boolean;
    selectedDates?: string[];
    customTCode?: string;
}
