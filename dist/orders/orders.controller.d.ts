import { CreateOrderInput, OrdersService, UpdateOrderInput } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderInput): Promise<import("../common/supabase.service").OrderRecord>;
    findAll(): Promise<import("../common/supabase.service").OrderRecord[]>;
    update(id: string, dto: UpdateOrderInput): Promise<import("../common/supabase.service").OrderRecord | null>;
}
