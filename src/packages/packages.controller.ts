import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { Auth, GetUser } from '../decorators/Auth.decorator';
import { User } from '@prisma/client';
import slugify from 'slugify';
import { ReplacePhotoDto } from '@/globals/dto/replacephoto.dto';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @Auth()
  create(@Body() createPackageDto: CreatePackageDto, @GetUser() user: User) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can create packages');
    }
    createPackageDto.slug = slugify(createPackageDto.name, { lower: true });
    return this.packagesService.create(createPackageDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  createMany(@Body() packages: CreatePackageDto[], @GetUser() user: User) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can create packages');
    }
    return this.packagesService.createMany(packages);
  }
  @Get()
  findAll(@Query() query: any) {
    return this.packagesService.findAll(query);
  }

  @Get('featured')
  getFeatured() {
    return this.packagesService.getFeaturedPackages();
  }

  @Get('vip')
  @UseGuards(JwtAuthGuard)
  getVipPackages() {
    return this.packagesService.getVipPackages();
  }

  @Get('top-rated')
  getTopRated() {
    return this.packagesService.getTopRated();
  }

  @Get('most-booked')
  getMostBooked() {
    return this.packagesService.getMostBooked();
  }

  @Get('search')
  search(@Query('term') searchTerm: string) {
    return this.packagesService.search(searchTerm);
  }

  @Get('destination/:destination')
  getByDestination(@Param('destination') destination: string) {
    return this.packagesService.getByDestination(destination);
  }

  @Get('duration/:days')
  getByDuration(@Param('days') days: number) {
    return this.packagesService.getByDuration(days);
  }

  @Get('price-range')
  getByPriceRange(
    @Query('min') minPrice: number,
    @Query('max') maxPrice: number,
  ) {
    return this.packagesService.getByPriceRange(minPrice, maxPrice);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: User) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can delete packages');
    }
    return this.packagesService.remove(id);
  }

  @Delete('slug/:slug')
  @UseGuards(JwtAuthGuard)
  removeBySlug(@Param('slug') slug: string, @GetUser() user: User) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can delete packages');
    }
    return this.packagesService.removeBySlug(slug);
  }

  @Get('slug/:slug')
  GetbySlug(@Param('slug') slug: string) {
    return this.packagesService.findBySlug(slug);
  }
  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  addReview(
    @Param('id') id: string,
    @Body() reviewDto: { rating: number; comment: string },
    @GetUser() user: User,
  ) {
    return this.packagesService.addReview(
      id,
      user.id,
      reviewDto.rating,
      reviewDto.comment,
    );
  }

  @Get(':id/likeStatus')
  @UseGuards(JwtAuthGuard)
  async getLikeStatus(@Param('id') id: string, @GetUser() user: User) {
    return this.packagesService.getLikeStatus(id, user.email);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async likePackage(@Param('id') id: string, @GetUser() user: User) {
    return this.packagesService.like(id, user.email);
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  async unlikePackage(@Param('id') id: string, @GetUser() user: User) {
    return this.packagesService.unlike(id, user.email);
  }

  @Put(':id/replace-photo')
  async replacePhoto(
    @Param('id') id: string,
    @Body() replacePhotoDto: ReplacePhotoDto,
  ) {
    return this.packagesService.replacePhoto(id, replacePhotoDto);
  }
}
