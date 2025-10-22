import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum TrendsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class TrendsQueryDto {
  @ApiProperty({
    description: 'Aggregation period for trends',
    enum: TrendsPeriod,
    example: TrendsPeriod.DAILY,
    default: TrendsPeriod.DAILY,
  })
  @IsEnum(TrendsPeriod)
  period: TrendsPeriod;

  @ApiProperty({
    description: 'Start date for trends data (YYYY-MM-DD)',
    required: false,
    example: '2025-10-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({
    description: 'End date for trends data (YYYY-MM-DD)',
    required: false,
    example: '2025-10-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
