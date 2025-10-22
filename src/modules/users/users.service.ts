import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Profile } from '../../database/entities/profile.entity';
import { UpdateUserDto, UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  /**
   * Get current user profile
   */
  async getProfile(user: User) {
    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['profile'],
    });

    if (!fullUser) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive fields
    const { password_hash, refresh_token, reset_password_token, reset_password_expires, ...safeUser } = fullUser;

    return safeUser;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateUserDto?: UpdateUserDto,
    updateProfileDto?: UpdateProfileDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    if (updateUserDto) {
      if (updateUserDto.name !== undefined) {
        user.name = updateUserDto.name;
      }
      if (updateUserDto.country !== undefined) {
        user.country = updateUserDto.country;
      }
      await this.userRepository.save(user);
    }

    // Update profile fields
    if (updateProfileDto && user.profile) {
      if (updateProfileDto.car_fuel_efficiency !== undefined) {
        user.profile.car_fuel_efficiency = updateProfileDto.car_fuel_efficiency;
      }
      if (updateProfileDto.household_size !== undefined) {
        user.profile.household_size = updateProfileDto.household_size;
      }
      if (updateProfileDto.preferred_unit_system !== undefined) {
        user.profile.preferred_unit_system = updateProfileDto.preferred_unit_system;
      }
      await this.profileRepository.save(user.profile);
    }

    // Fetch updated user
    return this.getProfile(user);
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);

    return { message: 'Account deleted successfully' };
  }

  /**
   * Get user statistics
   */
  async getStatistics(user: User) {
    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['activities', 'goals'],
    });

    if (!fullUser) {
      throw new NotFoundException('User not found');
    }

    const total_activities = fullUser.activities?.length || 0;
    const total_co2_kg = fullUser.activities?.reduce(
      (sum, activity) => sum + Number(activity.co2_kg),
      0,
    ) || 0;

    const active_goals = fullUser.goals?.filter(
      (goal) => new Date(goal.end_date) >= new Date(),
    ).length || 0;

    return {
      total_activities,
      total_co2_kg: Math.round(total_co2_kg * 100) / 100,
      active_goals,
      member_since: fullUser.created_at,
    };
  }
}
