import { ChickenTypesService } from '../chicken-types/chicken-types.service';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';
export declare class AdminController {
    private readonly chickenTypesService;
    private readonly customersService;
    private readonly ordersService;
    constructor(chickenTypesService: ChickenTypesService, customersService: CustomersService, ordersService: OrdersService);
    getDashboard(): Promise<{
        totalCustomers: number;
        totalChickenTypes: number;
        totalOrders: number;
        totalRevenue: number;
        orders: import("../orders/orders.service").OrderResult[];
    }>;
}
