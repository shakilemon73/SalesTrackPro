/**
 * Hybrid Data Hooks - Like TaliKhata/HishabPati
 * - Online: Sync with Supabase + store locally
 * - Offline: Use local data, queue changes
 * - Same UI/UX regardless of connection
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hybridAuth } from '@/lib/hybrid-auth';
import { offlineStorage } from '@/lib/offline-storage';
import { supabaseService } from '@/lib/supabase';
import { useNetworkStatus } from './use-network-status';

// Hybrid customers hook
export function useHybridCustomers() {
  const { isOnline } = useNetworkStatus();
  const user = hybridAuth.getCurrentUser();
  
  return useQuery({
    queryKey: ['customers', user?.user_id, 'hybrid'],
    queryFn: async () => {
      if (!user?.user_id) return [];

      if (isOnline) {
        try {
          // Try to get data from Supabase
          const onlineData = await supabaseService.getCustomers(user.user_id);
          
          // Store locally for offline use
          for (const customer of onlineData) {
            await offlineStorage.store('customers', customer);
          }
          
          console.log('🌐 HYBRID: Customers synced from online');
          return onlineData;
        } catch (error) {
          console.warn('🌐 HYBRID: Online fetch failed, using offline data');
          // Fall back to offline data
          return await offlineStorage.getAll('customers', user.user_id);
        }
      } else {
        // Use offline data
        console.log('📱 HYBRID: Using offline customers data');
        return await offlineStorage.getAll('customers', user.user_id);
      }
    },
    enabled: !!user?.user_id,
    staleTime: isOnline ? 30000 : Infinity, // 30s if online, never stale if offline
  });
}

// Hybrid sales hook
export function useHybridSales(limit?: number) {
  const { isOnline } = useNetworkStatus();
  const user = hybridAuth.getCurrentUser();
  
  return useQuery({
    queryKey: ['sales', user?.user_id, 'hybrid', limit],
    queryFn: async () => {
      if (!user?.user_id) return [];

      if (isOnline) {
        try {
          // Try to get data from Supabase
          const onlineData = await supabaseService.getSales(user.user_id, limit);
          
          // Store locally for offline use
          for (const sale of onlineData) {
            await offlineStorage.store('sales', sale);
          }
          
          console.log('🌐 HYBRID: Sales synced from online');
          return onlineData;
        } catch (error) {
          console.warn('🌐 HYBRID: Online fetch failed, using offline data');
          // Fall back to offline data
          const offlineData = await offlineStorage.getAll('sales', user.user_id);
          const sortedData = offlineData.sort((a, b) => 
            new Date(b.sale_date || b.created_at).getTime() - 
            new Date(a.sale_date || a.created_at).getTime()
          );
          return limit ? sortedData.slice(0, limit) : sortedData;
        }
      } else {
        // Use offline data
        console.log('📱 HYBRID: Using offline sales data');
        const offlineData = await offlineStorage.getAll('sales', user.user_id);
        const sortedData = offlineData.sort((a, b) => 
          new Date(b.sale_date || b.created_at).getTime() - 
          new Date(a.sale_date || a.created_at).getTime()
        );
        return limit ? sortedData.slice(0, limit) : sortedData;
      }
    },
    enabled: !!user?.user_id,
    staleTime: isOnline ? 30000 : Infinity,
  });
}

// Hybrid expenses hook
export function useHybridExpenses(limit?: number) {
  const { isOnline } = useNetworkStatus();
  const user = hybridAuth.getCurrentUser();
  
  return useQuery({
    queryKey: ['expenses', user?.user_id, 'hybrid', limit],
    queryFn: async () => {
      if (!user?.user_id) return [];

      if (isOnline) {
        try {
          const onlineData = await supabaseService.getExpenses(user.user_id, limit);
          
          // Store locally
          for (const expense of onlineData) {
            await offlineStorage.store('expenses', expense);
          }
          
          console.log('🌐 HYBRID: Expenses synced from online');
          return onlineData;
        } catch (error) {
          console.warn('🌐 HYBRID: Online fetch failed, using offline data');
          const offlineData = await offlineStorage.getAll('expenses', user.user_id);
          const sortedData = offlineData.sort((a, b) => 
            new Date(b.expense_date || b.created_at).getTime() - 
            new Date(a.expense_date || a.created_at).getTime()
          );
          return limit ? sortedData.slice(0, limit) : sortedData;
        }
      } else {
        console.log('📱 HYBRID: Using offline expenses data');
        const offlineData = await offlineStorage.getAll('expenses', user.user_id);
        const sortedData = offlineData.sort((a, b) => 
          new Date(b.expense_date || b.created_at).getTime() - 
          new Date(a.expense_date || a.created_at).getTime()
        );
        return limit ? sortedData.slice(0, limit) : sortedData;
      }
    },
    enabled: !!user?.user_id,
    staleTime: isOnline ? 30000 : Infinity,
  });
}

// Hybrid stats hook
export function useHybridStats() {
  const { isOnline } = useNetworkStatus();
  const user = hybridAuth.getCurrentUser();
  
  return useQuery({
    queryKey: ['stats', user?.user_id, 'hybrid'],
    queryFn: async () => {
      if (!user?.user_id) return null;

      if (isOnline) {
        try {
          const onlineStats = await supabaseService.getStats(user.user_id);
          console.log('🌐 HYBRID: Stats fetched from online');
          return onlineStats;
        } catch (error) {
          console.warn('🌐 HYBRID: Online stats failed, calculating offline');
        }
      }
      
      // Calculate stats from offline data
      console.log('📱 HYBRID: Calculating stats from offline data');
      const [customers, sales, expenses] = await Promise.all([
        offlineStorage.getAll('customers', user.user_id),
        offlineStorage.getAll('sales', user.user_id),
        offlineStorage.getAll('expenses', user.user_id),
      ]);

      const totalCustomers = customers.length;
      const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const totalDue = sales.reduce((sum, sale) => sum + (sale.due_amount || 0), 0);
      const totalPaid = sales.reduce((sum, sale) => sum + (sale.paid_amount || 0), 0);

      return {
        totalCustomers,
        totalSales,
        totalExpenses,
        totalDue,
        totalPaid,
        profit: totalSales - totalExpenses,
        salesCount: sales.length,
        expensesCount: expenses.length,
        todaySales: totalSales, // Simplified for offline
        todayProfit: totalSales - totalExpenses,
        pendingCollection: totalDue,
      };
    },
    enabled: !!user?.user_id,
    staleTime: isOnline ? 60000 : 300000, // 1min online, 5min offline
  });
}

// Hybrid create customer
export function useHybridCreateCustomer() {
  const { isOnline } = useNetworkStatus();
  const user = hybridAuth.getCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: any) => {
      if (!user?.user_id) throw new Error('User not authenticated');

      const newCustomer = {
        ...customerData,
        user_id: user.user_id,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        total_credit: 0,
        sync_status: isOnline ? 'synced' : 'pending_sync'
      };

      // Always store locally first
      await offlineStorage.store('customers', newCustomer);
      console.log('📱 HYBRID: Customer stored locally');

      if (isOnline && user.user_id !== '550e8400-e29b-41d4-a716-446655440000') {
        try {
          // Try to sync with Supabase (only for real users, not demo)
          const onlineCustomer = await supabaseService.createCustomer(user.user_id, {
            name: customerData.name,
            phone_number: customerData.phone_number,
            address: customerData.address,
            total_credit: 0
          });
          
          // Update local storage with server ID
          await offlineStorage.update('customers', newCustomer.id, {
            ...onlineCustomer,
            sync_status: 'synced'
          });
          
          console.log('🌐 HYBRID: Customer synced to server');
          return onlineCustomer;
        } catch (error) {
          console.warn('🌐 HYBRID: Failed to sync customer, keeping local');
          return newCustomer;
        }
      } else if (user.user_id === '550e8400-e29b-41d4-a716-446655440000') {
        console.log('📱 HYBRID: Demo user - customer stored offline only');
      }

      return newCustomer;
    },
    onSuccess: (newCustomer) => {
      // Optimistic update for immediate UI response
      queryClient.setQueryData(['customers', user?.user_id, 'hybrid'], (old: any) => {
        return old ? [newCustomer, ...old] : [newCustomer];
      });
      
      // Update stats optimistically
      queryClient.setQueryData(['stats', user?.user_id, 'hybrid'], (old: any) => {
        if (!old) return old;
        return { ...old, totalCustomers: (old.totalCustomers || 0) + 1 };
      });

      // Invalidate all related queries for instant cross-page updates
      queryClient.invalidateQueries({ queryKey: ['customers', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['stats', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['sales', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.user_id] });
      console.log('🔄 HYBRID: All queries invalidated after customer creation');
    },
  });
}

// Hybrid create sale
export function useHybridCreateSale() {
  const { isOnline } = useNetworkStatus();
  const user = hybridAuth.getCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleData: any) => {
      if (!user?.user_id) throw new Error('User not authenticated');

      const newSale = {
        ...saleData,
        user_id: user.user_id,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        sale_date: saleData.sale_date || new Date().toISOString(),
        sync_status: isOnline ? 'synced' : 'pending_sync'
      };

      // Always store locally first
      await offlineStorage.store('sales', newSale);
      console.log('📱 HYBRID: Sale stored locally');

      if (isOnline && user.user_id !== '550e8400-e29b-41d4-a716-446655440000') {
        try {
          // Try to sync with Supabase (only for real users, not demo)
          const onlineSale = await supabaseService.createSale(user.user_id, saleData);
          
          // Update local storage with server data
          await offlineStorage.update('sales', newSale.id, {
            ...onlineSale,
            sync_status: 'synced'
          });
          
          console.log('🌐 HYBRID: Sale synced to server');
          return onlineSale;
        } catch (error) {
          console.warn('🌐 HYBRID: Failed to sync sale, keeping local');
          return newSale;
        }
      }

      return newSale;
    },
    onSuccess: (newSale) => {
      // Optimistic update for immediate UI response
      queryClient.setQueryData(['sales', user?.user_id, 'hybrid'], (old: any) => {
        return old ? [newSale, ...old] : [newSale];
      });
      
      // Update stats optimistically
      queryClient.setQueryData(['stats', user?.user_id, 'hybrid'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          totalSales: (old.totalSales || 0) + (newSale.total_amount || 0),
          salesCount: (old.salesCount || 0) + 1,
          todaySales: (old.todaySales || 0) + (newSale.total_amount || 0),
          profit: (old.profit || 0) + ((newSale.total_amount || 0) - (newSale.cost || 0)),
        };
      });

      // Invalidate all related queries for instant cross-page updates
      queryClient.invalidateQueries({ queryKey: ['sales', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['stats', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['customers', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.user_id] });
      console.log('🔄 HYBRID: All queries invalidated after sale creation');
    },
  });
}

// Hybrid create expense
export function useHybridCreateExpense() {
  const { isOnline } = useNetworkStatus();
  const user = hybridAuth.getCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData: any) => {
      if (!user?.user_id) throw new Error('User not authenticated');

      const newExpense = {
        ...expenseData,
        user_id: user.user_id,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        expense_date: expenseData.expense_date || new Date().toISOString(),
        sync_status: isOnline ? 'synced' : 'pending_sync'
      };

      // Always store locally first
      await offlineStorage.store('expenses', newExpense);
      console.log('📱 HYBRID: Expense stored locally');

      if (isOnline && user.user_id !== '550e8400-e29b-41d4-a716-446655440000') {
        try {
          // Try to sync with Supabase (only for real users, not demo)
          const onlineExpense = await supabaseService.createExpense(user.user_id, expenseData);
          
          // Update local storage with server ID
          await offlineStorage.update('expenses', newExpense.id, {
            ...onlineExpense,
            sync_status: 'synced'
          });
          
          console.log('🌐 HYBRID: Expense synced to server');
          return onlineExpense;
        } catch (error) {
          console.warn('🌐 HYBRID: Failed to sync expense, keeping local');
          return newExpense;
        }
      }

      return newExpense;
    },
    onSuccess: (newExpense) => {
      // Optimistic update for immediate UI response
      queryClient.setQueryData(['expenses', user?.user_id, 'hybrid'], (old: any) => {
        return old ? [newExpense, ...old] : [newExpense];
      });
      
      // Update stats optimistically
      queryClient.setQueryData(['stats', user?.user_id, 'hybrid'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          totalExpenses: (old.totalExpenses || 0) + (newExpense.amount || 0),
          profit: (old.profit || 0) - (newExpense.amount || 0),
        };
      });

      // Invalidate all related queries for instant cross-page updates
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['stats', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['sales', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['customers', user?.user_id] });
      console.log('🔄 HYBRID: All queries invalidated after expense creation');
    },
  });
}

// Hybrid create collection
export function useHybridCreateCollection() {
  const { isOnline } = useNetworkStatus();
  const user = hybridAuth.getCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collectionData: any) => {
      if (!user?.user_id) throw new Error('User not authenticated');

      const newCollection = {
        ...collectionData,
        user_id: user.user_id,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        collection_date: collectionData.collection_date || new Date().toISOString(),
        sync_status: isOnline ? 'synced' : 'pending_sync'
      };

      // Always store locally first
      await offlineStorage.store('collections', newCollection);
      console.log('📱 HYBRID: Collection stored locally');

      if (isOnline) {
        try {
          // Try to sync with Supabase
          const onlineCollection = await supabaseService.createCollection(user.user_id, collectionData);
          
          // Update local storage with server ID
          await offlineStorage.update('collections', newCollection.id, {
            ...onlineCollection,
            sync_status: 'synced'
          });
          
          console.log('🌐 HYBRID: Collection synced to server');
          return onlineCollection;
        } catch (error) {
          console.warn('🌐 HYBRID: Failed to sync collection, keeping local');
          return newCollection;
        }
      }

      return newCollection;
    },
    onSuccess: () => {
      // Invalidate all related queries for instant cross-page updates
      queryClient.invalidateQueries({ queryKey: ['collections', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['stats', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['customers', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['sales', user?.user_id] });
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.user_id] });
      console.log('🔄 HYBRID: All queries invalidated after collection creation');
    },
  });
}