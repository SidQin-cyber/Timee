import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export enum PaintMode {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
}

export class CreateResponseDto {
  @IsString()
  eventId: string;

  @IsString()
  participantName: string;

  @IsOptional()
  @IsString()
  participantEmail?: string;

  @IsString()
  userInitials: string;

  @IsOptional()
  @IsEnum(PaintMode)
  paintMode?: PaintMode = PaintMode.AVAILABLE;

  @IsOptional()
  @IsString()
  timezone?: string = 'UTC+8';

  @IsOptional()
  @IsArray()
  availableSlots?: any[] = [];
} 