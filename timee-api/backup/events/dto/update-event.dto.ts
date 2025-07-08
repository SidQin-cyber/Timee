import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { OmitType } from '@nestjs/mapped-types';
 
export class UpdateEventDto extends PartialType(
  OmitType(CreateEventDto, ['tcCode'] as const)
) {} 