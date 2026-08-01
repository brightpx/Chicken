import { Injectable } from '@nestjs/common';
import { ChickenTypesService } from '../chicken-types/chicken-types.service';
import { CustomersService } from '../customers/customers.service';
import { SupabaseService } from '../common/supabase.service';

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
  items: CreateOrderItemInput[];
}

export interface OrderItemResult {
  chickenTypeId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  preparationType: 'fresh' | 'boiled';
  cookingPrice: number;
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

@Injectable()
export class OrdersService {
  private readonly orders: OrderResult[] = [];

  constructor(
    private readonly chickenTypesService: ChickenTypesService,
    private readonly customersService: CustomersService,
    private readonly supabaseService?: SupabaseService,
  ) {}

  async create(input: CreateOrderInput): Promise<OrderResult> {
    const customer = (await this.customersService.findAll()).find((item) => item.id === input.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const chickenTypes = await this.chickenTypesService.findAll();

    const items = input.items.map((item) => {
      const chicken = chickenTypes.find((entry) => entry.id === item.chickenTypeId);
      const preparationType = item.preparationType ?? chicken?.preparationType ?? 'fresh';
      const cookingPrice = preparationType === 'boiled' ? (chicken?.cookingPrice ?? 0) : 0;
      const unitPrice = (chicken?.averagePrice ?? 0) + cookingPrice;
      const totalPrice = unitPrice * item.quantity;

      return {
        chickenTypeId: item.chickenTypeId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        preparationType,
        cookingPrice,
      };
    });

    const order: OrderResult = {
      customerId: input.customerId,
      deliveryMethod: input.deliveryMethod,
      deliveryLocation: input.deliveryLocation,
      paymentStatus: input.paymentStatus,
      deliveryStatus: input.deliveryStatus,
      items,
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
    };

    this.orders.push(order);
    await this.supabaseService?.createOrder(order as any);
    return order;
  }

  async findAll(): Promise<OrderResult[]> {
    const persisted = await this.supabaseService?.listOrders();
    if (persisted && persisted.length > 0) {
      return persisted;
    }

    return this.orders;
  }
}
