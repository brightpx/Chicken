import { Module } from '@nestjs/common';
import { ChickenTypesModule } from '../chicken-types/chicken-types.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';
import { SupabaseModule } from '../common/supabase.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [ChickenTypesModule, CustomersModule, OrdersModule, SupabaseModule],
  controllers: [AdminController],
})
export class AdminModule {}
