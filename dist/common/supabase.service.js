"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SupabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const pg_1 = require("pg");
const app_config_1 = require("./app-config");
let SupabaseService = SupabaseService_1 = class SupabaseService {
    logger = new common_1.Logger(SupabaseService_1.name);
    client = null;
    pool = null;
    memoryChickenTypes = [];
    memoryCustomers = [];
    memoryOrders = [];
    memoryDefaultCookingPrice = null;
    constructor() {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const connectionString = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
        if (url && key) {
            this.client = (0, supabase_js_1.createClient)(url, key, {
                auth: { persistSession: false },
            });
            this.logger.log('Supabase client initialized');
        }
        else {
            this.logger.warn('Supabase credentials not configured, using in-memory fallback');
        }
        if (connectionString) {
            this.pool = new pg_1.Pool({ connectionString });
            void this.initializeSchema();
        }
    }
    getClient() {
        return this.client;
    }
    async getDefaultCookingPriceSetting() {
        if (this.client) {
            const { data, error } = await this.client.from('app_settings').select('value').eq('key', 'default_cooking_price').maybeSingle();
            if (error) {
                this.logger.warn(`Default cooking price lookup failed: ${error.message}`);
            }
            else if (data) {
                const parsed = Number(data.value);
                return Number.isFinite(parsed) ? parsed : (0, app_config_1.getDefaultCookingPrice)();
            }
        }
        return this.memoryDefaultCookingPrice ?? (0, app_config_1.getDefaultCookingPrice)();
    }
    async setDefaultCookingPriceSetting(value) {
        this.memoryDefaultCookingPrice = value;
        if (this.client) {
            const { error } = await this.client
                .from('app_settings')
                .upsert({ key: 'default_cooking_price', value: String(value) });
            if (error) {
                this.logger.warn(`Default cooking price update failed: ${error.message}`);
            }
        }
        return value;
    }
    async createChickenType(entity) {
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
            }
            else {
                return entity;
            }
        }
        this.memoryChickenTypes.push(entity);
        return entity;
    }
    async findChickenTypeById(id) {
        if (this.client) {
            const { data, error } = await this.client
                .from('chicken_types')
                .select('*')
                .eq('id', id)
                .maybeSingle();
            if (error) {
                this.logger.warn(`Chicken type lookup failed: ${error.message}`);
            }
            else if (data) {
                return this.mapChickenType(data);
            }
        }
        return this.memoryChickenTypes.find((item) => item.id === id) ?? null;
    }
    async listChickenTypes() {
        if (this.client) {
            const { data, error } = await this.client.from('chicken_types').select('*');
            if (error) {
                this.logger.warn(`Chicken type fetch failed: ${error.message}`);
            }
            else if (data) {
                return data.map((item) => this.mapChickenType(item));
            }
        }
        return this.memoryChickenTypes;
    }
    async updateChickenType(id, dto) {
        const existing = this.memoryChickenTypes.find((item) => item.id === id);
        if (existing) {
            const updated = { ...existing, ...dto };
            this.memoryChickenTypes.splice(this.memoryChickenTypes.indexOf(existing), 1, updated);
            return updated;
        }
        if (this.client) {
            const updatePayload = {};
            if (dto.name !== undefined)
                updatePayload.name = dto.name;
            if (dto.unitWeightKg !== undefined)
                updatePayload.unit_weight_kg = dto.unitWeightKg;
            if (dto.pricePerKg !== undefined)
                updatePayload.price_per_kg = dto.pricePerKg;
            if (dto.averagePrice !== undefined)
                updatePayload.average_price = dto.averagePrice;
            if (dto.isActive !== undefined)
                updatePayload.is_active = dto.isActive;
            if (dto.preparationType !== undefined)
                updatePayload.preparation_type = dto.preparationType;
            if (dto.cookingPrice !== undefined)
                updatePayload.cooking_price = dto.cookingPrice;
            const { data, error } = await this.client.from('chicken_types').update(updatePayload).eq('id', id).select('*').maybeSingle();
            if (error) {
                this.logger.warn(`Chicken type update failed: ${error.message}`);
                return null;
            }
            return data ? this.mapChickenType(data) : null;
        }
        return null;
    }
    async createCustomer(entity) {
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
            }
            else {
                return entity;
            }
        }
        this.memoryCustomers.push(entity);
        return entity;
    }
    async findCustomerById(id) {
        if (this.client) {
            const { data, error } = await this.client
                .from('customers')
                .select('*')
                .eq('id', id)
                .maybeSingle();
            if (error) {
                this.logger.warn(`Customer lookup failed: ${error.message}`);
            }
            else if (data) {
                return this.mapCustomer(data);
            }
        }
        return this.memoryCustomers.find((item) => item.id === id) ?? null;
    }
    async listCustomers() {
        if (this.client) {
            const { data, error } = await this.client.from('customers').select('*');
            if (error) {
                this.logger.warn(`Customer fetch failed: ${error.message}`);
            }
            else if (data) {
                return data.map((item) => this.mapCustomer(item));
            }
        }
        return this.memoryCustomers;
    }
    async createOrder(entity) {
        const order = {
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
            }
            else {
                return order;
            }
        }
        this.memoryOrders.push(order);
        return order;
    }
    async findOrderById(id) {
        if (this.client) {
            const { data, error } = await this.client.from('orders').select('*').eq('id', id).maybeSingle();
            if (error) {
                this.logger.warn(`Order lookup failed: ${error.message}`);
            }
            else if (data) {
                return this.mapOrder(data);
            }
        }
        return this.memoryOrders.find((item) => item.id === id) ?? null;
    }
    async listOrders() {
        if (this.client) {
            const { data, error } = await this.client.from('orders').select('*');
            if (error) {
                this.logger.warn(`Order fetch failed: ${error.message}`);
            }
            else if (data) {
                return data.map((item) => this.mapOrder(item));
            }
        }
        return this.memoryOrders;
    }
    async updateOrder(id, dto) {
        const existing = this.memoryOrders.find((item) => item.id === id);
        if (existing) {
            const updated = { ...existing, ...dto };
            this.memoryOrders.splice(this.memoryOrders.indexOf(existing), 1, updated);
            return updated;
        }
        if (this.client) {
            const updatePayload = {};
            if (dto.paymentStatus !== undefined)
                updatePayload.payment_status = dto.paymentStatus;
            if (dto.deliveryStatus !== undefined)
                updatePayload.delivery_status = dto.deliveryStatus;
            if (dto.deliveryMethod !== undefined)
                updatePayload.delivery_method = dto.deliveryMethod;
            if (dto.deliveryLocation !== undefined)
                updatePayload.delivery_location = dto.deliveryLocation;
            if (dto.items !== undefined)
                updatePayload.items = dto.items;
            if (dto.totalAmount !== undefined)
                updatePayload.total_amount = dto.totalAmount;
            const { data, error } = await this.client.from('orders').update(updatePayload).eq('id', id).select('*').maybeSingle();
            if (error) {
                this.logger.warn(`Order update failed: ${error.message}`);
                return null;
            }
            return data ? this.mapOrder(data) : null;
        }
        return null;
    }
    async deleteOrder(id) {
        const existingIndex = this.memoryOrders.findIndex((item) => item.id === id);
        if (existingIndex !== -1) {
            this.memoryOrders.splice(existingIndex, 1);
            return true;
        }
        if (this.client) {
            const { error } = await this.client.from('orders').delete().eq('id', id);
            if (error) {
                this.logger.warn(`Order delete failed: ${error.message}`);
                return false;
            }
            return true;
        }
        return false;
    }
    mapChickenType(item) {
        return {
            id: item.id,
            name: item.name,
            unitWeightKg: item.unit_weight_kg,
            pricePerKg: item.price_per_kg,
            averagePrice: item.average_price,
            isActive: item.is_active,
            preparationType: item.preparation_type ?? 'fresh',
            cookingPrice: item.cooking_price ?? (0, app_config_1.getDefaultCookingPrice)(),
        };
    }
    mapCustomer(item) {
        return {
            id: item.id,
            name: item.name,
            phone: item.phone,
            address: item.address,
            deliveryMethod: item.delivery_method,
        };
    }
    mapOrder(item) {
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
    async initializeSchema() {
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

      do $$
      begin
        if not exists (
          select 1
          from information_schema.columns
          where table_name = 'chicken_types' and column_name = 'preparation_type'
        ) then
          alter table chicken_types add column preparation_type text default 'fresh';
        end if;

        if not exists (
          select 1
          from information_schema.columns
          where table_name = 'chicken_types' and column_name = 'cooking_price'
        ) then
          alter table chicken_types add column cooking_price double precision default 0;
        end if;
      end
      $$;

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

      create table if not exists app_settings (
        key text primary key,
        value text not null
      );
    `;
        try {
            await this.pool.query(schemaSql);
            this.logger.log('Supabase schema initialized');
        }
        catch (error) {
            this.logger.warn(`Schema initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = SupabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map