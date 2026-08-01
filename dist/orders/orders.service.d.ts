import { ChickenTypesService } from '../chicken-types/chicken-types.service';
import { CustomersService } from '../customers/customers.service';
import { OrderItemRecord, OrderRecord, SupabaseService } from '../common/supabase.service';
export interface CreateOrderItemInput {
    chickenTypeId: string;
    quantity: number;
    preparationType?: 'fresh' | 'boiled';
}
export interface CreateOrderInput {
    customerId: string;
    deliveryMethod: 'pickup' | 'home';
    deliveryLocation: string;
    paymentStatus: 'pending' | 'paid' | 'partial';
    deliveryStatus: 'pending' | 'delivered' | 'cancelled';
    preparationType?: 'fresh' | 'boiled';
    cookingPrice?: number;
    items: CreateOrderItemInput[];
}
export interface UpdateOrderInput {
    paymentStatus?: 'pending' | 'paid' | 'partial';
    deliveryStatus?: 'pending' | 'delivered' | 'cancelled';
    deliveryMethod?: 'pickup' | 'home';
    deliveryLocation?: string;
}
export type OrderItemResult = OrderItemRecord;
export type OrderResult = OrderRecord;
export declare class OrdersService {
    private readonly chickenTypesService;
    private readonly customersService;
    private readonly supabaseService;
    constructor(chickenTypesService: ChickenTypesService, customersService: CustomersService, supabaseService: SupabaseService);
    create(input: CreateOrderInput): Promise<OrderResult>;
    findAll(): Promise<OrderResult[]>;
    update(id: string, input: UpdateOrderInput): Promise<OrderResult | null>;
}
