import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportsService } from './exports.service';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Exports')
@ApiBearerAuth('JWT-auth')
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="ecotrack-activities.csv"')
  @ApiOperation({
    summary: 'Export activities as CSV file',
    description: 'Download all activities within the specified date range as a CSV file',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    description: 'Start date (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    description: 'End date (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file downloaded successfully',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          example: 'Date,Category,Type,Value,Unit,CO2 (kg),Metadata,Logged At\n2025-10-01,transport,car_gasoline,20,miles,8.08,"",2025-10-01T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async exportCsv(
    @Query('from') from: string,
    @Query('to') to: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const csv = await this.exportsService.generateCsv({ from, to }, user);
    res.send(csv);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get export summary statistics',
    description: 'Get detailed summary of activities for the specified period',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary statistics',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            name: { type: 'string' },
          },
        },
        period: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
          },
        },
        summary: {
          type: 'object',
          properties: {
            total_activities: { type: 'number' },
            total_co2_kg: { type: 'number' },
            by_category: { type: 'object' },
            activity_count_by_category: { type: 'object' },
          },
        },
        exported_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSummary(
    @Query('from') from: string,
    @Query('to') to: string,
    @GetUser() user: User,
  ) {
    return this.exportsService.generateSummary({ from, to }, user);
  }
}
