import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTipsDto {
  @ApiProperty({
    description: 'Filter tips by category',
    required: false,
    example: 'transport',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Search query for tip content',
    required: false,
    example: 'solar',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'Maximum number of tips to return',
    required: false,
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
