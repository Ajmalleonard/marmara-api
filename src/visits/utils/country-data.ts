export interface CountryData {
  name: string;
  code: string;
  continent: string;
}

export const COUNTRIES: CountryData[] = [
  // Europe
  { name: 'United Kingdom', code: 'GB', continent: 'Europe' },
  { name: 'Germany', code: 'DE', continent: 'Europe' },
  { name: 'France', code: 'FR', continent: 'Europe' },
  { name: 'Italy', code: 'IT', continent: 'Europe' },
  { name: 'Spain', code: 'ES', continent: 'Europe' },
  { name: 'Portugal', code: 'PT', continent: 'Europe' },
  { name: 'Netherlands', code: 'NL', continent: 'Europe' },
  { name: 'Belgium', code: 'BE', continent: 'Europe' },
  { name: 'Switzerland', code: 'CH', continent: 'Europe' },
  { name: 'Austria', code: 'AT', continent: 'Europe' },
  { name: 'Sweden', code: 'SE', continent: 'Europe' },
  { name: 'Norway', code: 'NO', continent: 'Europe' },
  { name: 'Denmark', code: 'DK', continent: 'Europe' },
  { name: 'Finland', code: 'FI', continent: 'Europe' },
  { name: 'Ireland', code: 'IE', continent: 'Europe' },
  { name: 'Poland', code: 'PL', continent: 'Europe' },
  { name: 'Greece', code: 'GR', continent: 'Europe' },

  // Asia
  { name: 'China', code: 'CN', continent: 'Asia' },
  { name: 'Japan', code: 'JP', continent: 'Asia' },
  { name: 'South Korea', code: 'KR', continent: 'Asia' },
  { name: 'India', code: 'IN', continent: 'Asia' },
  { name: 'Indonesia', code: 'ID', continent: 'Asia' },
  { name: 'Malaysia', code: 'MY', continent: 'Asia' },
  { name: 'Singapore', code: 'SG', continent: 'Asia' },
  { name: 'Thailand', code: 'TH', continent: 'Asia' },
  { name: 'Vietnam', code: 'VN', continent: 'Asia' },
  { name: 'Philippines', code: 'PH', continent: 'Asia' },
  { name: 'Turkey', code: 'TR', continent: 'Asia' },
  { name: 'Saudi Arabia', code: 'SA', continent: 'Asia' },
  { name: 'UAE', code: 'AE', continent: 'Asia' },
  { name: 'Israel', code: 'IL', continent: 'Asia' },
  { name: 'Pakistan', code: 'PK', continent: 'Asia' },

  // North America
  { name: 'United States', code: 'US', continent: 'North America' },
  { name: 'Canada', code: 'CA', continent: 'North America' },
  { name: 'Mexico', code: 'MX', continent: 'North America' },

  // South America
  { name: 'Brazil', code: 'BR', continent: 'South America' },
  { name: 'Argentina', code: 'AR', continent: 'South America' },
  { name: 'Chile', code: 'CL', continent: 'South America' },
  { name: 'Colombia', code: 'CO', continent: 'South America' },
  { name: 'Peru', code: 'PE', continent: 'South America' },

  // Africa
  { name: 'South Africa', code: 'ZA', continent: 'Africa' },
  { name: 'Egypt', code: 'EG', continent: 'Africa' },
  { name: 'Nigeria', code: 'NG', continent: 'Africa' },
  { name: 'Kenya', code: 'KE', continent: 'Africa' },
  { name: 'Morocco', code: 'MA', continent: 'Africa' },
  { name: 'Ghana', code: 'GH', continent: 'Africa' },
  { name: 'Ethiopia', code: 'ET', continent: 'Africa' },

  // Oceania
  { name: 'Australia', code: 'AU', continent: 'Oceania' },
  { name: 'New Zealand', code: 'NZ', continent: 'Oceania' },
  { name: 'Fiji', code: 'FJ', continent: 'Oceania' },
];

export const getContinent = (country: string): string => {
  const foundCountry = COUNTRIES.find((c) => c.name === country);
  return foundCountry?.continent || 'Unknown';
};
