import { ChickenTypesService } from '../chicken-types/chicken-types.service';
import { CustomersService } from '../customers/customers.service';
export interface CreateOrderItemInput {
    chickenTypeId: string;
    quantity: number;
}
export interface CreateOrderInput {
    customerId: string;
    deliveryMethod: 'pickup' | 'home';
    deliveryLocation: string;
    paymentStatus: 'pending' | 'paid' | 'partial';
    deliveryStatus: 'pending' | 'delivered' | 'cancelled';
    items: CreateOrderItemInput[];
}
export interface OrderItemResult {
    chickenTypeId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface OrderResult {
    customerId: string;
    deliveryMethod: 'pickup' | 'home';
    deliveryLocation: string;
    paymentStatus: 'pending' | 'paid' | 'partial';
    deliveryStatus: 'pending' | 'delivered' | 'cancelled';
    items: OrderItemResult[];
    totalAmount: number;
}
export declare class OrdersService {
    private readonly chickenTypesService;
    private readonly customersService;
    private readonly orders;
    constructor(chickenTypesService: ChickenTypesService, customersService: CustomersService);
    create(input: CreateOrderInput): Promise<OrderResult>;
    findAll(): Promise<OrderResult[]>;
}
