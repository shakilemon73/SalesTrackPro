/**
 * Enhanced Offline-First Data Hooks for Dokan Hisab
 * Provides seamless offline functionality with automatic sync
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { offlineStorage } from '@/lib/offline-storage';
import { supabaseService } from '@/lib/supabase';
import { syncManager } from '@/lib/sync-manager';
// import { cacheManager } from '@/lib/cache-manager';

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState<number>(Date.now());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineTime(Date.now());
      console.log('🌐 Network: Back online, triggering sync');
      syncManager.forceSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🌐 Network: Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastOnlineTime };
}

// Enhanced customers hook with offline support
export function useCustomersOffline() {
  const { userId } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  return useQuery({
    queryKey: ['customers', userId, 'offline'],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('🔄 Fetching customers - Online:', isOnline);
      
      try {
        if (isOnline) {
          // Try online first
          const onlineData = await supabaseService.getCustomers(userId);
          
          // Store offline for next time
          for (const customer of onlineData) {
            await offlineStorage.store('customers', customer);
          }
          
          return onlineData;
        } else {
          // Fallback to offline data
          const offlineData = await offlineStorage.getAll('customers', userId);
          console.log('📱 Using offline customers data:', offlineData.length);
          return offlineData;
        }
      } catch (error) {
        console.log('⚠️ Online fetch failed, using offline data');
        const offlineData = await offlineStorage.getAll('customers', userId);
        return offlineData;
      }
    },
    enabled: !!userId,
    staleTime: isOnline ? 1000 * 60 * 5 : Infinity, // 5 min online, never stale offline
    retry: isOnline ? 1 : false,
  });
}

// Enhanced sales hook with offline support
export function useSalesOffline(limit?: number) {
  const { userId } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  return useQuery({
    queryKey: ['sales', userId, 'offline', limit],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('🔄 Fetching sales - Online:', isOnline);
      
      try {
        if (isOnline) {
          // Try online first
          const onlineData = await supabaseService.getSales(userId, limit);
          
          // Store offline for next time
          for (const sale of onlineData) {
            await offlineStorage.store('sales', sale);
          }
          
          return onlineData;
        } else {
          // Fallback to offline data
          const offlineData = await offlineStorage.getAll('sales', userId);
          console.log('📱 Using offline sales data:', offlineData.length);
          
          // Apply limit if specified
          return limit ? offlineData.slice(0, limit) : offlineData;
        }
      } catch (error) {
        console.log('⚠️ Online fetch failed, using offline data');
        const offlineData = await offlineStorage.getAll('sales', userId);
        return limit ? offlineData.slice(0, limit) : offlineData;
      }
    },
    enabled: !!userId,
    staleTime: isOnline ? 1000 * 60 * 2 : Infinity, // 2 min online, never stale offline
    retry: isOnline ? 1 : false,
  });
}

// Enhanced expenses hook with offline support
export function useExpensesOffline(limit?: number) {
  const { userId } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  return useQuery({
    queryKey: ['expenses', userId, 'offline', limit],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('🔄 Fetching expenses - Online:', isOnline);
      
      try {
        if (isOnline) {
          // Try online first
          const onlineData = await supabaseService.getExpenses(userId, limit);
          
          // Store offline for next time
          for (const expense of onlineData) {
            await offlineStorage.store('expenses', expense);
          }
          
          return onlineData;
        } else {
          // Fallback to offline data
          const offlineData = await offlineStorage.getAll('expenses', userId);
          console.log('📱 Using offline expenses data:', offlineData.length);
          
          // Apply limit if specified
          return limit ? offlineData.slice(0, limit) : offlineData;
        }
      } catch (error) {
        console.log('⚠️ Online fetch failed, using offline data');
        const offlineData = await offlineStorage.getAll('expenses', userId);
        return limit ? offlineData.slice(0, limit) : offlineData;
      }
    },
    enabled: !!userId,
    staleTime: isOnline ? 1000 * 60 * 2 : Infinity,
    retry: isOnline ? 1 : false,
  });
}

// Enhanced products hook with offline support
export function useProductsOffline() {
  const { userId } = useAuth();
  const { isOnline } = useNetworkStatus();
  
  return useQuery({
    queryKey: ['products', userId, 'offline'],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('🔄 Fetching products - Online:', isOnline);
      
      try {
        if (isOnline) {
          // Try online first
          const onlineData = await supabaseService.getProducts(userId);
          
          // Store offline for next time
          for (const product of onlineData) {
            await offlineStorage.store('products', product);
          }
          
          return onlineData;
        } else {
          // Fallback to offline data
          const offlineData = await offlineStorage.getAll('products', userId);
          console.log('📱 Using offline products data:', offlineData.length);
          return offlineData;
        }
      } catch (error) {
        console.log('⚠️ Online fetch failed, using offline data');
        const offlineData = await offlineStorage.getAll('products', userId);
        return offlineData;
      }
    },
    enabled: !!userId,
    staleTime: isOnline ? 1000 * 60 * 10 : Infinity, // 10 min online
    retry: isOnline ? 1 : false,
  });
}

// Offline-capable customer creation mutation
export function useCreateCustomerOffline() {
  const { userId } = useAuth();
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: any) => {
      if (!userId) throw new Error('User not authenticated');

      const newCustomer = {
        ...customerData,
        user_id: userId,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        total_credit: 0,
      };

      console.log('💾 Creating customer - Online:', isOnline);

      if (isOnline) {
        try {
          // Try online creation first
          const result = await supabaseService.createCustomer(userId, customerData);
          
          // Store in offline storage too
          await offlineStorage.store('customers', result);
          
          return result;
        } catch (error) {
          console.log('⚠️ Online creation failed, storing offline');
          // Store offline and queue for sync
          await offlineStorage.store('customers', newCustomer);
          await offlineStorage.addPendingAction({
            id: crypto.randomUUID(),
            table: 'customers',
            action: 'create',
            data: newCustomer,
            timestamp: Date.now(),
            synced: false
          });
          
          return newCustomer;
        }
      } else {
        // Store offline and queue for sync
        console.log('📱 Storing customer offline for sync');
        await offlineStorage.store('customers', newCustomer);
        await offlineStorage.addPendingAction({
          id: crypto.randomUUID(),
          table: 'customers',
          action: 'create',
          data: newCustomer,
          timestamp: Date.now(),
          synced: false
        });
        
        return newCustomer;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch customers
      queryClient.invalidateQueries({ queryKey: ['customers', userId, 'offline'] });
    },
  });
}

// Offline-capable sales creation mutation
export function useCreateSaleOffline() {
  const { userId } = useAuth();
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleData: any) => {
      if (!userId) throw new Error('User not authenticated');

      const newSale = {
        ...saleData,
        user_id: userId,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        sale_date: saleData.sale_date || new Date().toISOString(),
      };

      console.log('💾 Creating sale - Online:', isOnline);

      if (isOnline) {
        try {
          // Try online creation first
          const result = await supabaseService.createSale(userId, saleData);
          
          // Store in offline storage too
          await offlineStorage.store('sales', result);
          
          return result;
        } catch (error) {
          console.log('⚠️ Online creation failed, storing offline');
          // Store offline and queue for sync
          await offlineStorage.store('sales', newSale);
          await offlineStorage.addPendingAction({
            id: crypto.randomUUID(),
            table: 'sales',
            action: 'create',
            data: newSale,
            timestamp: Date.now(),
            synced: false
          });
          
          return newSale;
        }
      } else {
        // Store offline and queue for sync
        console.log('📱 Storing sale offline for sync');
        await offlineStorage.store('sales', newSale);
        await offlineStorage.addPendingAction({
          id: crypto.randomUUID(),
          table: 'sales',
          action: 'create',
          data: newSale,
          timestamp: Date.now(),
          synced: false
        });
        
        return newSale;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch sales
      queryClient.invalidateQueries({ queryKey: ['sales', userId, 'offline'] });
      queryClient.invalidateQueries({ queryKey: ['customers', userId, 'offline'] });
    },
  });
}

// Offline-capable expense creation mutation
export function useCreateExpenseOffline() {
  const { userId } = useAuth();
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData: any) => {
      if (!userId) throw new Error('User not authenticated');

      const newExpense = {
        ...expenseData,
        user_id: userId,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        expense_date: expenseData.expense_date || new Date().toISOString(),
      };

      console.log('💾 Creating expense - Online:', isOnline);

      if (isOnline) {
        try {
          // Try online creation first
          const result = await supabaseService.createExpense(userId, expenseData);
          
          // Store in offline storage too
          await offlineStorage.store('expenses', result);
          
          return result;
        } catch (error) {
          console.log('⚠️ Online creation failed, storing offline');
          // Store offline and queue for sync
          await offlineStorage.store('expenses', newExpense);
          await offlineStorage.addPendingAction({
            id: crypto.randomUUID(),
            table: 'expenses',
            action: 'create',
            data: newExpense,
            timestamp: Date.now(),
            synced: false
          });
          
          return newExpense;
        }
      } else {
        // Store offline and queue for sync
        console.log('📱 Storing expense offline for sync');
        await offlineStorage.store('expenses', newExpense);
        await offlineStorage.addPendingAction({
          id: crypto.randomUUID(),
          table: 'expenses',
          action: 'create',
          data: newExpense,
          timestamp: Date.now(),
          synced: false
        });
        
        return newExpense;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ['expenses', userId, 'offline'] });
    },
  });
}

// Sync status hook
export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState(syncManager.getSyncStatus());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(syncManager.getSyncStatus());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    ...syncStatus,
    forcSync: () => syncManager.forceSync(),
  };
}

// Offline data initialization hook
export function useOfflineInit() {
  const { userId, isAuthenticated } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId && isOnline) {
      console.log('🔄 Initializing offline data for user:', userId);
      
      const initOfflineData = async () => {
        try {
          await offlineStorage.init();
          // Don't automatically download all data - let it load on demand
          setIsInitialized(true);
          console.log('✅ Offline data initialized');
        } catch (error) {
          console.error('❌ Failed to initialize offline data:', error);
        }
      };
      
      initOfflineData();
    }
  }, [isAuthenticated, userId, isOnline]);

  return { isInitialized };
}