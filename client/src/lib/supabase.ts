import { createClient } from '@supabase/supabase-js';
// Type definitions for Supabase data models
interface User {
  id: string;
  username: string;
  business_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  created_at: string;
}

interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone_number?: string;
  address?: string;
  total_credit: number;
  created_at: string;
}

interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string;
  unit: string;
  buying_price: number;
  selling_price: number;
  current_stock: number;
  min_stock_level: number;
  created_at: string;
}

interface Sale {
  id: string;
  user_id: string;
  customer_id?: string;
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_method: string;
  items: any[];
  sale_date: string;
  created_at: string;
}

interface Expense {
  id: string;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

interface Collection {
  id: string;
  user_id: string;
  customer_id?: string;
  sale_id?: string;
  amount: number;
  collection_date: string;
  created_at: string;
}

// NEW INTERFACES FOR ADVANCED FEATURES

interface LoyaltyPoints {
  id: string;
  user_id: string;
  customer_id: string;
  total_points: number;
  available_points: number;
  redeemed_points: number;
  current_tier: string;
  lifetime_spending: number;
  created_at: string;
  updated_at: string;
}

interface PointTransaction {
  id: string;
  user_id: string;
  customer_id: string;
  sale_id?: string;
  points: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment';
  reason: string;
  description?: string;
  created_at: string;
}

interface Reward {
  id: string;
  user_id: string;
  name: string;
  name_local: string;
  description?: string;
  points_cost: number;
  reward_type: 'discount' | 'product' | 'cashback' | 'special_offer';
  reward_value: number;
  is_active: boolean;
  eligible_tiers: string[];
  expiry_days: number;
  created_at: string;
  updated_at: string;
}

interface RewardRedemption {
  id: string;
  user_id: string;
  customer_id: string;
  reward_id: string;
  points_used: number;
  coupon_code?: string;
  is_used: boolean;
  used_at?: string;
  expires_at?: string;
  created_at: string;
}

interface Supplier {
  id: string;
  user_id: string;
  name: string;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  payment_terms?: string;
  credit_limit: number;
  current_balance: number;
  performance_rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PurchaseOrder {
  id: string;
  user_id: string;
  supplier_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  total_amount: number;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity: number;
  created_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  customer_id?: string;
  notification_type: 'sms' | 'whatsapp' | 'system' | 'email';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  scheduled_for?: string;
  sent_at?: string;
  delivery_status?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

interface UserPreference {
  id: string;
  user_id: string;
  preference_key: string;
  preference_value: any;
  created_at: string;
  updated_at: string;
}

interface BusinessInsight {
  id: string;
  user_id: string;
  insight_type: string;
  insight_data: any;
  calculated_at: string;
  expires_at?: string;
}

interface ApiIntegration {
  id: string;
  user_id: string;
  integration_type: 'whatsapp' | 'sms' | 'email' | 'payment' | 'accounting';
  provider_name: string;
  api_key_encrypted?: string;
  configuration: any;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentMethod {
  id: string;
  user_id: string;
  method_name: string;
  method_type: 'cash' | 'mobile_banking' | 'bank_transfer' | 'card' | 'credit' | 'qr_code';
  provider?: string;
  account_number?: string;
  qr_code_data?: string;
  is_active: boolean;
  is_default: boolean;
  configuration: any;
  created_at: string;
}

interface CustomerCommunication {
  id: string;
  user_id: string;
  customer_id: string;
  communication_type: 'whatsapp' | 'sms' | 'call' | 'email' | 'in_person';
  subject?: string;
  message: string;
  direction: 'inbound' | 'outbound';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata: any;
  created_at: string;
}

// Insert types (for creating new records)
type InsertUser = Omit<User, 'id' | 'created_at'>;
type InsertCustomer = Omit<Customer, 'id' | 'user_id' | 'created_at'>;
type InsertProduct = Omit<Product, 'id' | 'user_id' | 'created_at'>;
type InsertSale = Omit<Sale, 'id' | 'user_id' | 'created_at'>;
type InsertExpense = Omit<Expense, 'id' | 'user_id' | 'created_at'>;
type InsertCollection = Omit<Collection, 'id' | 'user_id' | 'created_at'>;

// New insert types for advanced features
type InsertLoyaltyPoints = Omit<LoyaltyPoints, 'id' | 'created_at' | 'updated_at'>;
type InsertPointTransaction = Omit<PointTransaction, 'id' | 'created_at'>;
type InsertReward = Omit<Reward, 'id' | 'created_at' | 'updated_at'>;
type InsertRewardRedemption = Omit<RewardRedemption, 'id' | 'created_at'>;
type InsertSupplier = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
type InsertPurchaseOrder = Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>;
type InsertPurchaseOrderItem = Omit<PurchaseOrderItem, 'id' | 'created_at'>;
type InsertNotification = Omit<Notification, 'id' | 'created_at'>;
type InsertUserPreference = Omit<UserPreference, 'id' | 'created_at' | 'updated_at'>;
type InsertBusinessInsight = Omit<BusinessInsight, 'id' | 'calculated_at'>;
type InsertApiIntegration = Omit<ApiIntegration, 'id' | 'created_at' | 'updated_at'>;
type InsertPaymentMethod = Omit<PaymentMethod, 'id' | 'created_at'>;
type InsertCustomerCommunication = Omit<CustomerCommunication, 'id' | 'created_at'>;

// Supabase configuration - FORCE hardcoded values for reliability
const SUPABASE_URL = 'https://lkhqdqlryjzalsemofdt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraHFkcWxyeWp6YWxzZW1vZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjgzOTcsImV4cCI6MjA3MDQwNDM5N30.uyaSNaaUf_hEx6RSqND6a9Unb_IvHKmV6tOLsGFcITc';

console.log('🔥 SUPABASE SERVICE: Initialized with hardcoded credentials:', {
  url: SUPABASE_URL,
  keyPrefix: SUPABASE_ANON_KEY.substring(0, 20) + '...',
  timestamp: new Date().toISOString()
});

// Create Supabase client with explicit options
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Enable session persistence for auth
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Test connection immediately
console.log('🔥 SUPABASE CLIENT: Created, testing connection...');
(async () => {
  try {
    const { count, error } = await supabase.from('customers').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ SUPABASE CONNECTION FAILED:', error);
    } else {
      console.log('✅ SUPABASE CONNECTION SUCCESS: Total customers =', count);
    }
  } catch (err) {
    console.error('❌ SUPABASE CONNECTION ERROR:', err);
  }
})();

// Current user ID - now dynamically fetched from auth
export const getCurrentUserId = () => {
  return supabase.auth.getUser().then(({ data: { user } }) => user?.id || null);
};

// Legacy constant for backward compatibility (will be removed)
export const CURRENT_USER_ID = '11111111-1111-1111-1111-111111111111';

// Database service functions - NO OFFLINE FALLBACKS, ONLY REAL DATA
export const supabaseService = {
  // Users
  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Customers - REAL SUPABASE DATA WITH SMART CACHING
  async getCustomers(userId: string): Promise<Customer[]> {
    console.log('🔥 FETCHING CUSTOMERS for user:', userId);
    
    // Try cache first
    const { cacheManager, createCacheKey } = await import('./cache-manager');
    const cacheKey = createCacheKey('customers', userId);
    const cached = cacheManager.get<Customer[]>(cacheKey);
    
    if (cached) {
      console.log('📦 CACHE: Using cached customers data');
      return cached;
    }
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching customers:', error);
      throw error; // NEVER fall back to offline data
    }
    
    // Cache the results for 3 minutes
    cacheManager.set(cacheKey, data || [], 3 * 60 * 1000);
    
    console.log('✅ Customers fetched from Supabase:', data?.length || 0, data);
    return data || [];
  },

  async createCustomer(userId: string, customer: InsertCustomer): Promise<Customer> {
    console.log('🔥 Creating customer:', customer);
    
    const dbCustomer = {
      name: customer.name,
      phone_number: customer.phone_number || null,
      address: customer.address || null,
      user_id: userId,
      total_credit: customer.total_credit || '0.00'
    };
    
    const { data, error } = await supabase
      .from('customers')
      .insert(dbCustomer)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating customer:', error);
      throw error;
    }
    
    console.log('✅ Customer created:', data);
    return data;
  },

