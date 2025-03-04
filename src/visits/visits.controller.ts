import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { VisitQueryDto } from './dto/visit-query.dto';
import { Auth } from '../decorators/Auth.decorator';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  create(@Body() createVisitDto: CreateVisitDto, @Req() req: Request) {
    return this.visitsService.create(createVisitDto, req);
  }

  @Get()
  findAll(@Query() query: VisitQueryDto) {
    return this.visitsService.findAll(query);
  }

  @Get('stats')
  getVisitStats() {
    return this.visitsService.getVisitStats();
  }

  @Get('country/:country')
  getVisitsByCountry(@Param('country') country: string) {
    return this.visitsService.findAll({ country });
  }

  @Get('continentchart')
  getStatisticsContinentCount() {
    return this.visitsService.getTopContinentStats();
  }

  @Get('continent/:continent')
  getVisitsByContinent(@Param('continent') continent: string) {
    return this.visitsService.findAll({ continent });
  }

  @Get('page/:page')
  getVisitsByPage(@Param('page') page: string) {
    return this.visitsService.getVisitsByPage(page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.visitsService.findOne(id);
  }
}
