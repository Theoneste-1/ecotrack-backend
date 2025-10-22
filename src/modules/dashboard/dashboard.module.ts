import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ActivityLog } from '../../database/entities/activity-log.entity';
import { Goal } from '../../database/entities/goal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog, Goal])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
