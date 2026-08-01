import { Module } from '@nestjs/common';
import { ChickenTypesModule } from '../chicken-types/chicken-types.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [ChickenTypesModule, CustomersModule, OrdersModule],
  controllers: [AdminController],
})
export class AdminModule {}
