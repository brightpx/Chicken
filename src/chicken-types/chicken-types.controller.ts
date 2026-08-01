import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ChickenTypesService, CreateChickenTypeDto, UpdateChickenTypeDto } from './chicken-types.service';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChickenTypeDto) {
    return this.chickenTypesService.update(id, dto);
  }
}
