import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { getDefaultCookingPrice } from '../common/app-config';
import { ChickenTypeRecord, SupabaseService } from '../common/supabase.service';
import { OrdersService } from '../orders/orders.service';

export interface CreateChickenTypeDto {
  name: string;
  unitWeightKg: number;
  pricePerKg: number;
  averagePrice: number;
  preparationType?: 'fresh' | 'boiled';
  cookingPrice?: number;
}

export interface UpdateChickenTypeDto extends Partial<CreateChickenTypeDto> {}

export type ChickenTypeEntity = ChickenTypeRecord;

@Injectable()
export class ChickenTypesService {
  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

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

  async update(id: string, dto: UpdateChickenTypeDto): Promise<ChickenTypeEntity | null> {
    const existing = await this.supabaseService.findChickenTypeById(id);
    const updated = await this.supabaseService.updateChickenType(id, dto);

    if (updated && dto.averagePrice !== undefined && dto.averagePrice !== existing?.averagePrice) {
      await this.ordersService.recalculatePricesForChickenType(id, updated.averagePrice);
    }

    return updated;
  }
}
