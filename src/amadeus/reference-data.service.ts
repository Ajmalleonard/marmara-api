import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AmadeusService } from './amadeus.service';
import {
  AirportCitySearchDto,
  AirlineCodeLookupDto,
} from './dto/flight-search.dto';
import {
  AirportCitySearchResponse,
  AirlineCodeLookupResponse,
  LocationData,
  AirlineData,
} from './interfaces/amadeus.interface';
import { ReferenceDataType } from '@prisma/client';

@Injectable()
export class ReferenceDataService {
  private readonly logger = new Logger(ReferenceDataService.name);
  private readonly CACHE_DURATION_HOURS = 24; // Cache for 24 hours

  constructor(
    private readonly prisma: PrismaService,
    private readonly amadeusService: AmadeusService,
  ) {}

  /**
   * Search for airports and cities with caching
   */
  async searchLocations(
    searchDto: AirportCitySearchDto,
  ): Promise<LocationData[]> {
    const cacheKey = this.generateLocationCacheKey(searchDto);

    try {
      // Try to get from cache first
      const cachedData = await this.getCachedData(
        cacheKey,
        ReferenceDataType.AIRPORT,
      );
      if (cachedData) {
        this.logger.debug(`Cache hit for location search: ${cacheKey}`);
        return cachedData as LocationData[];
      }

      // If not in cache, fetch from Amadeus
      this.logger.debug(`Cache miss for location search: ${cacheKey}`);
      const response = await this.amadeusService.searchAirportsAndCities(
        searchDto,
      );

      // Cache the results
      await this.cacheData(
        cacheKey,
        ReferenceDataType.AIRPORT,
        response.data || [],
      );

      return response.data || [];
    } catch (error) {
      this.logger.error(
        `Error searching locations: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Lookup airline codes with caching
   */
  async lookupAirlines(
    lookupDto: AirlineCodeLookupDto,
  ): Promise<AirlineData[]> {
    const cacheKey = this.generateAirlineCacheKey(lookupDto);

    try {
      // Try to get from cache first
      const cachedData = await this.getCachedData(
        cacheKey,
        ReferenceDataType.AIRLINE,
      );
      if (cachedData) {
        this.logger.debug(`Cache hit for airline lookup: ${cacheKey}`);
        return cachedData as AirlineData[];
      }

      // If not in cache, fetch from Amadeus
      this.logger.debug(`Cache miss for airline lookup: ${cacheKey}`);
      const response = await this.amadeusService.lookupAirlineCodes(lookupDto);

      // Cache the results
      await this.cacheData(
        cacheKey,
        ReferenceDataType.AIRLINE,
        response.data || [],
      );

      return response.data || [];
    } catch (error) {
      this.logger.error(
        `Error looking up airlines: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get popular airports (cached frequently accessed airports)
   */
  async getPopularAirports(): Promise<LocationData[]> {
    const popularIataCodes = [
      'JFK',
      'LAX',
      'LHR',
      'CDG',
      'DXB',
      'NRT',
      'SIN',
      'FRA',
      'AMS',
      'MAD',
      'DAR', // Dar es Salaam
      'JRO', // Kilimanjaro
      'ZNZ', // Zanzibar
    ];

    const popularAirports: LocationData[] = [];

    for (const iataCode of popularIataCodes) {
      try {
        const airports = await this.searchLocations({
          keyword: iataCode,
          subType: 'AIRPORT',
        });
        if (airports.length > 0) {
          popularAirports.push(airports[0]);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to fetch popular airport ${iataCode}: ${error.message}`,
        );
      }
    }

    return popularAirports;
  }

  /**
   * Generate cache key for location searches
   */
  private generateLocationCacheKey(searchDto: AirportCitySearchDto): string {
    const { keyword, subType, countryCode, max, include } = searchDto;
    return `location:${keyword}:${subType || 'all'}:${countryCode || 'all'}:${max || 20}:${include || false}`;
  }

  /**
   * Generate cache key for airline lookups
   */
  private generateAirlineCacheKey(lookupDto: AirlineCodeLookupDto): string {
    const { airlineCodes, IATACode, ICAOCode } = lookupDto;
    const codes = [airlineCodes, IATACode, ICAOCode].filter(Boolean);
    return `airline:${codes.join(',')}`;
  }

  /**
   * Get cached data if it exists and is not expired
   */
  private async getCachedData(
    cacheKey: string,
    dataType: ReferenceDataType,
  ): Promise<any | null> {
    try {
      const cached = await this.prisma.referenceDataCache.findUnique({
        where: { cacheKey },
      });

      if (!cached) {
        return null;
      }

      // Check if cache is expired
      if (new Date() > cached.expiresAt) {
        // Delete expired cache entry
        await this.prisma.referenceDataCache.delete({
          where: { cacheKey },
        });
        return null;
      }

      // Update access count and last access time
      await this.prisma.referenceDataCache.update({
        where: { cacheKey },
        data: {
          accessCount: { increment: 1 },
          lastAccess: new Date(),
        },
      });

      return cached.data;
    } catch (error) {
      this.logger.error(
        `Error retrieving cached data: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Cache data with expiration
   */
  private async cacheData(
    cacheKey: string,
    dataType: ReferenceDataType,
    data: any,
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.CACHE_DURATION_HOURS);

      await this.prisma.referenceDataCache.upsert({
        where: { cacheKey },
        update: {
          data,
          expiresAt,
          lastAccess: new Date(),
          updatedAt: new Date(),
        },
        create: {
          cacheKey,
          dataType,
          data,
          expiresAt,
          accessCount: 1,
          lastAccess: new Date(),
        },
      });

      this.logger.debug(`Cached data with key: ${cacheKey}`);
    } catch (error) {
      this.logger.error(
        `Error caching data: ${error.message}`,
        error.stack,
      );
      // Don't throw error for caching failures
    }
  }
}