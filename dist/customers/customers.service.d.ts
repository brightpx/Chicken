import { CustomerRecord, SupabaseService } from '../common/supabase.service';
export interface CreateCustomerDto {
    name: string;
    phone: string;
    address: string;
    deliveryMethod: 'pickup' | 'home';
}
export type CustomerEntity = CustomerRecord;
export declare class CustomersService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    create(dto: CreateCustomerDto): Promise<CustomerEntity>;
    findById(id: string): Promise<CustomerEntity | null>;
    findAll(): Promise<CustomerEntity[]>;
}
