export declare enum EventType {
    GROUP = "group",
    ONE_ON_ONE = "one-on-one"
}
export declare class CreateEventDto {
    id?: string;
    title: string;
    description?: string;
    timezone?: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    eventType?: EventType;
    includeTime?: boolean;
    selectedDates?: string;
    finalizedSlots?: string[];
    createdBy?: string;
}
