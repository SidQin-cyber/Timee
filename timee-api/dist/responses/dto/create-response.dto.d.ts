export declare enum PaintMode {
    AVAILABLE = "available",
    UNAVAILABLE = "unavailable"
}
export declare class CreateResponseDto {
    eventId: string;
    participantName: string;
    participantEmail?: string;
    userInitials: string;
    paintMode?: PaintMode;
    timezone?: string;
    availableSlots?: any[];
}
