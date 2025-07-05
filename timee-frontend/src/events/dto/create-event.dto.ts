import { IsString, IsOptional, IsDateString, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { EventType, PaintMode } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsArray()
  @IsString({ each: true })
  timeSlots: string[];

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  timezone: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsOptional()
  @IsEnum(PaintMode)
  paintMode?: PaintMode;

  @IsOptional()
  @IsBoolean()
  allowMaybe?: boolean;

  @IsOptional()
  @IsString()
  organizerEmail?: string;

  @IsString()
  tcode: string;
} 