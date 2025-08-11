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

// Check if we should use offline mode
let isOfflineMode = false;

// Function to test Supabase connection
async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    return !error;
  } catch (error) {
    console.log('Supabase connection test failed, switching to offline mode');
    return false;
  }
}

// Initialize connection test
testSupabaseConnection().then(isConnected => {
  if (!isConnected) {
    isOfflineMode = true;
    console.log('Running in offline mode with local data');
  }
});

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
      if (isOfflineMode) {
        return this.getOfflineCustomers();
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching customers:', error);
        return this.getOfflineCustomers();
      }
      
      console.log('Customers fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getCustomers failed:', error);
      return this.getOfflineCustomers();
    }
  },

  getOfflineCustomers(): Customer[] {
    return [
      {
        id: '22222222-2222-2222-2222-222222222222',
        user_id: '11111111-1111-1111-1111-111111111111',
        name: 'করিম সাহেব',
        phone_number: '01711111111',
        address: 'গুলশান, ঢাকা',
        total_credit: '1500.00',
        created_at: new Date()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        user_id: '11111111-1111-1111-1111-111111111111',
        name: 'ফাতেমা খাতুন',
        phone_number: '01722222222',
        address: 'ধানমন্ডি, ঢাকা',
        total_credit: '800.00',
        created_at: new Date()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        user_id: '11111111-1111-1111-1111-111111111111',
        name: 'রহমান সাহেব',
        phone_number: '01733333333',
        address: 'উত্তরা, ঢাকা',
        total_credit: '0.00',
        created_at: new Date()
      }
    ];
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

  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      console.log('Updating customer:', customerId, updates);
      
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', customerId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }
      
      console.log('Customer updated successfully:', data);
      return data;
    } catch (error) {
      console.error('updateCustomer failed:', error);
      throw error;
    }
  },

  async getCustomer(customerId: string): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('getCustomer failed:', error);
      throw error;
    }
  },

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      console.log('Deleting customer:', customerId);
      
      // First check if customer has any sales (optional - you might want to prevent deletion if they have sales)
      const { data: sales } = await supabase
        .from('sales')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1);
      
      if (sales && sales.length > 0) {
        throw new Error('Cannot delete customer with existing sales records');
      }
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);
      
      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }
      
      console.log('Customer deleted successfully');
    } catch (error) {
      console.error('deleteCustomer failed:', error);
      throw error;
    }
  },

  // Products
  async getProducts(userId: string): Promise<Product[]> {
    try {
      if (isOfflineMode) {
        return this.getOfflineProducts();
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        return this.getOfflineProducts();
      }
      
      return data || [];
    } catch (error) {
      console.error('getProducts failed:', error);
      return this.getOfflineProducts();
    }
  },

  getOfflineProducts(): Product[] {
    return [
      {
        id: '55555555-5555-5555-5555-555555555555',
        userId: '11111111-1111-1111-1111-111111111111',
        name: 'চাল (মিনিকেট)',
        category: 'খাদ্য',
        unit: 'কেজি',
        buyingPrice: '45.00',
        sellingPrice: '50.00',
        currentStock: 100,
        minStockLevel: 20,
        createdAt: new Date()
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        userId: '11111111-1111-1111-1111-111111111111',
        name: 'ডাল (মসুর)',
        category: 'খাদ্য',
        unit: 'কেজি',
        buyingPrice: '80.00',
        sellingPrice: '90.00',
        currentStock: 50,
        minStockLevel: 10,
        createdAt: new Date()
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        userId: '11111111-1111-1111-1111-111111111111',
        name: 'তেল (সোনালী)',
        category: 'খাদ্য',
        unit: 'লিটার',
        buyingPrice: '140.00',
        sellingPrice: '150.00',
        currentStock: 5,
        minStockLevel: 10,
        createdAt: new Date()
      }
    ];
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
    try {
      if (isOfflineMode) {
        const offlineSales = this.getOfflineSales();
        return limit ? offlineSales.slice(0, limit) : offlineSales;
      }

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
        console.error('Error fetching sales:', error);
        const offlineSales = this.getOfflineSales();
        return limit ? offlineSales.slice(0, limit) : offlineSales;
      }
      
      return data || [];
    } catch (error) {
      console.error('getSales failed:', error);
      const offlineSales = this.getOfflineSales();
      return limit ? offlineSales.slice(0, limit) : offlineSales;
    }
  },

  getOfflineSales(): Sale[] {
    return [
      {
        id: '8a65f171-26ad-4528-8ca9-c53fde2ad91a',
        user_id: '11111111-1111-1111-1111-111111111111',
        customer_id: '33333333-3333-3333-3333-333333333333',
        customer_name: 'ফাতেমা খাতুন',
        total_amount: 12269.97,
        paid_amount: 12269.97,
        due_amount: 0,
        payment_method: 'নগদ',
        items: [
          {
            quantity: 3,
            unitPrice: "4089.99",
            totalPrice: "12269.97",
            productName: "nnn"
          }
        ],
        sale_date: new Date(),
        created_at: new Date()
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        user_id: '11111111-1111-1111-1111-111111111111',
        customer_id: '22222222-2222-2222-2222-222222222222',
        customer_name: 'করিম সাহেব',
        total_amount: '500.00',
        paid_amount: '300.00',
        due_amount: '200.00',
        payment_method: 'নগদ',
        items: [
          {
            name: 'চাল (মিনিকেট)',
            quantity: 10,
            price: 50.00,
            total: 500.00
          }
        ],
        sale_date: new Date(),
        created_at: new Date()
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        user_id: '11111111-1111-1111-1111-111111111111',
        customer_id: '33333333-3333-3333-3333-333333333333',
        customer_name: 'ফাতেমা খাতুন',
        total_amount: '270.00',
        paid_amount: '270.00',
        due_amount: '0.00',
        payment_method: 'নগদ',
        items: [
          {
            name: 'ডাল (মসুর)',
            quantity: 3,
            price: 90.00,
            total: 270.00
          }
        ],
        sale_date: new Date(),
        created_at: new Date()
      }
    ];
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
    try {
      if (isOfflineMode) {
        // Return today's sales from offline data
        const allOfflineSales = this.getOfflineSales();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return allOfflineSales.filter(sale => {
          const saleDate = new Date(sale.sale_date);
          return saleDate >= today && saleDate < tomorrow;
        });
      }

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
      
      if (error) {
        console.error('Error fetching today sales:', error);
        // Fallback to offline data
        const allOfflineSales = this.getOfflineSales();
        return allOfflineSales.filter(sale => {
          const saleDate = new Date(sale.sale_date);
          return saleDate >= today && saleDate < tomorrow;
        });
      }
      
      return data || [];
    } catch (error) {
      console.error('getTodaySales failed:', error);
      // Fallback to offline data
      const allOfflineSales = this.getOfflineSales();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return allOfflineSales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= today && saleDate < tomorrow;
      });
    }
  },

  // Expenses
  async getExpenses(userId: string, limit?: number): Promise<Expense[]> {
    try {
      if (isOfflineMode) {
        const offlineExpenses = this.getOfflineExpenses();
        return limit ? offlineExpenses.slice(0, limit) : offlineExpenses;
      }

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
        console.error('Error fetching expenses:', error);
        const offlineExpenses = this.getOfflineExpenses();
        return limit ? offlineExpenses.slice(0, limit) : offlineExpenses;
      }
      
      return data || [];
    } catch (error) {
      console.error('getExpenses failed:', error);
      const offlineExpenses = this.getOfflineExpenses();
      return limit ? offlineExpenses.slice(0, limit) : offlineExpenses;
    }
  },

  getOfflineExpenses(): Expense[] {
    return [
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        userId: '11111111-1111-1111-1111-111111111111',
        description: 'দোকান ভাড়া',
        amount: '5000.00',
        category: 'ভাড়া',
        expenseDate: new Date(),
        createdAt: new Date()
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        userId: '11111111-1111-1111-1111-111111111111',
        description: 'বিদ্যুৎ বিল',
        amount: '800.00',
        category: 'ইউটিলিটি',
        expenseDate: new Date(),
        createdAt: new Date()
      }
    ];
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

  // Collections - simplified using sales data
  async getCollections(userId: string, limit?: number): Promise<any[]> {
    try {
      // Get sales with paid amounts as collections
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userId)
        .gt('paid_amount', 0)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('getCollections error:', error);
        throw error;
      }
      
      // Ensure data is an array
      const salesData = Array.isArray(data) ? data : [];
      
      const collections = salesData.map(sale => ({
        ...sale,
        amount: sale.paid_amount,
        collection_date: sale.created_at,
        customer_name: sale.customer_name
      }));
      
      return limit ? collections.slice(0, limit) : collections;
    } catch (error) {
      console.error('getCollections failed:', error);
      return [];
    }
  },

  async createCollection(userId: string, collection: InsertCollection): Promise<Collection> {
    const { data, error } = await supabase
      .from('collections')
      .insert({ 
        customer_id: collection.customerId,
        sale_id: collection.saleId,
        amount: parseFloat(collection.amount),
        user_id: userId,
        collection_date: new Date().toISOString()
      })
      .select(`
        *,
        customers(name)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async reduceCustomerDueFromSales(customerId: string, amountPaid: number): Promise<void> {
    try {
      // Get all sales with due amounts for this customer
      const { data: salesWithDue, error: fetchError } = await supabase
        .from('sales')
        .select('id, due_amount')
        .eq('customer_id', customerId)
        .gt('due_amount', 0)
        .order('sale_date', { ascending: true }); // Pay oldest first
      
      if (fetchError) throw fetchError;
      
      let remainingAmount = amountPaid;
      
      // Reduce due amounts from oldest sales first
      for (const sale of salesWithDue || []) {
        if (remainingAmount <= 0) break;
        
        const currentDue = typeof sale.due_amount === 'string' ? parseFloat(sale.due_amount) : sale.due_amount;
        const paymentForThisSale = Math.min(remainingAmount, currentDue);
        const newDueAmount = currentDue - paymentForThisSale;
        
        // Update this sale's due amount
        const { error: updateError } = await supabase
          .from('sales')
          .update({ due_amount: newDueAmount })
          .eq('id', sale.id);
        
        if (updateError) throw updateError;
        
        remainingAmount -= paymentForThisSale;
      }
    } catch (error) {
      console.error('Error reducing customer due from sales:', error);
      // Don't throw error to prevent collection creation failure
    }
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
              const buyingPrice = typeof product.buyingPrice === 'string' ? 
                parseFloat(product.buyingPrice) : (product.buyingPrice || 0);
              const profit = (itemPrice - buyingPrice) * quantity;
              console.log(`Profit calc - Item: ${productName}, Selling: ${itemPrice}, Buying: ${buyingPrice}, Qty: ${quantity}, Profit: ${profit}`);
              todayProfit += profit || 0;
            } else {
              console.log(`Product not found for item: ${productName}, productId: ${item.productId}`);
            }
          }
        }
      }

      // Calculate pending collection from customer total_credit and due amounts
      let pendingCollection = 0;
      
      // Add up customer total_credit (this is the main source of truth for pending amounts)
      pendingCollection += customers.reduce((sum, customer) => {
        const credit = typeof customer.total_credit === 'string' ? parseFloat(customer.total_credit) : customer.total_credit;
        return sum + (credit || 0);
      }, 0);
      
      // Also add due amounts from recent sales that haven't been updated in customer records
      const recentDueFromSales = allSales.reduce((sum, sale) => {
        const dueAmount = typeof sale.due_amount === 'string' ? parseFloat(sale.due_amount) : sale.due_amount;
        return sum + (dueAmount || 0);
      }, 0);
      
      // Use the higher value to ensure we don't lose any due amounts during transition
      pendingCollection = Math.max(pendingCollection, recentDueFromSales);

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