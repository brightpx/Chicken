import { Injectable } from '@nestjs/common';
import { getDefaultCookingPrice } from '../common/app-config';
import { ChickenTypeRecord, SupabaseService } from '../common/supabase.service';

export interface CreateChickenTypeDto {
  name: string;
  unitWeightKg: number;
  pricePerKg: number;
  averagePrice: number;
  preparationType?: 'fresh' | 'boiled';
  cookingPrice?: number;
}

export type ChickenTypeEntity = ChickenTypeRecord;

@Injectable()
export class ChickenTypesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(dto: CreateChickenTypeDto): Promise<ChickenTypeEntity> {
    const entity: ChickenTypeEntity = {
      id: `chicken-${Date.now()}`,
      name: dto.name,
      unitWeightKg: dto.unitWeightKg,
      pricePerKg: dto.pricePerKg,
      averagePrice: dto.averagePrice,
      isActive: true,
      preparationType: dto.preparationType ?? 'fresh',
      cookingPrice: dto.cookingPrice ?? getDefaultCookingPrice(),
    };

    return this.supabaseService.createChickenType(entity);
  }

  async findAll(): Promise<ChickenTypeEntity[]> {
    return this.supabaseService.listChickenTypes();
  }
}
