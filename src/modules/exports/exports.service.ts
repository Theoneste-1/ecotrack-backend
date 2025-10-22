import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Parser } from 'json2csv';
import { ActivityLog } from '../../database/entities/activity-log.entity';
import { User } from '../../database/entities/user.entity';

export interface ExportQuery {
  from?: string;
  to?: string;
}

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityRepository: Repository<ActivityLog>,
  ) {}

  /**
   * Generate CSV export of activities
   */
  async generateCsv(query: ExportQuery, user: User): Promise<string> {
    const { from, to } = query;

    // Build where clause
    const whereClause: any = { user_id: user.id };

    if (from && to) {
      whereClause.date = Between(new Date(from), new Date(to));
    } else if (from) {
      whereClause.date = MoreThanOrEqual(new Date(from));
    } else if (to) {
      whereClause.date = LessThanOrEqual(new Date(to));
    }

    // Fetch activities
    const activities = await this.activityRepository.find({
      where: whereClause,
      order: { date: 'ASC', created_at: 'ASC' },
    });

    // Transform data for CSV
    const csvData = activities.map((activity) => ({
      Date: activity.date.toISOString().split('T')[0],
      Category: activity.category,
      Type: activity.type,
      Value: activity.value,
      Unit: activity.unit || '',
      'CO2 (kg)': activity.co2_kg,
      Metadata: activity.metadata ? JSON.stringify(activity.metadata) : '',
      'Logged At': activity.created_at.toISOString(),
    }));

    // Define CSV fields
    const fields = [
      'Date',
      'Category',
      'Type',
      'Value',
      'Unit',
      'CO2 (kg)',
      'Metadata',
      'Logged At',
    ];

    // Generate CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    return csv;
  }

  /**
   * Generate summary statistics for export
   */
  async generateSummary(query: ExportQuery, user: User) {
    const { from, to } = query;

    const whereClause: any = { user_id: user.id };

    if (from && to) {
      whereClause.date = Between(new Date(from), new Date(to));
    } else if (from) {
      whereClause.date = MoreThanOrEqual(new Date(from));
    } else if (to) {
      whereClause.date = LessThanOrEqual(new Date(to));
    }

    const activities = await this.activityRepository.find({
      where: whereClause,
    });

    // Calculate totals
    const total_co2_kg = activities.reduce(
      (sum, activity) => sum + Number(activity.co2_kg),
      0,
    );

    // Group by category
    const by_category: Record<string, number> = {};
    const activity_count_by_category: Record<string, number> = {};

    for (const activity of activities) {
      const category = activity.category;
      
      if (!by_category[category]) {
        by_category[category] = 0;
        activity_count_by_category[category] = 0;
      }
      
      by_category[category] += Number(activity.co2_kg);
      activity_count_by_category[category]++;
    }

    // Round values
    const rounded_by_category: Record<string, number> = {};
    for (const [key, value] of Object.entries(by_category)) {
      rounded_by_category[key] = Math.round(value * 100) / 100;
    }

    return {
      user: {
        email: user.email,
        name: user.name,
      },
      period: {
        from: from || 'beginning',
        to: to || 'now',
      },
      summary: {
        total_activities: activities.length,
        total_co2_kg: Math.round(total_co2_kg * 100) / 100,
        by_category: rounded_by_category,
        activity_count_by_category,
      },
      exported_at: new Date().toISOString(),
    };
  }
}
