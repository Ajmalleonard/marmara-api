import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import slugify from 'slugify';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async create(createPacksDto: CreatePackageDto) {
    const { itinerary, included, excluded, ...PacksData } = createPacksDto;
    const slug = slugify(createPacksDto.name, { lower: true });

    return this.prisma.package.create({
      data: {
        slug,
        ...PacksData,
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
          create: included.map((title) => ({ title })),
        },
        excluded: {
          create: excluded.map((title) => ({ title })),
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

  async findAll(query: any = {}) {
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

    return this.prisma.package.findMany({
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
  }

  async findOne(slug: string) {
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
      throw new NotFoundException(`Packs with ID ${slug} not found`);
    }

    return Packs;
  }

  async update(id: string, updatePacksDto: UpdatePackageDto) {
    await this.findOne(id);

    const { itinerary, included, excluded, ...PacksData } = updatePacksDto;

    return this.prisma.package.update({
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
            create: included.map((title) => ({ title })),
          },
        }),
        ...(excluded && {
          excluded: {
            deleteMany: {},
            create: excluded.map((title) => ({ title })),
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
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.package.delete({
      where: { id },
    });
  }

  async addReview(id: string, userId: string, rating: number, comment: string) {
    await this.findOne(id);

    return this.prisma.review.create({
      data: {
        rating,
        comment,
        package: { connect: { id } },
      },
    });
  }

  async toggleLike(id: string, userId: string) {
    const Packs = await this.findOne(id);
    const hasLiked = Packs.likedBy.includes(userId);

    return this.prisma.package.update({
      where: { id },
      data: {
        likes: hasLiked ? Packs.likes - 1 : Packs.likes + 1,
        likedBy: hasLiked
          ? { set: Packs.likedBy.filter((id) => id !== userId) }
          : { push: userId },
      },
    });
  }

  async getFeaturedPackages() {
    return this.findAll({ featured: true });
  }

  async getVipPackages() {
    return this.findAll({ isVip: true });
  }
  // Add multiple packages at once
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
                title: item,
              })),
            },
            excluded: {
              create: pkg.excluded.map((item) => ({
                title: item,
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

  // Get packages by destination
  async getByDestination(destination: string) {
    return this.findAll({ destination });
  }

  // Get packages within price range
  async getByPriceRange(minPrice: number, maxPrice: number) {
    return this.findAll({ minPrice, maxPrice });
  }

  // Get top rated packages
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

  // Get most booked packages
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

  // Get packages by duration
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

  // Search packages
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
}
