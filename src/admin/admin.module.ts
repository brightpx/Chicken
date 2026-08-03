import { Module } from '@nestjs/common';
import { ChickenTypesModule } from '../chicken-types/chicken-types.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';
import { SupabaseModule } from '../common/supabase.module';
import { GroqModule } from '../groq/groq.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [ChickenTypesModule, CustomersModule, OrdersModule, SupabaseModule, GroqModule],
  controllers: [AdminController],
})
export class AdminModule {}
