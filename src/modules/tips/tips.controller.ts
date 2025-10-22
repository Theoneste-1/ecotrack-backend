import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TipsService } from './tips.service';
import { QueryTipsDto } from './dto/query-tips.dto';

@ApiTags('Tips')
@ApiBearerAuth('JWT-auth')
@Controller('tips')
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get sustainability tips with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'List of sustainability tips',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          source_url: { type: 'string', nullable: true },
          category: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() query: QueryTipsDto) {
    return this.tipsService.findAll(query);
  }
}
