import { Injectable } from '@nestjs/common';
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

@Injectable()
export class OrdersService {
  private readonly orders: OrderResult[] = [];

  constructor(
    private readonly chickenTypesService: ChickenTypesService,
    private readonly customersService: CustomersService,
  ) {}

  async create(input: CreateOrderInput): Promise<OrderResult> {
    const customer = (await this.customersService.findAll()).find((item) => item.id === input.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const chickenTypes = await this.chickenTypesService.findAll();

    const items = input.items.map((item) => {
      const chicken = chickenTypes.find((entry) => entry.id === item.chickenTypeId);
      const unitPrice = chicken?.averagePrice ?? 0;
      const totalPrice = unitPrice * item.quantity;

      return {
        chickenTypeId: item.chickenTypeId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
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
    return order;
  }

  async findAll(): Promise<OrderResult[]> {
    return this.orders;
  }
}
