import { Injectable, BadRequestException } from '@nestjs/common';
import {
  EMISSION_FACTORS,
  REGIONAL_ELECTRICITY_FACTORS,
} from '../../config/emission-factors.config';
import { ActivityCategory } from '../../database/entities/activity-log.entity';
import { UnitSystem } from '../../database/entities/profile.entity';

export interface CalculationInput {
  category: ActivityCategory;
  type: string;
  value: number;
  unit?: string;
  metadata?: Record<string, any>;
  preferredUnitSystem?: UnitSystem;
  country?: string;
}

export interface CalculationResult {
  co2_kg: number;
  breakdown: {
    raw_value: number;
    raw_unit: string;
    normalized_value: number;
    normalized_unit: string;
    emission_factor: number;
    emission_factor_source: string;
  };
}

@Injectable()
export class CarbonCalculatorService {
  /**
   * Calculate CO2 emissions for an activity
   */
  calculate(input: CalculationInput): CalculationResult {
    const { category, type, value, unit, metadata, preferredUnitSystem, country } = input;

    if (value <= 0) {
      throw new BadRequestException('Activity value must be greater than zero');
    }

    let co2_kg = 0;
    let emissionFactor = 0;
    let emissionFactorSource = '';
    let normalizedValue = value;
    let normalizedUnit = unit || '';

    switch (category) {
      case ActivityCategory.TRANSPORT:
        ({ co2_kg, emissionFactor, emissionFactorSource, normalizedValue, normalizedUnit } =
          this.calculateTransport(type, value, unit, metadata, preferredUnitSystem));
        break;

      case ActivityCategory.HOME_ENERGY:
        ({ co2_kg, emissionFactor, emissionFactorSource, normalizedValue, normalizedUnit } =
          this.calculateHomeEnergy(type, value, unit, country));
        break;

      case ActivityCategory.DIET:
        ({ co2_kg, emissionFactor, emissionFactorSource, normalizedValue, normalizedUnit } =
          this.calculateDiet(type, value, unit));
        break;

      case ActivityCategory.FLIGHTS:
        ({ co2_kg, emissionFactor, emissionFactorSource, normalizedValue, normalizedUnit } =
          this.calculateFlight(value, unit, metadata, preferredUnitSystem));
        break;

      case ActivityCategory.OTHER:
        ({ co2_kg, emissionFactor, emissionFactorSource, normalizedValue, normalizedUnit } =
          this.calculateOther(type, value, unit));
        break;

      default:
        throw new BadRequestException(`Unknown category: ${category}`);
    }

    return {
      co2_kg: Math.round(co2_kg * 100) / 100, // Round to 2 decimals
      breakdown: {
        raw_value: value,
        raw_unit: unit || '',
        normalized_value: normalizedValue,
        normalized_unit: normalizedUnit,
        emission_factor: emissionFactor,
        emission_factor_source: emissionFactorSource,
      },
    };
  }

  /**
   * Calculate transport emissions
   */
  private calculateTransport(
    type: string,
    value: number,
    unit: string,
    metadata: any,
    unitSystem: UnitSystem,
  ) {
    const isMetric = unitSystem === UnitSystem.METRIC || unit === 'km';
    const factors = isMetric ? EMISSION_FACTORS.transport_metric : EMISSION_FACTORS.transport;
    
    const vehicleType = metadata?.vehicle_type || type.replace('_miles', '').replace('_km', '');
    const emissionFactor = factors[vehicleType] || factors['car_gasoline'];
    
    const normalizedUnit = isMetric ? 'km' : 'miles';
    let normalizedValue = value;

    // Convert if necessary
    if (unit === 'km' && !isMetric) {
      normalizedValue = value * 0.621371; // km to miles
    } else if (unit === 'miles' && isMetric) {
      normalizedValue = value * 1.60934; // miles to km
    }

    const co2_kg = normalizedValue * emissionFactor;

    return {
      co2_kg,
      emissionFactor,
      emissionFactorSource: `${vehicleType} (${normalizedUnit})`,
      normalizedValue,
      normalizedUnit,
    };
  }

