import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Goals')
@ApiBearerAuth('JWT-auth')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new carbon reduction goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createGoalDto: CreateGoalDto, @GetUser() user: User) {
    return this.goalsService.create(createGoalDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of goals' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@GetUser() user: User) {
    return this.goalsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific goal by ID' })
  @ApiResponse({ status: 200, description: 'Goal details' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.goalsService.findOne(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing goal' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @GetUser() user: User,
  ) {
    return this.goalsService.update(id, updateGoalDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a goal' })
  @ApiResponse({ status: 204, description: 'Goal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.goalsService.remove(id, user);
  }
}
