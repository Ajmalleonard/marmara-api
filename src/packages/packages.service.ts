import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async create(createPackageDto: CreatePackageDto) {
    try {
      const { itinerary, included, excluded, ...packageData } =
        createPackageDto;

      const pack = await this.prisma.package.create({
        data: {
          ...packageData,
          itinerary: {
            create: itinerary.map((day) => ({
              day: day.day,
              title: day.title,
              activities: {
                create: day.activities,
              },
            })),
          },
          included: {
            create: included.map((item) => ({
              title: item.title,
            })),
          },
          excluded: {
            create: excluded.map((item) => ({
              title: item.title,
            })),
          },
        },
        include: {
          itinerary: {
            include: {
              activities: true,
            },
          },
          included: true,
          excluded: true,
        },
      });

      return {
        status: 'success',
        message: 'Package created successfully',
        data: pack,
      };
    } catch (error) {
      console.error('Error creating package:', error);

      if (error.code === 'P2002') {
        throw new BadRequestException(
          'A package with this name already exists.',
        );
      }

      throw new BadRequestException(
        'Failed to create package. Please check your input data.',
      );
    }
  }

  async findAll(query: any = {}) {
    try {
      const {
        featured,
        destination,
        minPrice,
        maxPrice,
        isVip,
        isMemberOnly,
        ...rest
      } = query;

      let where: any = { ...rest };

      if (featured) where.featured = featured === 'true';
      if (destination) where.destination = destination;
      if (isVip) where.isVip = isVip === 'true';
      if (isMemberOnly) where.isMemberOnly = isMemberOnly === 'true';
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      const packages = await this.prisma.package.findMany({
        where,
        include: {
          itinerary: {
            include: {
              activities: true,
            },
          },
          included: true,
          excluded: true,
          reviews: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 'success',
        message: 'Packages retrieved successfully',
        data: packages,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve packages',
        error: error.message,
      };
    }
  }

  async findOne(slug: string) {
    try {
      const Packs = await this.prisma.package.findUnique({
        where: { slug },
        include: {
          itinerary: {
            include: {
              activities: true,
            },
          },
          included: true,
          excluded: true,
          reviews: true,
        },
      });

      if (!Packs) {
        return {
          status: 'error',
          message: `Package with ID ${slug} not found`,
          error: 'NotFound',
        };
      }

      return {
        status: 'success',
        message: 'Package retrieved successfully',
        data: Packs,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve package',
        error: error.message,
      };
    }
  }

  async update(id: string, updatePacksDto: UpdatePackageDto) {
    try {
      await this.findOne(id);

      const { itinerary, included, excluded, ...PacksData } = updatePacksDto;

      const updatedPackage = await this.prisma.package.update({
        where: { id },
        data: {
          ...PacksData,
          ...(itinerary && {
            itinerary: {
              deleteMany: {},
              create: itinerary.map((day) => ({
                day: day.day,
                title: day.title,
                activities: {
                  create: day.activities,
                },
              })),
            },
          }),
          ...(included && {
            included: {
              deleteMany: {},
              create: included.map((item) => ({
                title: item.title,
              })),
            },
          }),
          ...(excluded && {
            excluded: {
              deleteMany: {},
              create: excluded.map((item) => ({
                title: item.title,
              })),
            },
          }),
        },
        include: {
          itinerary: {
            include: {
              activities: true,
            },
          },
          included: true,
          excluded: true,
        },
      });

      return {
        status: 'success',
        message: 'Package updated successfully',
        data: updatedPackage,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to update package',
        error: error.message,
      };
    }
  }

  async addReview(id: string, userId: string, rating: number, comment: string) {
    try {
      await this.findOne(id);

      const review = await this.prisma.review.create({
        data: {
          rating,
          comment,
          package: { connect: { id } },
        },
      });

      return {
        status: 'success',
        message: 'Review added successfully',
        data: review,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to add review',
        error: error.message,
      };
    }
  }

  async toggleLike(id: string, userId: string) {
    try {
      const Packs = await this.findOne(id);
      const hasLiked = Packs.data.likedBy.includes(userId);

      const updatedPackage = await this.prisma.package.update({
        where: { id },
        data: {
          likes: hasLiked ? Packs.data.likes - 1 : Packs.data.likes + 1,
          likedBy: hasLiked
            ? { set: Packs.data.likedBy.filter((id) => id !== userId) }
            : { push: userId },
        },
      });

      return {
        status: 'success',
        message: hasLiked
          ? 'Package unliked successfully'
          : 'Package liked successfully',
        data: updatedPackage,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to toggle like',
        error: error.message,
      };
    }
  }

  async getFeaturedPackages() {
    return this.findAll({ featured: true });
  }

  async getVipPackages() {
    return this.findAll({ isVip: true });
  }

  async createMany(packages: CreatePackageDto[]) {
    const createdPackages = await Promise.all(
      packages.map((pkg) => {
        return this.prisma.package.create({
          data: {
            ...pkg,
            itinerary: {
              create: pkg.itinerary.map((day) => ({
                day: day.day,
                title: day.title,
                activities: {
                  create: day.activities,
                },
              })),
            },
            included: {
              create: pkg.included.map((item) => ({
                title: item.title,
              })),
            },
            excluded: {
              create: pkg.excluded.map((item) => ({
                title: item.title,
              })),
            },
          },
          include: {
            itinerary: {
              include: {
                activities: true,
              },
            },
            included: true,
            excluded: true,
          },
        });
      }),
    );

    return createdPackages;
  }

  async getByDestination(destination: string) {
    return this.findAll({ destination });
  }

  async getByPriceRange(minPrice: number, maxPrice: number) {
    return this.findAll({ minPrice, maxPrice });
  }

  async getTopRated() {
    const packages = await this.prisma.package.findMany({
      include: {
        reviews: true,
      },
    });

    return packages
      .map((pkg) => ({
        ...pkg,
        averageRating:
          pkg.reviews.reduce((acc, review) => acc + review.rating, 0) /
          pkg.reviews.length,
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);
  }

  async getMostBooked() {
    return this.prisma.package.findMany({
      include: {
        bookings: true,
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: 10,
    });
  }

  async getByDuration(days: number) {
    return this.prisma.package.findMany({
      where: {
        days: {
          equals: days,
        },
      },
      include: {
        itinerary: {
          include: {
            activities: true,
          },
        },
        included: true,
        excluded: true,
      },
    });
  }

  async search(searchTerm: string) {
    return this.prisma.package.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { destination: { contains: searchTerm, mode: 'insensitive' } },
          { descriptions: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        itinerary: {
          include: {
            activities: true,
          },
        },
        included: true,
        excluded: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const Package = await this.prisma.package.findUnique({
      where: { slug },
      include: {
        itinerary: {
          include: {
            activities: true,
          },
        },
        included: true,
        excluded: true,
        reviews: true,
      },
    });

    if (!Package) {
      throw new NotFoundException(`Package with slug ${slug} not found`);
    }

    return Package;
  }

  async removeBySlug(slug: string) {
    const pack = await this.findBySlug(slug);
    return this.remove(pack.id);
  }

  async remove(id: string) {
    // Start an interactive transaction
    console.log('Hits on delete package');
    return await this.prisma.$transaction(async (tx) => {
      // Check if package exists
      const pack = await tx.package.findUnique({
        where: { id },
        include: {
          itinerary: true,
          included: true,
          excluded: true,
          reviews: true,
        },
      });

      console.log('Hits on delete package', pack);

      if (!pack) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }

      // Delete related data in sequence
      await tx.review.deleteMany({
        where: { packageId: id },
      });

      // Get all itinerary IDs
      const itineraryIds = pack.itinerary.map((i) => i.id);

      await tx.activity.deleteMany({
        where: { itineraryId: { in: itineraryIds } },
      });

      await tx.itinerary.deleteMany({
        where: { packageId: id },
      });

      await tx.included.deleteMany({
        where: { packageId: id },
      });

      await tx.excluded.deleteMany({
        where: { packageId: id },
      });

      // Finally delete the package
      const deletedPackage = await tx.package.delete({
        where: { id },
      });
      console.log('Hits on delete package here', deletedPackage);
      return {
        status: 'success',
        message: 'Package deleted successfully',
        data: deletedPackage,
      };
    });
  }
}
