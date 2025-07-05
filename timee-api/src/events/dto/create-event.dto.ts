import { IsString, IsOptional, IsBoolean, IsEnum, IsDateString, IsArray } from 'class-validator';

export enum EventType {
  GROUP = 'group',
  ONE_ON_ONE = 'one-on-one',
}

export class CreateEventDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  timezone?: string = 'UTC+8';

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  startTime?: string = '09:00';

  @IsOptional()
  @IsString()
  endTime?: string = '17:00';

  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType = EventType.GROUP;

  @IsOptional()
  @IsBoolean()
  includeTime?: boolean = false;

  @IsOptional()
  @IsString()
  selectedDates?: string;

  @IsOptional()
  @IsArray()
  finalizedSlots?: string[] = [];

  @IsOptional()
  @IsString()
  createdBy?: string;
} 