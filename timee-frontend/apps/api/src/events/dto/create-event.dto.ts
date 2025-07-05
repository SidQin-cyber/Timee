import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsArray, IsDateString } from 'class-validator';
import { EventType } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsBoolean()
  includeTime: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedDates?: string[];

  @IsOptional()
  @IsString()
  customTCode?: string;
} 