import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user\'s profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile data',
    schema: {
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        country: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        profile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            car_fuel_efficiency: { type: 'number', nullable: true },
            household_size: { type: 'number', nullable: true },
            preferred_unit_system: { type: 'string', enum: ['metric', 'imperial'] },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@GetUser() user: User) {
    return this.usersService.getProfile(user);
  }

  @Put('me')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update user information and preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(
    @Body() updateDto: UpdateUserProfileDto,
    @GetUser() user: User,
  ) {
    return this.usersService.updateProfile(
      user.id,
      updateDto.user,
      updateDto.profile,
    );
  }

  @Get('me/statistics')
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Get summary statistics for the user account',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics',
    schema: {
      properties: {
        total_activities: { type: 'number' },
        total_co2_kg: { type: 'number' },
        active_goals: { type: 'number' },
        member_since: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStatistics(@GetUser() user: User) {
    return this.usersService.getStatistics(user);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Permanently delete the user account and all associated data',
  })
  @ApiResponse({
    status: 204,
    description: 'Account deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deleteAccount(@GetUser() user: User) {
    return this.usersService.deleteAccount(user.id);
  }
}
