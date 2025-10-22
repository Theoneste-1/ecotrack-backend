/**
 * Emission factors for various activities (kg CO2e per unit)
 * Sources: EPA, IPCC, various carbon calculators
 */
export const EMISSION_FACTORS = {
  // Transportation (per mile)
  transport: {
    car_gasoline: 0.404, // kg CO2e per mile
    car_diesel: 0.361,
    car_hybrid: 0.202,
    car_electric: 0.085,
    motorcycle: 0.279,
    bus: 0.089,
    train: 0.041,
    subway: 0.035,
    bicycle: 0.0,
    walking: 0.0,
  },

  // Transportation (per km)
  transport_metric: {
    car_gasoline: 0.251, // kg CO2e per km
    car_diesel: 0.224,
    car_hybrid: 0.126,
    car_electric: 0.053,
    motorcycle: 0.173,
    bus: 0.055,
    train: 0.025,
    subway: 0.022,
  },

  // Flights (per passenger-mile)
  flights: {
    short_haul: 0.254, // < 300 miles
    medium_haul: 0.178, // 300-2300 miles
    long_haul: 0.150, // > 2300 miles
  },

  // Flights (per passenger-km)
  flights_metric: {
    short_haul: 0.158, // < 483 km
    medium_haul: 0.111, // 483-3700 km
    long_haul: 0.093, // > 3700 km
  },

  // Home Energy (per unit)
  home_energy: {
    electricity_kwh: 0.475, // kg CO2e per kWh (US average)
    natural_gas_therm: 5.3, // kg CO2e per therm
    natural_gas_m3: 2.04, // kg CO2e per m³
    heating_oil_gallon: 10.16, // kg CO2e per gallon
    propane_gallon: 5.68, // kg CO2e per gallon
  },

  // Diet (per meal or per day)
  diet: {
    beef_heavy: 3.3, // kg CO2e per meal
    pork_poultry: 1.7,
    pescatarian: 1.2,
    vegetarian: 0.9,
    vegan: 0.6,
  },

  // Diet (daily average)
  diet_daily: {
    high_meat: 7.19, // kg CO2e per day
    medium_meat: 5.63,
    low_meat: 4.67,
    pescatarian: 3.91,
    vegetarian: 3.81,
    vegan: 2.89,
  },

  // Other
  other: {
    waste_kg: 0.5, // kg CO2e per kg of waste
    water_liter: 0.0003, // kg CO2e per liter
    paper_kg: 1.04, // kg CO2e per kg
  },
};

/**
 * Regional electricity emission factors (kg CO2e per kWh)
 */
export const REGIONAL_ELECTRICITY_FACTORS = {
  US: 0.475,
  UK: 0.233,
  DE: 0.338,
  FR: 0.056,
  CN: 0.581,
  IN: 0.708,
  BR: 0.074,
  AU: 0.736,
  CA: 0.130,
  JP: 0.463,
  ZA: 0.928, // South Africa
  DEFAULT: 0.475,
};
