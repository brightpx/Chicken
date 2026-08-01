import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && key) {
      this.client = createClient(url, key, {
        auth: { persistSession: false },
      });
      this.logger.log('Supabase client initialized');
    } else {
      this.logger.warn('Supabase credentials not configured, using in-memory fallback');
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }
}
