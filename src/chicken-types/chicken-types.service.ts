import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

export interface CreateChickenTypeDto {
  name: string;
  unitWeightKg: number;
  pricePerKg: number;
  averagePrice: number;
}

export interface ChickenTypeEntity {
  id: string;
  name: string;
  unitWeightKg: number;
  pricePerKg: number;
  averagePrice: number;
  isActive: boolean;
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
    };

    this.items.push(entity);

    const client = this.supabaseService?.getClient();
    if (client) {
      await client.from('chicken_types').insert({
        id: entity.id,
        name: entity.name,
        unit_weight_kg: entity.unitWeightKg,
        price_per_kg: entity.pricePerKg,
        average_price: entity.averagePrice,
        is_active: entity.isActive,
      });
    }

    return entity;
  }

  async findAll(): Promise<ChickenTypeEntity[]> {
    const client = this.supabaseService?.getClient();
    if (client) {
      const { data } = await client.from('chicken_types').select('*');
      if (data) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          unitWeightKg: item.unit_weight_kg,
          pricePerKg: item.price_per_kg,
          averagePrice: item.average_price,
          isActive: item.is_active,
        }));
      }
    }

    return this.items;
  }
}
