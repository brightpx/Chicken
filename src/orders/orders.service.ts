import { Injectable, NotFoundException } from '@nestjs/common';
import { getDefaultCookingPrice } from '../common/app-config';
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

@Injectable()
export class OrdersService {
  constructor(
    private readonly chickenTypesService: ChickenTypesService,
    private readonly customersService: CustomersService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(input: CreateOrderInput): Promise<OrderResult> {
    const customer = await this.customersService.findById(input.customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const chickenTypes = await this.chickenTypesService.findAll();

    const preparationType = input.preparationType ?? 'fresh';
    const cookingPrice = preparationType === 'boiled' ? (input.cookingPrice ?? getDefaultCookingPrice() ?? 30) : 0;

    const items = input.items.map((item) => {
      const chicken = chickenTypes.find((entry) => entry.id === item.chickenTypeId);
      const itemPreparationType = item.preparationType ?? preparationType;
      const itemCookingPrice = itemPreparationType === 'boiled' ? cookingPrice : 0;
      const unitPrice = (chicken?.averagePrice ?? 0) + itemCookingPrice;
      const totalPrice = unitPrice * item.quantity;

      return {
        chickenTypeId: item.chickenTypeId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        preparationType: itemPreparationType,
        cookingPrice: itemCookingPrice,
      };
    });

    const order: OrderResult = {
      id: `order-${Date.now()}`,
      customerId: input.customerId,
      deliveryMethod: input.deliveryMethod,
      deliveryLocation: input.deliveryLocation,
      paymentStatus: input.paymentStatus,
      deliveryStatus: input.deliveryStatus,
      items,
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
    };

    return this.supabaseService.createOrder(order);
  }

  async findAll(): Promise<OrderResult[]> {
    return this.supabaseService.listOrders();
  }

  async update(id: string, input: UpdateOrderInput): Promise<OrderResult | null> {
    return this.supabaseService.updateOrder(id, input);
  }
}
