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
        defaultCookingPrice: number;
        orders: {
            customerName: string;
            customer: import("../common/supabase.service").CustomerRecord | null;
            items: {
                chickenTypeName: string;
                chickenTypeId: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                preparationType: "fresh" | "boiled";
                cookingPrice: number;
            }[];
            id: string;
            customerId: string;
            deliveryMethod: "pickup" | "home";
            deliveryLocation: string;
            paymentStatus: "pending" | "paid" | "partial";
            deliveryStatus: "pending" | "delivered" | "cancelled";
            preparationType?: "fresh" | "boiled";
            cookingPrice?: number;
            totalAmount: number;
        }[];
    }>;
}
