import { SupabaseService } from '../common/supabase.service';
export interface CreateCustomerDto {
    name: string;
    phone: string;
    address: string;
    deliveryMethod: 'pickup' | 'home';
}
export interface CustomerEntity {
    id: string;
    name: string;
    phone: string;
    address: string;
    deliveryMethod: 'pickup' | 'home';
}
export declare class CustomersService {
    private readonly supabaseService?;
    private readonly items;
    constructor(supabaseService?: SupabaseService | undefined);
    create(dto: CreateCustomerDto): Promise<CustomerEntity>;
    findAll(): Promise<CustomerEntity[]>;
}
