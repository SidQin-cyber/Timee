import { PaintMode } from '@prisma/client';
export declare class CreateResponseDto {
    eventId: string;
    participantName: string;
    participantEmail?: string;
    userInitials?: string;
    timezone?: string;
    availability?: any[];
    paintMode?: PaintMode;
    availableSlots?: any[];
    timestampArray?: string[];
}
