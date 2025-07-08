import { IsString, IsEmail, IsOptional, IsArray, IsEnum, IsUUID } from 'class-validator';
import { PaintMode } from '@prisma/client';

export class CreateResponseDto {
  @IsUUID()
  eventId: string;

  @IsString()
  participantName: string;

  @IsEmail()
  @IsOptional()
  participantEmail?: string;

  @IsString()
  @IsOptional()
  userInitials?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsArray()
  @IsOptional()
  availability?: any[];

  @IsEnum(PaintMode)
  @IsOptional()
  paintMode?: PaintMode;

  // 兼容性字段（用于支持旧版本前端）
  @IsArray()
  @IsOptional()
  availableSlots?: any[];

  @IsArray()
  @IsOptional()
  timestampArray?: string[];
} 