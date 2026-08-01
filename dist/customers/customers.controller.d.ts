import { CustomersService, CreateCustomerDto } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(dto: CreateCustomerDto): Promise<import("./customers.service").CustomerEntity>;
    findAll(): Promise<import("./customers.service").CustomerEntity[]>;
}
