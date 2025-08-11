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

// Supabase configuration with fallback values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lkhqdqlryjzalsemofdt.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraHFkcWxyeWp6YWxzZW1vZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjgzOTcsImV4cCI6MjA3MDQwNDM5N30.uyaSNaaUf_hEx6RSqND6a9Unb_IvHKmV6tOLsGFcITc';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Current user ID (in a real app, this would come from authentication)
// Using a UUID format for consistency with database
export const CURRENT_USER_ID = '11111111-1111-1111-1111-111111111111';

// Database service functions
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

  // Customers
  async getCustomers(userId: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      
      console.log('Customers fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getCustomers failed:', error);
      return [];
    }
  },

  async createCustomer(userId: string, customer: InsertCustomer): Promise<Customer> {
    try {
      console.log('Creating customer:', customer);
      
      // Map frontend field names to database field names
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
        console.error('Error creating customer:', error);
        throw error;
      }
      
      console.log('Customer created successfully:', data);
      return data;
    } catch (error) {
      console.error('createCustomer failed:', error);
      throw error;
    }
  },

  // Products
  async getProducts(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
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

  // Sales
  async getSales(userId: string, limit?: number): Promise<Sale[]> {
    let query = supabase
      .from('sales')
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

  async createSale(userId: string, sale: InsertSale): Promise<Sale> {
    try {
      console.log('Creating sale:', sale);
      
      const { data, error } = await supabase
        .from('sales')
        .insert({ ...sale, user_id: userId })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating sale:', error);
        throw error;
      }
      
      console.log('Sale created successfully:', data);
      return data;
    } catch (error) {
      console.error('createSale failed:', error);
      throw error;
    }
  },

  async getTodaySales(userId: string): Promise<Sale[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('sale_date', today.toISOString())
      .lt('sale_date', tomorrow.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Expenses
  async getExpenses(userId: string, limit?: number): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
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

  async createExpense(userId: string, expense: InsertExpense): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Collections
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

  // Dashboard stats
  async getDashboardStats(userId: string): Promise<{
    todaySales: number;
    todayProfit: number;
    pendingCollection: number;
    totalCustomers: number;
  }> {
    try {
      // Get today's sales
      const todaySales = await this.getTodaySales(userId);
      const customers = await this.getCustomers(userId);
      const products = await this.getProducts(userId);
      
      // Get all sales for pending collection calculation
      const allSales = await this.getSales(userId);

      console.log('Dashboard stats - Today sales:', todaySales);
      console.log('Dashboard stats - Customers count:', customers.length);
      console.log('Dashboard stats - Products sample:', products.slice(0, 2));

      // Calculate today's sales total
      const todaySalesTotal = todaySales.reduce((sum, sale) => {
        const amount = typeof sale.total_amount === 'string' ? parseFloat(sale.total_amount) : sale.total_amount;
        return sum + (amount || 0);
      }, 0);
      
      // Calculate profit based on buying vs selling price
      let todayProfit = 0;
      for (const sale of todaySales) {
        if (Array.isArray(sale.items)) {
          for (const item of sale.items as any[]) {
            // Handle different item structures
            const productName = item.productName || item.name;
            const quantity = item.quantity || 1;
            
            // Try to get price from different possible fields
            let itemPrice = 0;
            if (item.unitPrice) {
              itemPrice = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;
            } else if (item.price) {
              itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            } else if (item.total && quantity > 0) {
              const total = typeof item.total === 'string' ? parseFloat(item.total) : item.total;
              itemPrice = total / quantity;
            }
            
            // Find matching product by name or ID
            const product = products.find(p => 
              p.id === item.productId || 
              p.name === productName ||
              p.name?.toLowerCase() === productName?.toLowerCase()
            );
            
            if (product && itemPrice > 0) {
              const buyingPrice = typeof product.buying_price === 'string' ? 
                parseFloat(product.buying_price) : (product.buying_price || 0);
              const profit = (itemPrice - buyingPrice) * quantity;
              console.log(`Profit calc - Item: ${productName}, Selling: ${itemPrice}, Buying: ${buyingPrice}, Qty: ${quantity}, Profit: ${profit}`);
              todayProfit += profit || 0;
            } else {
              console.log(`Product not found for item: ${productName}, productId: ${item.productId}`);
            }
          }
        }
      }

      // Calculate pending collection from due amounts in sales
      const pendingCollection = allSales.reduce((sum, sale) => {
        const dueAmount = typeof sale.due_amount === 'string' ? parseFloat(sale.due_amount) : sale.due_amount;
        return sum + (dueAmount || 0);
      }, 0);

      const stats = {
        todaySales: todaySalesTotal,
        todayProfit: Math.round(todayProfit * 100) / 100, // Round to 2 decimal places
        pendingCollection,
        totalCustomers: customers.length
      };

      console.log('Dashboard stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      return {
        todaySales: 0,
        todayProfit: 0,
        pendingCollection: 0,
        totalCustomers: 0
      };
    }
  }
};