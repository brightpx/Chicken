import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

export interface CreateChickenTypeDto {
  name: string;
  unitWeightKg: number;
  pricePerKg: number;
  averagePrice: number;
  preparationType?: 'fresh' | 'boiled';
  cookingPrice?: number;
}

export interface ChickenTypeEntity {
  id: string;
  name: string;
  unitWeightKg: number;
  pricePerKg: number;
  averagePrice: number;
  isActive: boolean;
  preparationType: 'fresh' | 'boiled';
  cookingPrice: number;
}

@Injectable()
export class ChickenTypesService {
  private readonly items: ChickenTypeEntity[] = [];

  constructor(private readonly supabaseService?: SupabaseService) {}

  async create(dto: CreateChickenTypeDto): Promise<ChickenTypeEntity> {
    const entity: ChickenTypeEntity = {
      id: `chicken-${Date.now()}`,
      name: dto.name,
      unitWeightKg: dto.unitWeightKg,
      pricePerKg: dto.pricePerKg,
      averagePrice: dto.averagePrice,
      isActive: true,
      preparationType: dto.preparationType ?? 'fresh',
      cookingPrice: dto.cookingPrice ?? 0,
    };

    this.items.push(entity);
    await this.supabaseService?.createChickenType(entity);

    return entity;
  }

  async findAll(): Promise<ChickenTypeEntity[]> {
    const persisted = await this.supabaseService?.listChickenTypes();
    if (persisted && persisted.length > 0) {
      return persisted;
    }

    return this.items;
  }
}
