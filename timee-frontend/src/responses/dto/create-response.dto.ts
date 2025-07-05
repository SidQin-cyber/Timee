import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  MAYBE = 'MAYBE',
  UNAVAILABLE = 'UNAVAILABLE',
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
  timeSlot: string;

  @IsEnum(AvailabilityStatus)
  availability: AvailabilityStatus;

  @IsOptional()
  @IsString()
  note?: string;
} 