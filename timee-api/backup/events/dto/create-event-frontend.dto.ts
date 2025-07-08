import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateEventFrontendDto {
  // 前端发送的 id 字段（实际是tcCode）
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsBoolean()
  includeTime?: boolean;

  @IsOptional()
  @IsArray()
  selectedDates?: string[];

  @IsOptional()
  @IsArray()
  finalizedSlots?: string[];

  @IsOptional()
  @IsString()
  createdBy?: string;
} 