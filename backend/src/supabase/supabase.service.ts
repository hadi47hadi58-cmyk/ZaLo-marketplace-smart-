import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;

  // Supabase Credentials (loaded from environment or using the provided credentials as fallback)
  private readonly supabaseUrl = process.env.SUPABASE_URL || 'https://xwwzadxsqmmxerbolovz.supabase.co';
  private readonly supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_qJ68bIG-VZXemJ5LOGhY3w_1I7718w1';

  onModuleInit() {
    this.logger.log('Initializing Supabase client...');
    if (!this.supabaseUrl || !this.supabaseKey) {
      this.logger.error('Supabase URL or KEY is missing!');
      throw new Error('Supabase configuration credentials are required.');
    }

    try {
      this.supabaseClient = createClient(this.supabaseUrl, this.supabaseKey, {
        auth: {
          persistSession: false, // Recommended for backend services
          autoRefreshToken: false,
        }
      });
      this.logger.log('Supabase client successfully initialized!');
    } catch (error) {
      this.logger.error('Failed to initialize Supabase client:', error);
      throw error;
    }
  }

  /**
   * Returns the initialized Supabase client instance to perform database operations,
   * authentication, storage actions, or function calls.
   */
  getClient(): SupabaseClient {
    if (!this.supabaseClient) {
      this.onModuleInit();
    }
    return this.supabaseClient;
  }
}
