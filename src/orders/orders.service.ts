import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ChickenTypesService } from '../chicken-types/chicken-types.service';
import { CustomersService } from '../customers/customers.service';
import { OrderItemRecord, OrderRecord, SupabaseService } from '../common/supabase.service';

export interface CreateOrderItemInput {
  chickenTypeId: string;
  quantity: number;
  preparationType?: 'fresh' | 'boiled';
  cookingPrice?: number;
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
  customerId?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial';
  deliveryStatus?: 'pending' | 'delivered' | 'cancelled';
  deliveryMethod?: 'pickup' | 'home';
  deliveryLocation?: string;
  items?: CreateOrderItemInput[];
  totalAmount?: number;
}

export type OrderItemResult = OrderItemRecord;
export type OrderResult = OrderRecord;

@Injectable()
export class OrdersService {
  constructor(
    @Inject(forwardRef(() => ChickenTypesService))
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
    const defaultCookingPrice = await this.supabaseService.getDefaultCookingPriceSetting();

    const preparationType = input.preparationType ?? 'fresh';
    const cookingPrice = preparationType === 'boiled' ? (input.cookingPrice ?? defaultCookingPrice) : 0;

    const items = input.items.map((item) => {
      const chicken = chickenTypes.find((entry) => entry.id === item.chickenTypeId);
      const itemPreparationType = item.preparationType ?? preparationType;
      const itemCookingPrice = itemPreparationType === 'boiled' ? (item.cookingPrice ?? cookingPrice) : 0;
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

  async remove(id: string): Promise<{ success: boolean }> {
    const existing = await this.supabaseService.findOrderById(id);
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const success = await this.supabaseService.deleteOrder(id);
    return { success };
  }

  async update(id: string, input: UpdateOrderInput): Promise<OrderResult | null> {
    const existing = await this.supabaseService.findOrderById(id);
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const updatedItems = input.items
      ? await Promise.all(
          input.items.map(async (item) => {
            const chickenTypes = await this.chickenTypesService.findAll();
            const defaultCookingPrice = await this.supabaseService.getDefaultCookingPriceSetting();
            const chicken = chickenTypes.find((entry) => entry.id === item.chickenTypeId);
            const itemPreparationType = item.preparationType ?? 'fresh';
            const itemCookingPrice = itemPreparationType === 'boiled' ? (item.cookingPrice ?? defaultCookingPrice) : 0;
            const unitPrice = (chicken?.averagePrice ?? 0) + itemCookingPrice;
            const totalPrice = unitPrice * item.quantity;
            return {
              chickenTypeId: item.chickenTypeId,
              quantity: item.quantity,
              unitPrice,
              totalPrice,
              preparationType: itemPreparationType,
              cookingPrice: itemCookingPrice,
            } satisfies OrderItemRecord;
          }),
        )
      : existing.items;

    const updatedOrder = {
      ...input,
      items: updatedItems,
      totalAmount: input.totalAmount ?? updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
    } satisfies Partial<OrderRecord>;

    return this.supabaseService.updateOrder(id, updatedOrder);
  }

  // Keeps existing orders' prices in sync when a chicken type's price is edited.
  async recalculatePricesForChickenType(chickenTypeId: string, newAveragePrice: number): Promise<void> {
    const orders = await this.supabaseService.listOrders();

    const affectedOrders = orders.filter((order) =>
      order.items.some((item) => item.chickenTypeId === chickenTypeId),
    );

    await Promise.all(
      affectedOrders.map((order) => {
        const updatedItems = order.items.map((item) => {
          if (item.chickenTypeId !== chickenTypeId) {
            return item;
          }

          const unitPrice = newAveragePrice + (item.cookingPrice ?? 0);
          return {
            ...item,
            unitPrice,
            totalPrice: unitPrice * item.quantity,
          } satisfies OrderItemRecord;
        });

        const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        return this.supabaseService.updateOrder(order.id, { items: updatedItems, totalAmount });
      }),
    );
  }

  // Keeps existing boiled-item orders in sync when the default cooking price setting changes.
  async recalculateCookingPriceForBoiledOrders(newCookingPrice: number): Promise<void> {
    const [orders, chickenTypes] = await Promise.all([
      this.supabaseService.listOrders(),
      this.chickenTypesService.findAll(),
    ]);

    const affectedOrders = orders.filter((order) =>
      order.items.some((item) => item.preparationType === 'boiled'),
    );

    await Promise.all(
      affectedOrders.map((order) => {
        const updatedItems = order.items.map((item) => {
          if (item.preparationType !== 'boiled') {
            return item;
          }

          const chicken = chickenTypes.find((entry) => entry.id === item.chickenTypeId);
          const unitPrice = (chicken?.averagePrice ?? 0) + newCookingPrice;
          return {
            ...item,
            cookingPrice: newCookingPrice,
            unitPrice,
            totalPrice: unitPrice * item.quantity,
          } satisfies OrderItemRecord;
        });

        const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        return this.supabaseService.updateOrder(order.id, { items: updatedItems, totalAmount });
      }),
    );
  }
}