  async getCustomer(userId: string, customerId: string): Promise<Customer | null> {
    console.log('🔥 FETCHING CUSTOMER:', customerId, 'for user:', userId);
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // Handle "no rows" error gracefully
      if (error.code === 'PGRST116') {
        console.log('❌ Customer not found:', customerId);
        return null;
      }
      console.error('❌ Error fetching customer:', error);
      throw error;
    }
    
    console.log('✅ Customer fetched:', data);
    return data;
  },

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error deleting customer:', error);
      throw error;
    }
  },

  // Products - ONLY REAL SUPABASE DATA
  async getProducts(userId: string): Promise<Product[]> {
    console.log('🔥 FETCHING PRODUCTS for user:', userId);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      throw error; // NEVER fall back to offline data
    }
    
    console.log('✅ Products fetched from Supabase:', data?.length || 0, data);
    return data || [];
  },

  async createProduct(userId: string, product: InsertProduct): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getLowStockProducts(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .filter('current_stock', 'lte', 'min_stock_level')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Sales - ONLY REAL SUPABASE DATA
  async getSales(userId: string, limit?: number): Promise<Sale[]> {
    console.log('🔥 FETCHING SALES for user:', userId, 'limit:', limit);

    let query = supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching sales:', error);
      throw error; // NEVER fall back to offline data
    }
    
    console.log('✅ Sales fetched from Supabase:', data?.length || 0, data);
    return data || [];
  },

  async getTodaySales(userId: string): Promise<Sale[]> {
    const { getBangladeshDateRange } = await import('./bengali-utils');
    const { start: todayStart, end: todayEnd } = getBangladeshDateRange();
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching today sales:', error);
      throw error;
    }
    
    return data || [];
  },

  async createSale(userId: string, sale: InsertSale): Promise<Sale> {
    const { data, error } = await supabase
      .from('sales')
      .insert({ ...sale, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Expenses - ONLY REAL SUPABASE DATA
  async getExpenses(userId: string, limit?: number): Promise<Expense[]> {
    console.log('🔥 FETCHING EXPENSES for user:', userId, 'limit:', limit);

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching expenses:', error);
      throw error; // NEVER fall back to offline data
    }
    
    console.log('✅ Expenses fetched from Supabase:', data?.length || 0, data);
    return data || [];
  },

  async createExpense(userId: string, expense: InsertExpense): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Collections - ONLY REAL SUPABASE DATA
  async getCollections(userId: string, limit?: number): Promise<Collection[]> {
    let query = supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async createCollection(userId: string, collection: InsertCollection): Promise<Collection> {
    console.log('🔄 CREATING COLLECTION:', collection);
    
    // Start a transaction to update both collections and reduce due amounts
    try {
      // First, create the collection record
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .insert({ ...collection, user_id: userId })
        .select()
        .single();
      
      if (collectionError) throw collectionError;
      
      const collectionAmount = parseFloat(collection.amount.toString());
      let remainingAmount = collectionAmount;
      
      // Get customer's outstanding sales (oldest first)
      const { data: salesWithDue, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userId)
        .eq('customer_id', collection.customer_id)
        .gt('due_amount', 0)
        .order('created_at', { ascending: true });
      
      if (salesError) throw salesError;
      
      console.log('📋 SALES WITH DUE for customer:', salesWithDue);
      
      // Update sales due amounts (FIFO - oldest first)
      for (const sale of salesWithDue || []) {
        if (remainingAmount <= 0) break;
        
        const currentDue = parseFloat(sale.due_amount.toString());
        const paymentForThisSale = Math.min(remainingAmount, currentDue);
        const newDueAmount = currentDue - paymentForThisSale;
        
        // Update the sale's due amount
        const { error: updateError } = await supabase
          .from('sales')
          .update({ due_amount: newDueAmount })
          .eq('id', sale.id);
        
        if (updateError) throw updateError;
        
        remainingAmount -= paymentForThisSale;
        console.log(`💰 Updated sale ${sale.id}: due reduced by ${paymentForThisSale}, new due: ${newDueAmount}`);
      }
      
      // If there's still remaining amount, reduce customer's total_credit
      if (remainingAmount > 0) {
        const { data: customer, error: customerFetchError } = await supabase
          .from('customers')
          .select('total_credit')
          .eq('id', collection.customer_id)
          .single();
        
        if (customerFetchError) throw customerFetchError;
        
        const currentCredit = parseFloat(customer.total_credit.toString());
        const newCredit = Math.max(0, currentCredit - remainingAmount);
        
        const { error: customerUpdateError } = await supabase
          .from('customers')
          .update({ total_credit: newCredit })
          .eq('id', collection.customer_id);
        
        if (customerUpdateError) throw customerUpdateError;
        
        console.log(`👤 Updated customer credit: reduced by ${remainingAmount}, new credit: ${newCredit}`);
      }
      
      console.log('✅ COLLECTION CREATED with due amount updates');
      return collectionData;
      
    } catch (error) {
      console.error('❌ Collection creation failed:', error);
      throw error;
    }
  },

  // Stats - ONLY REAL SUPABASE DATA
  async getStats(userId: string) {
    console.log('🔥 FETCHING STATS for user:', userId);
    
    try {
      // Get today's date range in Bangladesh timezone
      const { getBangladeshDateRange } = await import('./bengali-utils');
      const { start: todayStart, end: todayEnd } = getBangladeshDateRange();
      
      console.log('🔥 BANGLADESH DATE RANGE:', { todayStart, todayEnd });
      
      // Get today's sales
      const { data: todaySales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('user_id', userId)
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd);
      
      if (salesError) throw salesError;
      
      // Get today's expenses
      const { data: todayExpenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd);
      
      if (expensesError) throw expensesError;
      
      // Get total customers count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get total due amount from sales (collections needed)
      const { data: salesWithDue, error: dueError } = await supabase
        .from('sales')
        .select('due_amount, customer_name, total_amount')
        .eq('user_id', userId)
        .gt('due_amount', 0);

      if (dueError) throw dueError;
      
      console.log('🔥 SALES WITH DUE AMOUNT:', salesWithDue);
      
      // Also check customer total_credit as alternative source for pending amounts
      const { data: customersWithCredit, error: creditError } = await supabase
        .from('customers')
        .select('name, total_credit')
        .eq('user_id', userId)
        .gt('total_credit', 0);
        
      if (creditError) throw creditError;
      
      console.log('🔥 CUSTOMERS WITH CREDIT:', customersWithCredit);
      
      // Get total collections made to verify our calculation
      const { data: allCollections, error: collectionsError } = await supabase
        .from('collections')
        .select('amount')
        .eq('user_id', userId);
        
      if (collectionsError) throw collectionsError;
      
      const totalCollected = allCollections?.reduce((sum, col) => sum + parseFloat(col.amount || '0'), 0) || 0;
      console.log('💰 TOTAL COLLECTIONS MADE:', totalCollected);

      // Calculate totals
      const totalSales = todaySales?.reduce((sum, sale) => sum + parseFloat(sale.total_amount || '0'), 0) || 0;
      const totalExpenses = todayExpenses?.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0) || 0;
      const profit = totalSales - totalExpenses;
      const pendingFromSales = salesWithDue?.reduce((sum, sale) => sum + parseFloat(sale.due_amount || '0'), 0) || 0;
      const pendingFromCustomers = customersWithCredit?.reduce((sum, customer) => sum + parseFloat(customer.total_credit || '0'), 0) || 0;
      const pendingCollection = pendingFromSales + pendingFromCustomers; // Add both sources together
      
      const stats = {
        todaySales: totalSales,
        todayProfit: profit,
        pendingCollection: pendingCollection,
        totalCustomers: customerCount || 0,
        totalSales: totalSales,
        totalExpenses: totalExpenses,
        profit: profit,
        salesCount: todaySales?.length || 0
      };
      
      console.log('✅ Stats calculated from Supabase:', stats);
      console.log('📊 PENDING COLLECTION DETAILS:', {
        salesWithDue: salesWithDue?.length || 0,
        customersWithCredit: customersWithCredit?.length || 0,
        pendingFromSales: pendingFromSales,
        pendingFromCustomers: pendingFromCustomers,
        finalPendingCollection: pendingCollection,
        dueAmounts: salesWithDue?.map(s => ({ customer: s.customer_name, due: s.due_amount })),
        customerCredits: customersWithCredit?.map(c => ({ customer: c.name, credit: c.total_credit }))
      });
      return stats;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error; // NEVER fall back to offline data
    }
  },

  // LOYALTY PROGRAM METHODS
  async getLoyaltyPoints(userId: string, customerId: string): Promise<LoyaltyPoints | null> {
    const { data, error } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', userId)
      .eq('customer_id', customerId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createOrUpdateLoyaltyPoints(userId: string, loyaltyData: InsertLoyaltyPoints): Promise<LoyaltyPoints> {
    const { data, error } = await supabase
      .from('loyalty_points')
      .upsert({ ...loyaltyData, user_id: userId, updated_at: new Date().toISOString() })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createPointTransaction(userId: string, transaction: InsertPointTransaction): Promise<PointTransaction> {
    const { data, error } = await supabase
      .from('point_transactions')
      .insert({ ...transaction, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPointTransactions(userId: string, customerId?: string): Promise<PointTransaction[]> {
    let query = supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // REWARDS METHODS
  async getRewards(userId: string): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('points_cost', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createReward(userId: string, reward: InsertReward): Promise<Reward> {
    const { data, error } = await supabase
      .from('rewards')
      .insert({ ...reward, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async redeemReward(userId: string, redemption: InsertRewardRedemption): Promise<RewardRedemption> {
    const { data, error } = await supabase
      .from('reward_redemptions')
      .insert({ ...redemption, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // SUPPLIER METHODS
  async getSuppliers(userId: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createSupplier(userId: string, supplier: InsertSupplier): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({ ...supplier, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // NOTIFICATION METHODS
  async getNotifications(userId: string, limit?: number): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createNotification(userId: string, notification: InsertNotification): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ ...notification, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateNotificationStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  },

  // USER PREFERENCES
  async getUserPreference(userId: string, key: string): Promise<UserPreference | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('preference_key', key)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async setUserPreference(userId: string, key: string, value: any): Promise<UserPreference> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ 
        user_id: userId, 
        preference_key: key, 
        preference_value: value,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // API INTEGRATIONS
  async getApiIntegrations(userId: string): Promise<ApiIntegration[]> {
    const { data, error } = await supabase
      .from('api_integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createApiIntegration(userId: string, integration: InsertApiIntegration): Promise<ApiIntegration> {
    const { data, error } = await supabase
      .from('api_integrations')
      .insert({ ...integration, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // PAYMENT METHODS
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createPaymentMethod(userId: string, method: InsertPaymentMethod): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({ ...method, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};