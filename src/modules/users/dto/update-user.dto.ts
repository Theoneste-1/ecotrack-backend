import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { UnitSystem } from '../../../database/entities/profile.entity';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User full name',
    required: false,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    required: false,
    example: 'US',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;
}

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Car fuel efficiency (MPG for imperial, L/100km for metric)',
    required: false,
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  car_fuel_efficiency?: number;

  @ApiProperty({
    description: 'Number of people in household',
    required: false,
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  household_size?: number;

  @ApiProperty({
    description: 'Preferred unit system',
    enum: UnitSystem,
    required: false,
    example: UnitSystem.METRIC,
  })
  @IsOptional()
  @IsEnum(UnitSystem)
  preferred_unit_system?: UnitSystem;
}

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'User information',
    required: false,
  })
  @IsOptional()
  user?: UpdateUserDto;

  @ApiProperty({
    description: 'Profile information',
    required: false,
  })
  @IsOptional()
  profile?: UpdateProfileDto;
}
