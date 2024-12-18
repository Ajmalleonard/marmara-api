import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPackageDto: CreatePackageDto, @GetUser() user: User) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can create packages');
    }
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
  getVipPackages(@GetUser() user: User) {
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
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
    @GetUser() user: User,
  ) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can update packages');
    }
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @GetUser() user: User) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can delete packages');
    }
    return this.packagesService.remove(id);
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

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(@Param('id') id: string, @GetUser() user: User) {
    return this.packagesService.toggleLike(id, user.id);
  }
}
