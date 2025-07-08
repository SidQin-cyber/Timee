import { IsString, IsArray, IsOptional, IsDateString } from 'class-validator';

export class SubmitResponseDto {
  @IsString()
  userName: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsArray()
  @IsDateString({}, { each: true })
  availability: string[];
} 