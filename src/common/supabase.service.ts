import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private pool: Pool | null = null;

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
    } catch (error) {
      this.logger.warn(`Schema initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
