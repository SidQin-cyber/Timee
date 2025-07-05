import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AvailabilityStatus } from './create-response.dto';

export class UpdateResponseDto {
  @IsOptional()
  @IsString()
  participantName?: string;

  @IsOptional()
  @IsString()
  participantEmail?: string;

  @IsOptional()
  @IsString()
  timeSlot?: string;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @IsOptional()
  @IsString()
  note?: string;
} 