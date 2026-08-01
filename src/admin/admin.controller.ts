import { Controller, Get } from '@nestjs/common';
import { getDefaultCookingPrice } from '../common/app-config';
import { ChickenTypesService } from '../chicken-types/chicken-types.service';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly chickenTypesService: ChickenTypesService,
    private readonly customersService: CustomersService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    const [customers, chickenTypes, orders] = await Promise.all([
      this.customersService.findAll(),
      this.chickenTypesService.findAll(),
      this.ordersService.findAll(),
    ]);

    const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
    const chickenTypeMap = new Map(chickenTypes.map((chickenType) => [chickenType.id, chickenType]));
    const enrichedOrders = orders.map((order) => ({
      ...order,
      customerName: customerMap.get(order.customerId)?.name ?? order.customerId,
      customer: customerMap.get(order.customerId) ?? null,
      items: Array.isArray(order.items)
        ? order.items.map((item) => {
            const chickenType = chickenTypeMap.get(item.chickenTypeId);
            return {
              ...item,
              chickenTypeName: chickenType?.name ?? 'ไก่',
            };
          })
        : [],
    }));

    const totalRevenue = enrichedOrders.reduce((sum: number, order) => sum + Number(order.totalAmount ?? 0), 0);
    const paidRevenue = enrichedOrders.reduce((sum: number, order) => {
      if (order.paymentStatus !== 'paid') {
        return sum;
      }
      return sum + Number(order.totalAmount ?? 0);
    }, 0);

    return {
      totalCustomers: customers.length,
      totalChickenTypes: chickenTypes.length,
      totalOrders: orders.length,
      totalRevenue,
      paidRevenue,
      defaultCookingPrice: getDefaultCookingPrice(),
      orders: enrichedOrders,
    };
  }
}
