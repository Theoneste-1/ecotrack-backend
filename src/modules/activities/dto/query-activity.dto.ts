import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ActivityCategory } from '../../../database/entities/activity-log.entity';

export class QueryActivityDto {
  @ApiProperty({
    description: 'Start date filter (YYYY-MM-DD)',
    required: false,
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({
    description: 'End date filter (YYYY-MM-DD)',
    required: false,
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiProperty({
    description: 'Filter by activity category',
    enum: ActivityCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(ActivityCategory)
  category?: ActivityCategory;
}
