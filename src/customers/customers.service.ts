import { Injectable } from '@nestjs/common';
import { CustomerRecord, SupabaseService } from '../common/supabase.service';

export interface CreateCustomerDto {
  name: string;
  phone: string;
  address: string;
  deliveryMethod: 'pickup' | 'home';
}

export type CustomerEntity = CustomerRecord;

@Injectable()
export class CustomersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(dto: CreateCustomerDto): Promise<CustomerEntity> {
    const entity: CustomerEntity = {
      id: `customer-${Date.now()}`,
      name: dto.name,
      phone: dto.phone,
      address: dto.address,
      deliveryMethod: dto.deliveryMethod,
    };

    return this.supabaseService.createCustomer(entity);
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    return this.supabaseService.findCustomerById(id);
  }

  async findAll(): Promise<CustomerEntity[]> {
    return this.supabaseService.listCustomers();
  }
}
