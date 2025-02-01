import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Auth, GetUser } from '../decorators/Auth.decorator';
import { User } from '@prisma/client';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @Auth()
  create(@Body() createPlaceDto: CreatePlaceDto, @GetUser() user: User) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can create places');
    }
    return this.placesService.create(createPlaceDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.placesService.findAll(query);
  }

  @Get('top')
  getTopPlaces() {
    return this.placesService.getTopPlaces();
  }

  @Get('country/:country')
  getByCountry(@Param('country') country: string) {
    return this.placesService.getByCountry(country);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
    @GetUser() user: User,
  ) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can update places');
    }
    return this.placesService.update(id, updatePlaceDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: User) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can delete places');
    }
    return this.placesService.remove(id);
  }
}
