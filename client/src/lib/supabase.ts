import { createClient } from '@supabase/supabase-js';
import type { 
  User, 
  Customer, 
  Product, 
  Sale, 
  Expense, 
  Collection,
  InsertUser,
  InsertCustomer,
  InsertProduct,
  InsertSale,
  InsertExpense,
  InsertCollection
} from './types';

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
    persistSession: false // Disable session persistence for simplicity
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

// Current user ID (in a real app, this would come from authentication)
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

  // Customers - ONLY REAL SUPABASE DATA
  async getCustomers(userId: string): Promise<Customer[]> {
    console.log('🔥 FETCHING CUSTOMERS for user:', userId);
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching customers:', error);
      throw error; // NEVER fall back to offline data
    }
    
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
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
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
    const { data, error } = await supabase
      .from('collections')
      .insert({ ...collection, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Stats - ONLY REAL SUPABASE DATA
  async getStats(userId: string) {
    console.log('🔥 FETCHING STATS for user:', userId);
    
    try {
      // Get today's date range
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's sales
      const { data: todaySales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);
      
      if (salesError) throw salesError;
      
      // Get today's expenses
      const { data: todayExpenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);
      
      if (expensesError) throw expensesError;
      
      // Get total customers count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get total due amount from sales (collections needed)
      const { data: salesWithDue, error: dueError } = await supabase
        .from('sales')
        .select('due_amount')
        .eq('user_id', userId)
        .gt('due_amount', 0);

      if (dueError) throw dueError;

      // Calculate totals
      const totalSales = todaySales?.reduce((sum, sale) => sum + parseFloat(sale.total_amount || '0'), 0) || 0;
      const totalExpenses = todayExpenses?.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0) || 0;
      const profit = totalSales - totalExpenses;
      const pendingCollection = salesWithDue?.reduce((sum, sale) => sum + parseFloat(sale.due_amount || '0'), 0) || 0;
      
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
      return stats;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error; // NEVER fall back to offline data
    }
  }
};