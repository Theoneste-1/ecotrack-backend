import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum UnitSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  car_fuel_efficiency: number;

  @Column({ type: 'int', nullable: true })
  household_size: number;

  @Column({
    type: 'enum',
    enum: UnitSystem,
    default: UnitSystem.METRIC,
  })
  preferred_unit_system: UnitSystem;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
