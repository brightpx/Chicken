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
    await this.supabaseService?.createCustomer(entity);

    return entity;
  }

  async findAll(): Promise<CustomerEntity[]> {
    const persisted = await this.supabaseService?.listCustomers();
    if (persisted && persisted.length > 0) {
      return persisted;
    }

    return this.items;
  }
}
