import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  Min,
} from 'class-validator';
import { ActivityCategory } from '../../../database/entities/activity-log.entity';

export class CreateActivityDto {
  @ApiProperty({
    description: 'Date of the activity',
    example: '2025-10-01',
    type: String,
    format: 'date',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Activity category',
    enum: ActivityCategory,
    example: ActivityCategory.TRANSPORT,
  })
  @IsEnum(ActivityCategory)
  category: ActivityCategory;

  @ApiProperty({
    description: 'Specific type of activity within the category',
    example: 'car_gasoline',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Numeric value of the activity',
    example: 20,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  value: number;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'miles',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Additional metadata for the activity',
    example: { vehicle_type: 'car_gasoline', passengers: 1 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
