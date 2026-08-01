import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import { getDefaultCookingPrice } from './app-config';

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
  items: OrderItemRecord[];
  totalAmount: number;
}

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private pool: Pool | null = null;
  private readonly memoryChickenTypes: ChickenTypeRecord[] = [];
  private readonly memoryCustomers: CustomerRecord[] = [];
  private readonly memoryOrders: OrderRecord[] = [];

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const connectionString = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;

    if (url && key) {
      this.client = createClient(url, key, {
        auth: { persistSession: false },
      });
      this.logger.log('Supabase client initialized');
    } else {
      this.logger.warn('Supabase credentials not configured, using in-memory fallback');
    }

    if (connectionString) {
      this.pool = new Pool({ connectionString });
      void this.initializeSchema();
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }

  async createChickenType(entity: ChickenTypeRecord): Promise<ChickenTypeRecord> {
    if (this.client) {
      const { error } = await this.client.from('chicken_types').insert({
        id: entity.id,
        name: entity.name,
        unit_weight_kg: entity.unitWeightKg,
        price_per_kg: entity.pricePerKg,
        average_price: entity.averagePrice,
        is_active: entity.isActive,
        preparation_type: entity.preparationType,
        cooking_price: entity.cookingPrice,
      });

      if (error) {
        this.logger.warn(`Chicken type insert failed: ${error.message}`);
      } else {
        return entity;
      }
    }

    this.memoryChickenTypes.push(entity);
    return entity;
  }

  async findChickenTypeById(id: string): Promise<ChickenTypeRecord | null> {
    if (this.client) {
      const { data, error } = await this.client
        .from('chicken_types')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        this.logger.warn(`Chicken type lookup failed: ${error.message}`);
      } else if (data) {
        return this.mapChickenType(data);
      }
    }

    return this.memoryChickenTypes.find((item) => item.id === id) ?? null;
  }

  async listChickenTypes(): Promise<ChickenTypeRecord[]> {
    if (this.client) {
      const { data, error } = await this.client.from('chicken_types').select('*');
      if (error) {
        this.logger.warn(`Chicken type fetch failed: ${error.message}`);
      } else if (data) {
        return data.map((item: any) => this.mapChickenType(item));
      }
    }

    return this.memoryChickenTypes;
  }

  async createCustomer(entity: CustomerRecord): Promise<CustomerRecord> {
    if (this.client) {
      const { error } = await this.client.from('customers').insert({
        id: entity.id,
        name: entity.name,
        phone: entity.phone,
        address: entity.address,
        delivery_method: entity.deliveryMethod,
      });

      if (error) {
        this.logger.warn(`Customer insert failed: ${error.message}`);
      } else {
        return entity;
      }
    }

    this.memoryCustomers.push(entity);
    return entity;
  }

  async findCustomerById(id: string): Promise<CustomerRecord | null> {
    if (this.client) {
      const { data, error } = await this.client
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        this.logger.warn(`Customer lookup failed: ${error.message}`);
      } else if (data) {
        return this.mapCustomer(data);
      }
    }

    return this.memoryCustomers.find((item) => item.id === id) ?? null;
  }

  async listCustomers(): Promise<CustomerRecord[]> {
    if (this.client) {
      const { data, error } = await this.client.from('customers').select('*');
      if (error) {
        this.logger.warn(`Customer fetch failed: ${error.message}`);
      } else if (data) {
        return data.map((item: any) => this.mapCustomer(item));
      }
    }

    return this.memoryCustomers;
  }

  async createOrder(entity: OrderRecord): Promise<OrderRecord> {
    const order: OrderRecord = {
      ...entity,
      id: entity.id || `order-${Date.now()}`,
    };

    if (this.client) {
      const { error } = await this.client.from('orders').insert({
        id: order.id,
        customer_id: order.customerId,
        delivery_method: order.deliveryMethod,
        delivery_location: order.deliveryLocation,
        payment_status: order.paymentStatus,
        delivery_status: order.deliveryStatus,
        items: order.items,
        total_amount: order.totalAmount,
      });

      if (error) {
        this.logger.warn(`Order insert failed: ${error.message}`);
      } else {
        return order;
      }
    }

    this.memoryOrders.push(order);
    return order;
  }

  async listOrders(): Promise<OrderRecord[]> {
    if (this.client) {
      const { data, error } = await this.client.from('orders').select('*');
      if (error) {
        this.logger.warn(`Order fetch failed: ${error.message}`);
      } else if (data) {
        return data.map((item: any) => this.mapOrder(item));
      }
    }

    return this.memoryOrders;
  }

  private mapChickenType(item: any): ChickenTypeRecord {
    return {
      id: item.id,
      name: item.name,
      unitWeightKg: item.unit_weight_kg,
      pricePerKg: item.price_per_kg,
      averagePrice: item.average_price,
      isActive: item.is_active,
      preparationType: item.preparation_type ?? 'fresh',
      cookingPrice: item.cooking_price ?? getDefaultCookingPrice(),
    };
  }

  private mapCustomer(item: any): CustomerRecord {
    return {
      id: item.id,
      name: item.name,
      phone: item.phone,
      address: item.address,
      deliveryMethod: item.delivery_method,
    };
  }

  private mapOrder(item: any): OrderRecord {
    return {
      id: item.id,
      customerId: item.customer_id,
      deliveryMethod: item.delivery_method,
      deliveryLocation: item.delivery_location,
      paymentStatus: item.payment_status,
      deliveryStatus: item.delivery_status,
      items: item.items,
      totalAmount: item.total_amount,
    };
  }

  private async initializeSchema() {
    if (!this.pool) {
      return;
    }

    const schemaSql = `
      create table if not exists chicken_types (
        id text primary key,
        name text not null,
        unit_weight_kg double precision not null,
        price_per_kg double precision not null,
        average_price double precision not null,
        is_active boolean default true,
        preparation_type text default 'fresh',
        cooking_price double precision default 0
      );

      create table if not exists customers (
        id text primary key,
        name text not null,
        phone text not null,
        address text not null,
        delivery_method text not null
      );

      create table if not exists orders (
        id text primary key,
        customer_id text not null,
        delivery_method text not null,
        delivery_location text not null,
        payment_status text not null,
        delivery_status text not null,
        items jsonb not null,
        total_amount double precision not null
      );
    `;

    try {
      await this.pool.query(schemaSql);
      this.logger.log('Supabase schema initialized');
    } catch (error) {
      this.logger.warn(`Schema initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
