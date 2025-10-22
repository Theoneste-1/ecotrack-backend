import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { TrendsQueryDto } from './dto/trends-query.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get dashboard summary with totals, category breakdown, and goal progress',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary data',
    schema: {
      properties: {
        total_co2_kg: { type: 'number', example: 123.45 },
        by_category: {
          type: 'object',
          example: {
            transport: 50.2,
            home_energy: 60.1,
            diet: 13.15,
          },
        },
        avg_per_day: { type: 'number', example: 4.12 },
        period_comparison: {
          type: 'object',
          properties: {
            previous_period_total: { type: 'number' },
            change_percent: { type: 'number' },
            change_direction: { type: 'string', enum: ['increase', 'decrease', 'stable'] },
          },
        },
        goal: {
          type: 'object',
          nullable: true,
          properties: {
            target_monthly_kg: { type: 'number' },
            current_month_total_kg: { type: 'number' },
            progress_percent: { type: 'number' },
            on_track: { type: 'boolean' },
            remaining_kg: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSummary(@Query() query: DashboardQueryDto, @GetUser() user: User) {
    return this.dashboardService.getSummary(query, user);
  }

  @Get('trends')
  @ApiOperation({
    summary: 'Get time-series trends data for charts (daily, weekly, or monthly)',
  })
  @ApiResponse({
    status: 200,
    description: 'Trends data points',
    schema: {
      properties: {
        period: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
        data_points: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              co2_kg: { type: 'number' },
              by_category: { type: 'object' },
            },
          },
        },
        total_data_points: { type: 'number' },
        range: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTrends(@Query() query: TrendsQueryDto, @GetUser() user: User) {
    return this.dashboardService.getTrends(query, user);
  }
}