  /**
   * Calculate home energy emissions
   */
  private calculateHomeEnergy(type: string, value: number, unit: string, country?: string) {
    let emissionFactor = 0;
    let emissionFactorSource = '';
    const normalizedValue = value;
    const normalizedUnit = unit;

    if (type === 'electricity_kwh' || type === 'electricity') {
      // Use regional factor if available
      const countryCode = country?.toUpperCase() || 'DEFAULT';
      emissionFactor = REGIONAL_ELECTRICITY_FACTORS[countryCode] || REGIONAL_ELECTRICITY_FACTORS.DEFAULT;
      emissionFactorSource = `Electricity (${countryCode})`;
    } else {
      emissionFactor = EMISSION_FACTORS.home_energy[type] || EMISSION_FACTORS.home_energy.natural_gas_m3;
      emissionFactorSource = type;
    }

    const co2_kg = value * emissionFactor;

    return {
      co2_kg,
      emissionFactor,
      emissionFactorSource,
      normalizedValue,
      normalizedUnit,
    };
  }

  /**
   * Calculate diet emissions
   */
  private calculateDiet(type: string, value: number, unit: string) {
    const isDaily = unit === 'day' || unit === 'days';
    const factors = isDaily ? EMISSION_FACTORS.diet_daily : EMISSION_FACTORS.diet;
    
    const dietType = type.replace('_meal', '').replace('_daily', '');
    const emissionFactor = factors[dietType] || factors['medium_meat'] || factors['pork_poultry'];
    
    const normalizedUnit = isDaily ? 'day' : 'meal';
    const normalizedValue = value;

    const co2_kg = value * emissionFactor;

    return {
      co2_kg,
      emissionFactor,
      emissionFactorSource: `${dietType} (per ${normalizedUnit})`,
      normalizedValue,
      normalizedUnit,
    };
  }

  /**
   * Calculate flight emissions
   */
  private calculateFlight(value: number, unit: string, metadata: any, unitSystem: UnitSystem) {
    const isMetric = unitSystem === UnitSystem.METRIC || unit === 'km';
    const factors = isMetric ? EMISSION_FACTORS.flights_metric : EMISSION_FACTORS.flights;
    
    const normalizedUnit = isMetric ? 'km' : 'miles';
    let normalizedValue = value;

    // Convert if necessary
    if (unit === 'km' && !isMetric) {
      normalizedValue = value * 0.621371;
    } else if (unit === 'miles' && isMetric) {
      normalizedValue = value * 1.60934;
    }

    // Determine flight class based on distance
    const threshold1 = isMetric ? 483 : 300;
    const threshold2 = isMetric ? 3700 : 2300;
    
    let flightClass: 'short_haul' | 'medium_haul' | 'long_haul';
    if (normalizedValue < threshold1) {
      flightClass = 'short_haul';
    } else if (normalizedValue < threshold2) {
      flightClass = 'medium_haul';
    } else {
      flightClass = 'long_haul';
    }

    const emissionFactor = factors[flightClass];
    const co2_kg = normalizedValue * emissionFactor;

    return {
      co2_kg,
      emissionFactor,
      emissionFactorSource: `Flight (${flightClass}, ${normalizedUnit})`,
      normalizedValue,
      normalizedUnit,
    };
  }

  /**
   * Calculate other emissions
   */
  private calculateOther(type: string, value: number, unit: string) {
    const emissionFactor = EMISSION_FACTORS.other[type] || 0.5;
    const co2_kg = value * emissionFactor;

    return {
      co2_kg,
      emissionFactor,
      emissionFactorSource: type,
      normalizedValue: value,
      normalizedUnit: unit,
    };
  }

  /**
   * Calculate total emissions for a period
   */
  calculateBulk(activities: CalculationInput[]): { total_co2_kg: number; by_category: Record<string, number> } {
    const by_category: Record<string, number> = {};
    let total_co2_kg = 0;

    for (const activity of activities) {
      const result = this.calculate(activity);
      total_co2_kg += result.co2_kg;
      
      if (!by_category[activity.category]) {
        by_category[activity.category] = 0;
      }
      by_category[activity.category] += result.co2_kg;
    }

    return { total_co2_kg, by_category };
  }
}
