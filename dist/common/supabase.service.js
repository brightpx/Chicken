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
let SupabaseService = SupabaseService_1 = class SupabaseService {
    logger = new common_1.Logger(SupabaseService_1.name);
    client = null;
    pool = null;
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
        is_active boolean default true
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