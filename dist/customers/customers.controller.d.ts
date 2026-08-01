import { CustomersService, CreateCustomerDto } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(dto: CreateCustomerDto): Promise<import("../common/supabase.service").CustomerRecord>;
    findAll(): Promise<import("../common/supabase.service").CustomerRecord[]>;
}
