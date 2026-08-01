import { SupabaseService } from '../common/supabase.service';
export interface CreateChickenTypeDto {
    name: string;
    unitWeightKg: number;
    pricePerKg: number;
    averagePrice: number;
}
export interface ChickenTypeEntity {
    id: string;
    name: string;
    unitWeightKg: number;
    pricePerKg: number;
    averagePrice: number;
    isActive: boolean;
}
export declare class ChickenTypesService {
    private readonly supabaseService?;
    private readonly items;
    constructor(supabaseService?: SupabaseService | undefined);
    create(dto: CreateChickenTypeDto): Promise<ChickenTypeEntity>;
    findAll(): Promise<ChickenTypeEntity[]>;
}
