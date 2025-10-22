import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ActivityLog } from '../../database/entities/activity-log.entity';
import { User } from '../../database/entities/user.entity';
import { CarbonCalculatorService } from './carbon-calculator.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityRepository: Repository<ActivityLog>,
    private carbonCalculator: CarbonCalculatorService,
  ) {}

  /**
   * Create a new activity log
   */
  async create(createActivityDto: CreateActivityDto, user: User) {
    const { date, category, type, value, unit, metadata } = createActivityDto;

    // Calculate CO2 emissions
    const calculation = this.carbonCalculator.calculate({
      category,
      type,
      value,
      unit,
      metadata,
      preferredUnitSystem: user.profile?.preferred_unit_system,
      country: user.country,
    });

    // Create activity log
    const activity = this.activityRepository.create({
      user_id: user.id,
      date: new Date(date),
      category,
      type,
      value,
      unit,
      metadata,
      co2_kg: calculation.co2_kg,
    });

    const savedActivity = await this.activityRepository.save(activity);

    return {
      ...savedActivity,
      calculation_breakdown: calculation.breakdown,
    };
  }

  /**
   * Get all activities for a user with optional filters
   */
  async findAll(query: QueryActivityDto, user: User) {
    const { from, to, category } = query;

    const whereClause: any = { user_id: user.id };

    // Date range filtering
    if (from && to) {
      whereClause.date = Between(new Date(from), new Date(to));
    } else if (from) {
      whereClause.date = MoreThanOrEqual(new Date(from));
    } else if (to) {
      whereClause.date = LessThanOrEqual(new Date(to));
    }

    // Category filtering
    if (category) {
      whereClause.category = category;
    }

    const activities = await this.activityRepository.find({
      where: whereClause,
      order: { date: 'DESC', created_at: 'DESC' },
    });

    return activities;
  }

  /**
   * Get a single activity by ID
   */
  async findOne(id: string, user: User) {
    const activity = await this.activityRepository.findOne({
      where: { id, user_id: user.id },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  /**
   * Update an activity
   */
  async update(id: string, updateActivityDto: UpdateActivityDto, user: User) {
    const activity = await this.findOne(id, user);

    // Merge updates
    Object.assign(activity, updateActivityDto);

    // Recalculate CO2 if relevant fields changed
    if (
      updateActivityDto.value !== undefined ||
      updateActivityDto.unit !== undefined ||
      updateActivityDto.metadata !== undefined ||
      updateActivityDto.type !== undefined
    ) {
      const calculation = this.carbonCalculator.calculate({
        category: activity.category,
        type: activity.type,
        value: activity.value,
        unit: activity.unit,
        metadata: activity.metadata,
        preferredUnitSystem: user.profile?.preferred_unit_system,
        country: user.country,
      });

      activity.co2_kg = calculation.co2_kg;
    }

    const updated = await this.activityRepository.save(activity);

    return updated;
  }

  /**
   * Delete an activity
   */
  async remove(id: string, user: User) {
    const activity = await this.findOne(id, user);
    await this.activityRepository.remove(activity);
    return { message: 'Activity deleted successfully' };
  }
}
