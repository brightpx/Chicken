import { SupabaseService } from '../common/supabase.service';
import { ChickenTypesService } from '../chicken-types/chicken-types.service';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('calculates total amount for an order with multiple items', async () => {
    const supabaseService = new SupabaseService();
    const chickenTypesService = new ChickenTypesService(supabaseService);
    const customersService = new CustomersService(supabaseService);
    const service = new OrdersService(chickenTypesService, customersService, supabaseService);

    const customer = await customersService.create({
      name: 'Alice',
      phone: '0123456789',
      address: 'Bangkok',
      deliveryMethod: 'home',
    });

    const firstChicken = await chickenTypesService.create({
      name: 'ไก่ตัวผู้',
      unitWeightKg: 2.5,
      pricePerKg: 120,
      averagePrice: 300,
    });

    const secondChicken = await chickenTypesService.create({
      name: 'ไก่จัมโบ้',
      unitWeightKg: 3.5,
      pricePerKg: 140,
      averagePrice: 490,
    });

    const order = await service.create({
      customerId: customer.id,
      deliveryMethod: 'home',
      deliveryLocation: 'Bangkok',
      paymentStatus: 'paid',
      deliveryStatus: 'pending',
      items: [
        { chickenTypeId: firstChicken.id, quantity: 2 },
        { chickenTypeId: secondChicken.id, quantity: 1 },
      ],
    });

    expect(order.totalAmount).toBe(900);
    expect(order.items).toHaveLength(2);
  });
});
