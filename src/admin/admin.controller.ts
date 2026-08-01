import { Controller, Get } from '@nestjs/common';
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

    const totalRevenue = orders.reduce((sum: number, order) => sum + order.totalAmount, 0);

    return {
      totalCustomers: customers.length,
      totalChickenTypes: chickenTypes.length,
      totalOrders: orders.length,
      totalRevenue,
      orders,
    };
  }
}
