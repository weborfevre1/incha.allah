// Supabase Service Layer for authentication, profiles, orders, and cart
import { supabase } from '../lib/supabase';
import type { SupabaseUser, SupabaseProfile, SupabaseOrder, ApiResponse } from '../types';

export const supabaseAuthService = {
  // Authentication
  async signUp(email: string, password: string): Promise<ApiResponse<SupabaseUser>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data.user as SupabaseUser };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async signIn(email: string, password: string): Promise<ApiResponse<SupabaseUser>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data.user as SupabaseUser };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return (data.user as SupabaseUser) || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async updatePassword(newPassword: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  onAuthStateChange(callback: (user: SupabaseUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      callback((session?.user as SupabaseUser) || null);
    });
  },
};

export const supabaseProfileService = {
  // Profile management
  async getProfile(userId: string): Promise<ApiResponse<SupabaseProfile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async updateProfile(
    userId: string,
    profile: Partial<SupabaseProfile>
  ): Promise<ApiResponse<SupabaseProfile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

export const supabaseOrderService = {
  // Order management
  async getOrders(userId: string): Promise<ApiResponse<SupabaseOrder[]>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: (data || []) as SupabaseOrder[] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async getOrder(orderId: string): Promise<ApiResponse<SupabaseOrder>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select()
        .eq('id', orderId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async createOrder(order: Omit<SupabaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<
    ApiResponse<SupabaseOrder>
  > {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async updateOrder(
    orderId: string,
    updates: Partial<SupabaseOrder>
  ): Promise<ApiResponse<SupabaseOrder>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

export const supabaseCartService = {
  // Cart management (localStorage fallback with Supabase sync)
  async saveCart(userId: string, items: any[]): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('carts')
        .upsert({
          user_id: userId,
          items,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async getCart(userId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('carts')
        .select()
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means not found, which is acceptable
        return { success: false, error: error.message };
      }

      return { success: true, data: data || { items: [] } };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async clearCart(userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

export default {
  auth: supabaseAuthService,
  profile: supabaseProfileService,
  order: supabaseOrderService,
  cart: supabaseCartService,
};
