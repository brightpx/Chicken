import { Module } from '@nestjs/common';
import { ChickenTypesModule } from '../chicken-types/chicken-types.module';
import { CustomersModule } from '../customers/customers.module';
import { SupabaseModule } from '../common/supabase.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [ChickenTypesModule, CustomersModule, SupabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
