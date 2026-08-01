import { ChickenTypesService } from './chicken-types.service';

describe('ChickenTypesService', () => {
  it('creates and lists chicken types', async () => {
    const service = new ChickenTypesService();

    await service.create({
      name: 'ไก่ตัวผู้',
      unitWeightKg: 2.5,
      pricePerKg: 120,
      averagePrice: 300,
    });

    const items = await service.findAll();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('ไก่ตัวผู้');
  });

  it('accepts an injected Supabase service without breaking fallback behavior', async () => {
    const service = new ChickenTypesService({ getClient: () => null } as any);

    const created = await service.create({
      name: 'ไก่จัมโบ้',
      unitWeightKg: 3.5,
      pricePerKg: 140,
      averagePrice: 490,
    });

    const items = await service.findAll();
    expect(created.name).toBe('ไก่จัมโบ้');
    expect(items.some((item) => item.id === created.id)).toBe(true);
  });
});
