import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}

  async create(createPlaceDto: CreatePlaceDto) {
    try {
      const { center, ...placeData } = createPlaceDto;

      const place = await this.prisma.place.create({
        data: {
          ...placeData,
          center: {
            create: {
              latitude: center.lat,
              longitude: center.lng,
            },
          },
        },
        include: {
          center: true,
        },
      });

      return {
        status: 'success',
        message: 'Place created successfully',
        data: place,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to create place',
        error: error.message,
      };
    }
  }

  async findAll(query: any = {}) {
    try {
      const { isTop, country, ...rest } = query;

      let where: any = { ...rest };

      if (isTop) where.isTop = isTop === 'true';
      if (country) where.country = country;

      const places = await this.prisma.place.findMany({
        where,
        include: {
          center: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 'success',
        message: 'Places retrieved successfully',
        data: places,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve places',
        error: error.message,
      };
    }
  }

  async findOne(id: string) {
    try {
      const place = await this.prisma.place.findUnique({
        where: { id },
        include: {
          center: true,
        },
      });

      if (!place) {
        throw new NotFoundException(`Place with ID ${id} not found`);
      }

      return {
        status: 'success',
        message: 'Place retrieved successfully',
        data: place,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve place',
        error: error.message,
      };
    }
  }

  async update(id: string, updatePlaceDto: UpdatePlaceDto) {
    try {
      const { center, ...placeData } = updatePlaceDto;

      const updatedPlace = await this.prisma.place.update({
        where: { id },
        data: {
          ...placeData,
          ...(center && {
            center: {
              update: {
                latitude: center.lat,
                longitude: center.lng,
              },
            },
          }),
        },
        include: {
          center: true,
        },
      });

      return {
        status: 'success',
        message: 'Place updated successfully',
        data: updatedPlace,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to update place',
        error: error.message,
      };
    }
  }

  async remove(id: string) {
    try {
      // The Coordinates will be automatically deleted due to onDelete: Cascade in the schema
      await this.prisma.place.delete({
        where: { id },
      });

      return {
        status: 'success',
        message: 'Place deleted successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to delete place',
        error: error.message,
      };
    }
  }

  async getTopPlaces() {
    return this.findAll({ isTop: true });
  }

  async getByCountry(country: string) {
    return this.findAll({ country });
  }
}
