import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ActivityLog } from '../../database/entities/activity-log.entity';
import { Goal } from '../../database/entities/goal.entity';
import { User } from '../../database/entities/user.entity';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { TrendsQueryDto, TrendsPeriod } from './dto/trends-query.dto';
import { GoalProgressInterface } from './dto/interfaces/goal-progress.interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityRepository: Repository<ActivityLog>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
  ) {}

  /**
   * Get dashboard summary with aggregates and comparisons
   */
  async getSummary(query: DashboardQueryDto, user: User) {
    const { from, to } = this.getDateRange(query);

    // Get activities for the period
    const activities = await this.activityRepository.find({
      where: {
        user_id: user.id,
        date: Between(from, to),
      },
    });

    // Calculate total and by category
    const total_co2_kg = activities.reduce((sum, activity) => sum + Number(activity.co2_kg), 0);
    const by_category = this.groupByCategory(activities);

    // Get previous period for comparison
    const periodLength = to.getTime() - from.getTime();
    const previousFrom = new Date(from.getTime() - periodLength);
    const previousTo = new Date(from.getTime() - 1);

    const previousActivities = await this.activityRepository.find({
      where: {
        user_id: user.id,
        date: Between(previousFrom, previousTo),
      },
    });

    const previous_period_total = previousActivities.reduce(
      (sum, activity) => sum + Number(activity.co2_kg),
      0,
    );

    const change_percent =
      previous_period_total > 0
        ? ((total_co2_kg - previous_period_total) / previous_period_total) * 100
        : 0;

    // Get active goal for the period
    const goal = await this.goalRepository.findOne({
      where: {
        user_id: user.id,
        start_date: LessThanOrEqual(to),
        end_date: MoreThanOrEqual(from),
      },
      order: { created_at: 'DESC' },
    });

    // Calculate goal progress
    let goalProgress: GoalProgressInterface | null = null;
    if (goal) {
      const currentMonthStart = new Date(to.getFullYear(), to.getMonth(), 1);
      const currentMonthEnd = new Date(to.getFullYear(), to.getMonth() + 1, 0);

      const monthActivities = await this.activityRepository.find({
        where: {
          user_id: user.id,
          date: Between(currentMonthStart, currentMonthEnd),
        },
      });

      const current_month_total = monthActivities.reduce(
        (sum, activity) => sum + Number(activity.co2_kg),
        0,
      );

      const target_monthly_kg = Number(goal.target_co2_kg_per_month);
      const progress_percent = (current_month_total / target_monthly_kg) * 100;

      goalProgress = {
        target_monthly_kg,
        current_month_total_kg: Math.round(current_month_total * 100) / 100,
        progress_percent: Math.round(progress_percent * 100) / 100,
        on_track: current_month_total <= target_monthly_kg,
        remaining_kg: Math.round((target_monthly_kg - current_month_total) * 100) / 100,
      };
    }

    // Calculate average per day
    const daysInPeriod = Math.ceil(periodLength / (1000 * 60 * 60 * 24));
    const avg_per_day = daysInPeriod > 0 ? total_co2_kg / daysInPeriod : 0;

    return {
      total_co2_kg: Math.round(total_co2_kg * 100) / 100,
      by_category: this.roundCategoryValues(by_category),
      avg_per_day: Math.round(avg_per_day * 100) / 100,
      period_comparison: {
        previous_period_total: Math.round(previous_period_total * 100) / 100,
        change_percent: Math.round(change_percent * 100) / 100,
        change_direction: change_percent > 0 ? 'increase' : change_percent < 0 ? 'decrease' : 'stable',
      },
      goal: goalProgress,
      period: {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
        days: daysInPeriod,
      },
    };
  }

  /**
   * Get trends data for charts
   */
  async getTrends(query: TrendsQueryDto, user: User) {
    const { from, to } = this.getDateRange(query);
    const { period } = query;

    const activities = await this.activityRepository.find({
      where: {
        user_id: user.id,
        date: Between(from, to),
      },
      order: { date: 'ASC' },
    });

    let dataPoints: Array<{ date: string; co2_kg: number; by_category: Record<string, number> }> = [];

    switch (period) {
      case TrendsPeriod.DAILY:
        dataPoints = this.aggregateDaily(activities);
        break;
      case TrendsPeriod.WEEKLY:
        dataPoints = this.aggregateWeekly(activities);
        break;
      case TrendsPeriod.MONTHLY:
        dataPoints = this.aggregateMonthly(activities);
        break;
    }

    return {
      period,
      data_points: dataPoints,
      total_data_points: dataPoints.length,
      range: {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      },
    };
  }

  /**
   * Get date range from query or default to current month
   */
  private getDateRange(query: { from?: string; to?: string }) {
    let from: Date;
    let to: Date;

    if (query.from && query.to) {
      from = new Date(query.from);
      to = new Date(query.to);
    } else if (query.from) {
      from = new Date(query.from);
      to = new Date();
    } else if (query.to) {
      to = new Date(query.to);
      from = new Date(to.getFullYear(), to.getMonth(), 1);
    } else {
      // Default to current month
      to = new Date();
      from = new Date(to.getFullYear(), to.getMonth(), 1);
    }

    return { from, to };
  }

  /**
   * Group activities by category
   */
  private groupByCategory(activities: ActivityLog[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    for (const activity of activities) {
      const category = activity.category;
      if (!grouped[category]) {
        grouped[category] = 0;
      }
      grouped[category] += Number(activity.co2_kg);
    }

    return grouped;
  }

  /**
   * Round category values to 2 decimals
   */
  private roundCategoryValues(by_category: Record<string, number>): Record<string, number> {
    const rounded: Record<string, number> = {};
    for (const [key, value] of Object.entries(by_category)) {
      rounded[key] = Math.round(value * 100) / 100;
    }
    return rounded;
  }

  /**
   * Aggregate activities by day
   */
  private aggregateDaily(activities: ActivityLog[]) {
    const dailyMap = new Map<string, { co2_kg: number; by_category: Record<string, number> }>();

    for (const activity of activities) {
      const dateKey = activity.date.toISOString().split('T')[0];
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { co2_kg: 0, by_category: {} });
      }

      const dayData = dailyMap.get(dateKey)!;
      dayData.co2_kg += Number(activity.co2_kg);

      if (!dayData.by_category[activity.category]) {
        dayData.by_category[activity.category] = 0;
      }
      dayData.by_category[activity.category] += Number(activity.co2_kg);
    }

    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      co2_kg: Math.round(data.co2_kg * 100) / 100,
      by_category: this.roundCategoryValues(data.by_category),
    }));
  }

  /**
   * Aggregate activities by week
   */
  private aggregateWeekly(activities: ActivityLog[]) {
    const weeklyMap = new Map<string, { co2_kg: number; by_category: Record<string, number> }>();

    for (const activity of activities) {
      const date = new Date(activity.date);
      const weekStart = this.getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { co2_kg: 0, by_category: {} });
      }

      const weekData = weeklyMap.get(weekKey)!;
      weekData.co2_kg += Number(activity.co2_kg);

      if (!weekData.by_category[activity.category]) {
        weekData.by_category[activity.category] = 0;
      }
      weekData.by_category[activity.category] += Number(activity.co2_kg);
    }

    return Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: `Week of ${date}`,
        co2_kg: Math.round(data.co2_kg * 100) / 100,
        by_category: this.roundCategoryValues(data.by_category),
      }));
  }

  /**
   * Aggregate activities by month
   */
  private aggregateMonthly(activities: ActivityLog[]) {
    const monthlyMap = new Map<string, { co2_kg: number; by_category: Record<string, number> }>();

    for (const activity of activities) {
      const date = new Date(activity.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { co2_kg: 0, by_category: {} });
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData.co2_kg += Number(activity.co2_kg);

      if (!monthData.by_category[activity.category]) {
        monthData.by_category[activity.category] = 0;
      }
      monthData.by_category[activity.category] += Number(activity.co2_kg);
    }

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        co2_kg: Math.round(data.co2_kg * 100) / 100,
        by_category: this.roundCategoryValues(data.by_category),
      }));
  }

  /**
   * Get the start of the week (Monday)
   */
  private getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  }
}
