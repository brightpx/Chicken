import { SupabaseService } from '../common/supabase.service';
import { OrdersService } from '../orders/orders.service';
import { ChickenTypesService } from './chicken-types.service';

function createOrdersServiceMock(): OrdersService {
  return {
    recalculatePricesForChickenType: jest.fn().mockResolvedValue(undefined),
  } as unknown as OrdersService;
}

describe('ChickenTypesService', () => {
  it('creates and lists chicken types', async () => {
    const supabaseService = new SupabaseService();
    const service = new ChickenTypesService(supabaseService, createOrdersServiceMock());

    const created = await service.create({
      name: 'ไก่ตัวผู้',
      unitWeightKg: 2.5,
      pricePerKg: 120,
      averagePrice: 300,
      preparationType: 'boiled',
      cookingPrice: 40,
    });

    const items = await service.findAll();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('ไก่ตัวผู้');
    expect(created.preparationType).toBe('boiled');
    expect(created.cookingPrice).toBe(40);
  });

  it('persists through SupabaseService as single source of truth', async () => {
    const supabaseService = new SupabaseService();
    const service = new ChickenTypesService(supabaseService, createOrdersServiceMock());

    const created = await service.create({
      name: 'ไก่จัมโบ้',
      unitWeightKg: 3.5,
      pricePerKg: 140,
      averagePrice: 490,
      preparationType: 'fresh',
      cookingPrice: 0,
    });

    const items = await service.findAll();
    expect(created.name).toBe('ไก่จัมโบ้');
    expect(items.some((item) => item.id === created.id)).toBe(true);
  });

  it('updates an existing chicken type', async () => {
    const supabaseService = new SupabaseService();
    const service = new ChickenTypesService(supabaseService, createOrdersServiceMock());

    const created = await service.create({
      name: 'ไก่บ้าน',
      unitWeightKg: 2,
      pricePerKg: 100,
      averagePrice: 200,
      preparationType: 'fresh',
      cookingPrice: 0,
    });

    const updated = await service.update(created.id, {
      name: 'ไก่บ้าน (ต้ม)',
      unitWeightKg: 2.5,
      pricePerKg: 110,
      averagePrice: 275,
      preparationType: 'boiled',
      cookingPrice: 30,
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('ไก่บ้าน (ต้ม)');
    expect(updated?.preparationType).toBe('boiled');
    expect(updated?.cookingPrice).toBe(30);
  });
});
