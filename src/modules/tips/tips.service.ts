import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Tip } from '../../database/entities/tip.entity';
import { QueryTipsDto } from './dto/query-tips.dto';

@Injectable()
export class TipsService {
  private readonly logger = new Logger(TipsService.name);

  constructor(
    @InjectRepository(Tip)
    private tipRepository: Repository<Tip>,
  ) {
    this.seedDefaultTips();
  }

  /**
   * Get tips with optional filtering
   */
  async findAll(query: QueryTipsDto) {
    const { category, q, limit } = query;

    const whereClause: any = {};

    if (category) {
      whereClause.category = category;
    }

    if (q) {
      whereClause.title = Like(`%${q}%`);
    }

    const tips = await this.tipRepository.find({
      where: whereClause,
      take: limit || 10,
      order: { created_at: 'DESC' },
    });

    return tips;
  }

  /**
   * Seed default sustainability tips (run once on initialization)
   */
  private async seedDefaultTips() {
    const count = await this.tipRepository.count();
    
    if (count > 0) {
      return; // Tips already seeded
    }

    this.logger.log('Seeding default sustainability tips...');

    const defaultTips = [
      {
        title: 'Switch to LED Bulbs',
        content: 'LED bulbs use up to 75% less energy than traditional incandescent bulbs and last 25 times longer. Replacing just 5 bulbs in your home can save approximately 75kg of CO2 per year.',
        category: 'home_energy',
        source_url: 'https://www.energy.gov/energysaver/lighting-choices-save-you-money',
      },
      {
        title: 'Carpool or Use Public Transportation',
        content: 'Sharing rides reduces the number of vehicles on the road. Carpooling just 2 days a week can reduce your carbon footprint by approximately 700kg annually.',
        category: 'transport',
        source_url: null,
      },
      {
        title: 'Reduce Meat Consumption',
        content: 'The meat industry is responsible for significant greenhouse gas emissions. Try "Meatless Monday" - going vegetarian just one day a week can save the equivalent of driving 1,160 miles per year.',
        category: 'diet',
        source_url: 'https://www.mondaycampaigns.org/meatless-monday',
      },
      {
        title: 'Unplug Electronics When Not in Use',
        content: 'Devices on standby mode still consume energy (phantom load). Unplugging devices or using smart power strips can reduce your energy consumption by 5-10%.',
        category: 'home_energy',
        source_url: null,
      },
      {
        title: 'Use a Programmable Thermostat',
        content: 'Smart thermostats can reduce heating and cooling costs by 10-23%. Setting your thermostat 7-10°F lower for 8 hours a day can save 10% on heating bills.',
        category: 'home_energy',
        source_url: null,
      },
      {
        title: 'Bike or Walk for Short Trips',
        content: 'For trips under 2 miles, consider walking or biking instead of driving. This eliminates emissions entirely and provides health benefits.',
        category: 'transport',
        source_url: null,
      },
      {
        title: 'Buy Local and Seasonal Produce',
        content: 'Food that travels shorter distances requires less transportation emissions. Buying local can reduce food-related emissions by up to 7%.',
        category: 'diet',
        source_url: null,
      },
      {
        title: 'Fix Leaky Faucets',
        content: 'A leaking faucet can waste over 3,000 gallons of water per year. Fixing leaks saves water and the energy used to heat it.',
        category: 'home_energy',
        source_url: null,
      },
      {
        title: 'Choose Direct Flights',
        content: 'Takeoffs and landings create the most carbon emissions in flights. Direct flights are more efficient than multi-stop routes.',
        category: 'flights',
        source_url: null,
      },
      {
        title: 'Wash Clothes in Cold Water',
        content: 'About 90% of the energy used for washing clothes goes to heating water. Washing in cold water can save up to 500kg of CO2 per year.',
        category: 'home_energy',
        source_url: null,
      },
      {
        title: 'Start Composting',
        content: 'Food waste in landfills produces methane, a potent greenhouse gas. Composting reduces waste and creates nutrient-rich soil.',
        category: 'other',
        source_url: null,
      },
      {
        title: 'Use Reusable Shopping Bags',
        content: 'Plastic bags take 500+ years to decompose. Using reusable bags reduces plastic waste and the emissions from manufacturing new bags.',
        category: 'other',
        source_url: null,
      },
      {
        title: 'Install Solar Panels',
        content: 'Solar panels can reduce your electricity bills by 50-90% and significantly decrease your carbon footprint. Many regions offer tax incentives for installation.',
        category: 'home_energy',
        source_url: null,
      },
      {
        title: 'Maintain Your Vehicle',
        content: 'Properly inflated tires and regular maintenance can improve fuel efficiency by up to 10%, reducing both costs and emissions.',
        category: 'transport',
        source_url: null,
      },
      {
        title: 'Use a Water Filter',
        content: 'Instead of buying bottled water, use a reusable bottle with filtered tap water. This reduces plastic waste and the emissions from transportation.',
        category: 'other',
        source_url: null,
      },
    ];

    for (const tipData of defaultTips) {
      const tip = this.tipRepository.create(tipData);
      await this.tipRepository.save(tip);
    }

    this.logger.log('Default tips seeded successfully');
  }
}
