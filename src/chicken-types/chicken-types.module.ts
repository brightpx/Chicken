import { forwardRef, Module } from '@nestjs/common';
import { SupabaseModule } from '../common/supabase.module';
import { OrdersModule } from '../orders/orders.module';
import { ChickenTypesController } from './chicken-types.controller';
import { ChickenTypesService } from './chicken-types.service';

@Module({
  imports: [SupabaseModule, forwardRef(() => OrdersModule)],
  controllers: [ChickenTypesController],
  providers: [ChickenTypesService],
  exports: [ChickenTypesService],
})
export class ChickenTypesModule {}
