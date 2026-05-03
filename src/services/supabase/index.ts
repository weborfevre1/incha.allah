import type { SupabaseConfig, SupabaseAdminConfig } from './client';
import type { Logger } from '../types';
import { createSupabaseAuthService, type AuthService } from './auth/provider';
import { createSupabaseUserService, type UserService } from './user/provider';

export type SupabaseServiceRegistry = {
  auth: AuthService;
  user: UserService;
};

type SupabaseServiceConfig = {
  currency?: string;
  logger: Logger;
  sanity?: any;
  supabase: SupabaseConfig;
  supabaseAdmin?: SupabaseAdminConfig;
};

export const createSupabaseServiceRegistry = (
  config: SupabaseServiceConfig,
): SupabaseServiceRegistry => {
  const currency = config.currency || 'USD';

  return {
    auth: createSupabaseAuthService({
      logger: config.logger,
      supabase: config.supabase,
    }),
    user: createSupabaseUserService({
      currency,
      logger: config.logger,
      sanity: config.sanity,
      supabase: config.supabase,
      supabaseAdmin: config.supabaseAdmin,
    }),
  };
};