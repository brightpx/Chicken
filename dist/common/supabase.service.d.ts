import { SupabaseClient } from '@supabase/supabase-js';
export interface ChickenTypeRecord {
    id: string;
    name: string;
    unitWeightKg: number;
    pricePerKg: number;
    averagePrice: number;
    isActive: boolean;
    preparationType: 'fresh' | 'boiled';
    cookingPrice: number;
}
export interface CustomerRecord {
    id: string;
    name: string;
    phone: string;
    address: string;
    deliveryMethod: 'pickup' | 'home';
}
export interface OrderItemRecord {
    chickenTypeId: string;
    chickenTypeName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    preparationType: 'fresh' | 'boiled';
    cookingPrice: number;
}
export interface OrderRecord {
    id: string;
    customerId: string;
    deliveryMethod: 'pickup' | 'home';
    deliveryLocation: string;
    paymentStatus: 'pending' | 'paid' | 'partial';
    deliveryStatus: 'pending' | 'delivered' | 'cancelled';
    preparationType?: 'fresh' | 'boiled';
    cookingPrice?: number;
    items: OrderItemRecord[];
    totalAmount: number;
}
export declare class SupabaseService {
    private readonly logger;
    private client;
    private pool;
    private readonly memoryChickenTypes;
    private readonly memoryCustomers;
    private readonly memoryOrders;
    private memoryDefaultCookingPrice;
    constructor();
    getClient(): SupabaseClient | null;
    getDefaultCookingPriceSetting(): Promise<number>;
    setDefaultCookingPriceSetting(value: number): Promise<number>;
    createChickenType(entity: ChickenTypeRecord): Promise<ChickenTypeRecord>;
    findChickenTypeById(id: string): Promise<ChickenTypeRecord | null>;
    listChickenTypes(): Promise<ChickenTypeRecord[]>;
    updateChickenType(id: string, dto: Partial<ChickenTypeRecord>): Promise<ChickenTypeRecord | null>;
    createCustomer(entity: CustomerRecord): Promise<CustomerRecord>;
    findCustomerById(id: string): Promise<CustomerRecord | null>;
    listCustomers(): Promise<CustomerRecord[]>;
    createOrder(entity: OrderRecord): Promise<OrderRecord>;
    findOrderById(id: string): Promise<OrderRecord | null>;
    listOrders(): Promise<OrderRecord[]>;
    updateOrder(id: string, dto: Partial<OrderRecord>): Promise<OrderRecord | null>;
    deleteOrder(id: string): Promise<boolean>;
    private mapChickenType;
    private mapCustomer;
    private mapOrder;
    private initializeSchema;
}
