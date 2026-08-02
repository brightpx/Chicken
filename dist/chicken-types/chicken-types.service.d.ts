import { ChickenTypeRecord, SupabaseService } from '../common/supabase.service';
import { OrdersService } from '../orders/orders.service';
export interface CreateChickenTypeDto {
    name: string;
    unitWeightKg: number;
    pricePerKg: number;
    averagePrice: number;
    preparationType?: 'fresh' | 'boiled';
    cookingPrice?: number;
}
export interface UpdateChickenTypeDto extends Partial<CreateChickenTypeDto> {
}
export type ChickenTypeEntity = ChickenTypeRecord;
export declare class ChickenTypesService {
    private readonly supabaseService;
    private readonly ordersService;
    constructor(supabaseService: SupabaseService, ordersService: OrdersService);
    create(dto: CreateChickenTypeDto): Promise<ChickenTypeEntity>;
    findAll(): Promise<ChickenTypeEntity[]>;
    update(id: string, dto: UpdateChickenTypeDto): Promise<ChickenTypeEntity | null>;
}
