import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

// Enhanced service functions that work with authenticated users
export const authService = {
  // Get current authenticated user ID
  async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  },

  // Get current user profile
  async getCurrentUserProfile() {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's subscription
  async getUserSubscription(userId?: string) {
    const currentUserId = userId || await this.getCurrentUserId();
    if (!currentUserId) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Check if user has access to a feature
  async checkFeatureAccess(featureName: string): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .rpc('check_user_feature', { 
          user_uuid: userId, 
          feature_name: featureName 
        });

      if (error) {
        console.warn('Feature check failed:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.warn('Feature check error:', error);
      return false;
    }
  },

  // Get user's limit for a feature
  async getUserLimit(limitName: string): Promise<string | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .rpc('get_user_limit', { 
          user_uuid: userId, 
          limit_name: limitName 
        });

      if (error) {
        console.warn('Limit check failed:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Limit check error:', error);
      return null;
    }
  },

  // Enhanced customer functions with auth
  async getCustomers() {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createCustomer(customerData: any) {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customerData,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Enhanced sales functions with auth
  async getSales(limit?: number) {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('No authenticated user');

    let query = supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createSale(saleData: any) {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('sales')
      .insert({
        ...saleData,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Enhanced products functions with auth
  async getProducts() {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createProduct(productData: any) {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Enhanced expenses functions with auth
  async getExpenses(limit?: number) {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('No authenticated user');

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createExpense(expenseData: any) {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Collections functions
  async getCollections(userId: string, limit?: number) {
    let query = supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createCollection(userId: string, collectionData: any) {
    const { data, error } = await supabase
      .from('collections')
      .insert({
        ...collectionData,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};