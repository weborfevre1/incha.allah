import { createClient } from "@supabase/supabase-js";

export type SupabaseConfig = {
  anonKey: string;
  url: string;
};

export type SupabaseAdminConfig = {
  serviceRoleKey: string;
  url: string;
};

export const createSupabaseClient = (
  config: SupabaseConfig,
  accessToken?: string,
) =>
  createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            apikey: config.anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });

export const createSupabaseAdminClient = (config: SupabaseAdminConfig) =>
  createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });