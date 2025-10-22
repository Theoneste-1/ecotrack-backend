import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityCategory {
  TRANSPORT = 'transport',
  HOME_ENERGY = 'home_energy',
  DIET = 'diet',
  FLIGHTS = 'flights',
  OTHER = 'other',
}

@Entity('activity_logs')
@Index(['user_id', 'date'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: ActivityCategory,
  })
  category: ActivityCategory;

  @Column()
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  co2_kg: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
