// Main export file for all services, hooks, and utilities
// This provides a clean API for consumers of the integration

// Services
export { default as sanityService } from './services/sanity-service';
export { default as supabaseService } from './services/supabase-service';
export {
  supabaseAuthService,
  supabaseProfileService,
  supabaseOrderService,
  supabaseCartService,
} from './services/supabase-service';

// Hooks
export * from './hooks';
export {
  useSupabaseAuth,
  useSupabaseProfile,
  useSupabaseOrders,
  useSupabaseCart,
} from './hooks/useSupabase';
export {
  useSanityProducts,
  useSanityProductBySlug,
  useSanityCategories,
  useSanitySearch,
  useSanityProductsByCategory,
} from './hooks/useSanity';

// Utilities
export {
  formatCurrency,
  getSanityImageUrl,
  debounce,
  throttle,
  localStorage2,
  parseQueryString,
  buildQueryString,
  validateEmail,
  generateSlug,
  truncateText,
  apiClient,
  createApiClient,
} from './lib/utils';

// Configuration
export { config, sanityProjectId, sanityDataset, supabaseUrl, defaultCurrency } from './lib/config';

// Clients
export { supabase } from './lib/supabase';
export { sanityClient, sanityTokenizedClient } from './lib/sanity';

// Types
export type {
  SanityProduct,
  SanityCategory,
  SanityPage,
  SupabaseUser,
  SupabaseProfile,
  SupabaseOrder,
  OrderItem,
  Address,
  ApiResponse,
  PaginatedResponse,
  ProductFilter,
  SearchResult,
} from './types';
