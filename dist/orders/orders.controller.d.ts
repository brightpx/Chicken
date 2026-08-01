import { CreateOrderInput, OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderInput): Promise<import("./orders.service").OrderResult>;
    findAll(): Promise<import("./orders.service").OrderResult[]>;
}
