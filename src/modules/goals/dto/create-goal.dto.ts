import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, Min } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({
    description: 'Target CO2 emissions in kg per month',
    example: 400,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  target_co2_kg_per_month: number;

  @ApiProperty({
    description: 'Goal start date (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'Goal end date (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsDateString()
  end_date: string;
}
