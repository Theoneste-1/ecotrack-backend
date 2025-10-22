import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from '../../database/entities/goal.entity';
import { User } from '../../database/entities/user.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
  ) {}

  /**
   * Create a new goal
   */
  async create(createGoalDto: CreateGoalDto, user: User) {
    const { target_co2_kg_per_month, start_date, end_date } = createGoalDto;

    // Validate date range
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const goal = this.goalRepository.create({
      user_id: user.id,
      target_co2_kg_per_month,
      start_date: startDate,
      end_date: endDate,
    });

    return await this.goalRepository.save(goal);
  }

  /**
   * Get all goals for a user
   */
  async findAll(user: User) {
    const goals = await this.goalRepository.find({
      where: { user_id: user.id },
      order: { created_at: 'DESC' },
    });

    return goals;
  }

  /**
   * Get a single goal by ID
   */
  async findOne(id: string, user: User) {
    const goal = await this.goalRepository.findOne({
      where: { id, user_id: user.id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  /**
   * Update a goal
   */
  async update(id: string, updateGoalDto: UpdateGoalDto, user: User) {
    const goal = await this.findOne(id, user);

    // Validate dates if updated
    if (updateGoalDto.start_date || updateGoalDto.end_date) {
      const startDate = updateGoalDto.start_date
        ? new Date(updateGoalDto.start_date)
        : goal.start_date;
      const endDate = updateGoalDto.end_date
        ? new Date(updateGoalDto.end_date)
        : goal.end_date;

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      goal.start_date = startDate;
      goal.end_date = endDate;
    }

    if (updateGoalDto.target_co2_kg_per_month !== undefined) {
      goal.target_co2_kg_per_month = updateGoalDto.target_co2_kg_per_month;
    }

    return await this.goalRepository.save(goal);
  }

  /**
   * Delete a goal
   */
  async remove(id: string, user: User) {
    const goal = await this.findOne(id, user);
    await this.goalRepository.remove(goal);
    return { message: 'Goal deleted successfully' };
  }
}
