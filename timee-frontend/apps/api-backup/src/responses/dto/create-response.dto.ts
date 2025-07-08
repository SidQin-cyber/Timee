import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';
import { PaintMode } from '@prisma/client';

export class CreateResponseDto {
  @IsOptional()
  @IsString()
  eventId?: string;

  @IsString()
  @IsNotEmpty()
  participantName: string;

  @IsOptional()
  @IsString()
  participantEmail?: string;

  @IsString()
  @IsNotEmpty()
  userInitials: string;

  @IsEnum(PaintMode)
  paintMode: PaintMode;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsArray()
  availableSlots: any[];
} 