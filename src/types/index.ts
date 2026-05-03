// Type definitions for Sanity CMS
export interface SanityProduct {
  _id: string;
  _type: 'product';
  title: string;
  slug: { current: string };
  description?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  image?: {
    _type: 'image';
    asset: {
      _id: string;
      url: string;
    };
  };
  images?: Array<{
    _type: 'image';
    asset: {
      _id: string;
      url: string;
    };
  }>;
  category?: { _ref: string; _type: 'reference' };
  sku?: string;
  stock?: number;
  _createdAt: string;
  _updatedAt: string;
}

export interface SanityCategory {
  _id: string;
  _type: 'category';
  title: string;
  slug: { current: string };
  description?: string;
  image?: {
    _type: 'image';
    asset: {
      _id: string;
      url: string;
    };
  };
}

export interface SanityPage {
  _id: string;
  _type: 'page';
  title: string;
  slug: { current: string };
  content?: string;
  blocks?: any[];
}

// Type definitions for Supabase
export interface SupabaseUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SupabaseProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseOrder {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  currency: string;
  items: OrderItem[];
  shipping_address?: Address;
  billing_address?: Address;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  title: string;
  image?: string;
}

export interface Address {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Search and Filter types
export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'category' | 'page';
  description?: string;
  image?: string;
  url?: string;
}
