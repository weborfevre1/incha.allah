import { createSupabaseServiceRegistry } from './supabase';
import { createServiceRegistry as createSanityServiceRegistry } from './registry';
import { logger } from '../lib/logger';

// Initialize Sanity services
export const sanityServices = createSanityServiceRegistry();

// Initialize Supabase services
export const supabaseServices = createSupabaseServiceRegistry({
  currency: 'XOF', // From environment
  logger,
  sanity: {
    projectId: import.meta.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
    dataset: import.meta.env.NEXT_PUBLIC_SANITY_DATASET ?? '',
    apiVersion: import.meta.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-01-01',
  },
  supabase: {
    url: import.meta.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
  supabaseAdmin: import.meta.env.SUPABASE_SERVICE_ROLE_KEY ? {
    url: import.meta.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    serviceRoleKey: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  } : undefined,
});

// Combined service registry
export const services = {
  sanity: sanityServices,
  supabase: supabaseServices,
};

// Export individual services for convenience
export const {
  cmsPage: sanityCMSPage,
  search: sanitySearch,
  collection: sanityCollection,
  store: sanityStore,
  cmsMenu: sanityMenu,
} = sanityServices;

export const {
  auth: supabaseAuth,
  user: supabaseUser,
} = supabaseServices;