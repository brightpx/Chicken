import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private readonly logger;
    private client;
    private pool;
    constructor();
    getClient(): SupabaseClient | null;
    private initializeSchema;
}
