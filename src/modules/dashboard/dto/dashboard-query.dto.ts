import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DashboardQueryDto {
  @ApiProperty({
    description: 'Start date for dashboard data (YYYY-MM-DD)',
    required: false,
    example: '2025-10-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({
    description: 'End date for dashboard data (YYYY-MM-DD)',
    required: false,
    example: '2025-10-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
