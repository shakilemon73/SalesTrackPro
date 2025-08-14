/**
 * Pure Offline Data Hooks
 * Works completely without internet connection
 * No online fallback - purely offline for maximum reliability
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOfflineAuth } from './use-offline-auth';
import { offlineStorage } from '@/lib/offline-storage';

// Pure offline customers hook
export function usePureOfflineCustomers() {
  const { user } = useOfflineAuth();
  
  return useQuery({
    queryKey: ['customers', user?.id, 'pure-offline'],
    queryFn: async () => {
      if (!user?.id) return [];
      const customers = await offlineStorage.getAll('customers', user.id);
      console.log('📱 PURE OFFLINE: Retrieved customers:', customers.length);
      return customers;
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Never stale in offline mode
    retry: false,
  });
}

// Pure offline sales hook
export function usePureOfflineSales(limit?: number) {
  const { user } = useOfflineAuth();
  
  return useQuery({
    queryKey: ['sales', user?.id, 'pure-offline', limit],
    queryFn: async () => {
      if (!user?.id) return [];
      const sales = await offlineStorage.getAll('sales', user.id);
      console.log('📱 PURE OFFLINE: Retrieved sales:', sales.length);
      
      // Sort by date descending and apply limit
      const sortedSales = sales.sort((a, b) => 
        new Date(b.sale_date || b.created_at).getTime() - 
        new Date(a.sale_date || a.created_at).getTime()
      );
      
      return limit ? sortedSales.slice(0, limit) : sortedSales;
    },
    enabled: !!user?.id,
    staleTime: Infinity,
    retry: false,
  });
}

// Pure offline expenses hook
export function usePureOfflineExpenses(limit?: number) {
  const { user } = useOfflineAuth();
  
  return useQuery({
    queryKey: ['expenses', user?.id, 'pure-offline', limit],
    queryFn: async () => {
      if (!user?.id) return [];
      const expenses = await offlineStorage.getAll('expenses', user.id);
      console.log('📱 PURE OFFLINE: Retrieved expenses:', expenses.length);
      
      // Sort by date descending and apply limit
      const sortedExpenses = expenses.sort((a, b) => 
        new Date(b.expense_date || b.created_at).getTime() - 
        new Date(a.expense_date || a.created_at).getTime()
      );
      
      return limit ? sortedExpenses.slice(0, limit) : sortedExpenses;
    },
    enabled: !!user?.id,
    staleTime: Infinity,
    retry: false,
  });
}

// Pure offline customer creation
export function usePureOfflineCreateCustomer() {
  const { user } = useOfflineAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      const newCustomer = {
        ...customerData,
        user_id: user.id,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        total_credit: 0,
      };

      console.log('📱 PURE OFFLINE: Creating customer');
      await offlineStorage.store('customers', newCustomer);
      
      return newCustomer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', user?.id, 'pure-offline'] });
    },
  });
}

// Pure offline sale creation
export function usePureOfflineCreateSale() {
  const { user } = useOfflineAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleData: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      const newSale = {
        ...saleData,
        user_id: user.id,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        sale_date: saleData.sale_date || new Date().toISOString(),
      };

      console.log('📱 PURE OFFLINE: Creating sale');
      await offlineStorage.store('sales', newSale);
      
      return newSale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', user?.id, 'pure-offline'] });
    },
  });
}

// Pure offline expense creation
export function usePureOfflineCreateExpense() {
  const { user } = useOfflineAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      const newExpense = {
        ...expenseData,
        user_id: user.id,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        expense_date: expenseData.expense_date || new Date().toISOString(),
      };

      console.log('📱 PURE OFFLINE: Creating expense');
      await offlineStorage.store('expenses', newExpense);
      
      return newExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id, 'pure-offline'] });
    },
  });
}

// Pure offline customer update
export function usePureOfflineUpdateCustomer() {
  const { user } = useOfflineAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('📱 PURE OFFLINE: Updating customer', id);
      await offlineStorage.update('customers', id, data);
      
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', user?.id, 'pure-offline'] });
    },
  });
}

// Pure offline customer deletion
export function usePureOfflineDeleteCustomer() {
  const { user } = useOfflineAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('📱 PURE OFFLINE: Deleting customer', customerId);
      await offlineStorage.delete('customers', customerId);
      
      return customerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', user?.id, 'pure-offline'] });
    },
  });
}

// Pure offline single customer by ID
export function usePureOfflineCustomer(customerId?: string) {
  const { user } = useOfflineAuth();
  
  return useQuery({
    queryKey: ['customer', customerId, 'pure-offline'],
    queryFn: async () => {
      if (!customerId) return null;
      const customer = await offlineStorage.getById('customers', customerId);
      console.log('📱 PURE OFFLINE: Retrieved customer:', customerId);
      return customer;
    },
    enabled: !!customerId && !!user?.id,
    staleTime: Infinity,
    retry: false,
  });
}

// Get offline statistics
export function usePureOfflineStats() {
  const { user } = useOfflineAuth();
  
  return useQuery({
    queryKey: ['stats', user?.id, 'pure-offline'],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const [customers, sales, expenses] = await Promise.all([
        offlineStorage.getAll('customers', user.id),
        offlineStorage.getAll('sales', user.id),
        offlineStorage.getAll('expenses', user.id),
      ]);

      // Calculate statistics
      const totalCustomers = customers.length;
      const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const totalDue = sales.reduce((sum, sale) => sum + (sale.due_amount || 0), 0);
      const totalPaid = sales.reduce((sum, sale) => sum + (sale.paid_amount || 0), 0);

      console.log('📱 PURE OFFLINE: Calculated stats');
      
      return {
        totalCustomers,
        totalSales,
        totalExpenses,
        totalDue,
        totalPaid,
        profit: totalSales - totalExpenses,
        salesCount: sales.length,
        expensesCount: expenses.length,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}