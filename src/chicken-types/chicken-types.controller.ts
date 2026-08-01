import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChickenTypesService, CreateChickenTypeDto } from './chicken-types.service';

@Controller('chicken-types')
export class ChickenTypesController {
  constructor(private readonly chickenTypesService: ChickenTypesService) {}

  @Post()
  create(@Body() dto: CreateChickenTypeDto) {
    return this.chickenTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.chickenTypesService.findAll();
  }
}
