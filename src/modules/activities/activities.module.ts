import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { CarbonCalculatorService } from './carbon-calculator.service';
import { ActivityLog } from '../../database/entities/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, CarbonCalculatorService],
  exports: [ActivitiesService, CarbonCalculatorService],
})
export class ActivitiesModule {}
