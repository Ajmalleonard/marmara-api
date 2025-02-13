import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { getContinent } from './utils/country-data';
import { VisitQueryDto } from './dto/visit-query.dto';
import { Request } from 'express';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(createVisitDto: CreateVisitDto, req: Request) {
    console.log(createVisitDto);
    try {
      const visit = await this.prisma.visit.create({
        data: {
          ...createVisitDto,
          visitDate: createVisitDto.visitDate || new Date(),
          userAgent: req.headers['user-agent'] || 'Unknown',
        },
      });

      return {
        status: 'success',
        message: 'Visit recorded successfully',
        data: visit,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to record visit',
        error: error.message,
      };
    }
  }

  async findAll(query: VisitQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.continent) {
      where['continent'] = query.continent;
    }

    const [total, visits] = await Promise.all([
      this.prisma.visit.count({ where }),
      this.prisma.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          visitDate: 'desc',
        },
      }),
    ]);

    const visitsWithContinent = visits.map((visit) => ({
      ...visit,
      continent: getContinent(visit.country),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      status: 'success',
      message: 'Visits retrieved successfully',
      data: {
        visits: visitsWithContinent,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  }

  async findOne(id: string) {
    try {
      const visit = await this.prisma.visit.findUnique({
        where: { id },
      });

      if (!visit) {
        throw new NotFoundException(`Visit with ID ${id} not found`);
      }

      return {
        status: 'success',
        message: 'Visit retrieved successfully',
        data: visit,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve visit',
        error: error.message,
      };
    }
  }

  async getVisitsByCountry(country: string) {
    try {
      const visits = await this.prisma.visit.findMany({
        where: { country },
        orderBy: {
          visitDate: 'desc',
        },
      });

      return {
        status: 'success',
        message: 'Visits retrieved successfully',
        data: visits,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve visits',
        error: error.message,
      };
    }
  }

  async getVisitsByPage(page: string) {
    try {
      const visits = await this.prisma.visit.findMany({
        where: { page },
        orderBy: {
          visitDate: 'desc',
        },
      });

      return {
        status: 'success',
        message: 'Visits retrieved successfully',
        data: visits,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve visits',
        error: error.message,
      };
    }
  }

  async getVisitStats() {
    try {
      const visits = await this.prisma.visit.findMany();
      const visitsWithContinent = visits.map((visit) => ({
        ...visit,
        continent: getContinent(visit.country),
      }));

      // Group by country
      const countryStats = this.groupBy(visitsWithContinent, 'country');

      // Group by continent
      const continentStats = this.groupBy(visitsWithContinent, 'continent');

      // Get monthly stats by continent
      const monthlyStats =
        this.getMonthlyVisitsByContinent(visitsWithContinent);

      return {
        status: 'success',
        message: 'Visit statistics retrieved successfully',
        data: {
          totalVisits: visits.length,
          countryStats,
          continentStats,
          monthlyStats,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve visit statistics',
        error: error.message,
      };
    }
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((result, item) => {
      (result[item[key]] = result[item[key]] || []).push(item);
      return result;
    }, {});
  }

  async getTopContinentStats() {
    try {
      const visits = await this.prisma.visit.findMany();
      const visitsWithContinent = visits
        .map((visit) => ({
          ...visit,
          continent: getContinent(visit.country),
        }))
        .filter((visit) => visit.continent !== 'Unknown'); // Filter out Unknown continents

      // Group by continent and count visits
      const continentCounts = visitsWithContinent.reduce(
        (acc, visit) => {
          acc[visit.continent] = (acc[visit.continent] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Convert to array, sort by count, and take top 4
      const topContinents = Object.entries(continentCounts)
        .map(([continent, count]) => ({
          continent,
          visits: count,
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 4);

      return {
        status: 'success',
        message: 'Top continent statistics retrieved successfully',
        data: topContinents,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve continent statistics',
        error: error.message,
      };
    }
  }

  private getMonthlyVisitsByContinent(visits: any[]) {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(2000, i).toLocaleString('default', { month: 'short' }),
      Asia: 0,
      Europe: 0,
      'North America': 0,
      'South America': 0,
      Africa: 0,
      Oceania: 0,
      Unknown: 0,
    }));

    visits.forEach((visit) => {
      const date = new Date(visit.visitDate);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        months[monthIndex][visit.continent] += 1;
      }
    });

    return months;
  }
}
