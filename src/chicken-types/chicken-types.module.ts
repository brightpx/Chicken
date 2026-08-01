import { Module } from '@nestjs/common';
import { SupabaseModule } from '../common/supabase.module';
import { ChickenTypesController } from './chicken-types.controller';
import { ChickenTypesService } from './chicken-types.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ChickenTypesController],
  providers: [ChickenTypesService],
  exports: [ChickenTypesService],
})
export class ChickenTypesModule {}
