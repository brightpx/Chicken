import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

export interface CreateCustomerDto {
  name: string;
  phone: string;
  address: string;
  deliveryMethod: 'pickup' | 'home';
}

export interface CustomerEntity {
  id: string;
  name: string;
  phone: string;
  address: string;
  deliveryMethod: 'pickup' | 'home';
}

@Injectable()
export class CustomersService {
  private readonly items: CustomerEntity[] = [];

  constructor(private readonly supabaseService?: SupabaseService) {}

  async create(dto: CreateCustomerDto): Promise<CustomerEntity> {
    const entity: CustomerEntity = {
      id: `customer-${Date.now()}`,
      name: dto.name,
      phone: dto.phone,
      address: dto.address,
      deliveryMethod: dto.deliveryMethod,
    };

    this.items.push(entity);

    const client = this.supabaseService?.getClient();
    if (client) {
      await client.from('customers').insert({
        id: entity.id,
        name: entity.name,
        phone: entity.phone,
        address: entity.address,
        delivery_method: entity.deliveryMethod,
      });
    }

    return entity;
  }

  async findAll(): Promise<CustomerEntity[]> {
    const client = this.supabaseService?.getClient();
    if (client) {
      const { data } = await client.from('customers').select('*');
      if (data) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          address: item.address,
          deliveryMethod: item.delivery_method,
        }));
      }
    }

    return this.items;
  }
}
