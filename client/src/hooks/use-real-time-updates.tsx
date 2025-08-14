/**
 * Real-time Updates Hook
 * Ensures instant reflection across all pages for sales, expenses, customers, collections
 */

import { useQueryClient } from '@tanstack/react-query';
import { hybridAuth } from '@/lib/hybrid-auth';
import { useEffect } from 'react';

export function useRealTimeUpdates() {
  const queryClient = useQueryClient();
  const user = hybridAuth.getCurrentUser();

  const refreshAllData = () => {
    if (!user?.user_id) return;
    
    console.log('🔄 REAL-TIME: Refreshing all data for instant updates');
    
    // Force refetch all critical queries
    queryClient.invalidateQueries({ queryKey: ['stats', user.user_id] });
    queryClient.invalidateQueries({ queryKey: ['sales', user.user_id] });
    queryClient.invalidateQueries({ queryKey: ['customers', user.user_id] });
    queryClient.invalidateQueries({ queryKey: ['expenses', user.user_id] });
    queryClient.invalidateQueries({ queryKey: ['collections', user.user_id] });
    
    // Force immediate refetch for dashboard
    queryClient.refetchQueries({ queryKey: ['stats', user.user_id] });
  };

  const triggerOptimisticUpdate = (type: string, data: any) => {
    if (!user?.user_id) return;

    console.log(`🚀 OPTIMISTIC: ${type} update triggered`, data);

    // Immediately update all related queries for instant UI response
    switch (type) {
      case 'sale':
        // Update sales list optimistically
        queryClient.setQueryData(['sales', user.user_id, 'hybrid'], (old: any) => {
          const newSale = {
            ...data,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
          };
          return old ? [newSale, ...old] : [newSale];
        });
        
        // Update stats optimistically
        queryClient.setQueryData(['stats', user.user_id, 'hybrid'], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            totalSales: (old.totalSales || 0) + (data.total_amount || 0),
            salesCount: (old.salesCount || 0) + 1,
            todaySales: (old.todaySales || 0) + (data.total_amount || 0),
            profit: (old.profit || 0) + ((data.total_amount || 0) - (data.cost || 0)),
          };
        });
        break;

      case 'customer':
        // Update customers list optimistically
        queryClient.setQueryData(['customers', user.user_id, 'hybrid'], (old: any) => {
          const newCustomer = {
            ...data,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            total_credit: 0,
          };
          return old ? [newCustomer, ...old] : [newCustomer];
        });
        
        // Update stats optimistically
        queryClient.setQueryData(['stats', user.user_id, 'hybrid'], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            totalCustomers: (old.totalCustomers || 0) + 1,
          };
        });
        break;

      case 'expense':
        // Update expenses list optimistically
        queryClient.setQueryData(['expenses', user.user_id, 'hybrid'], (old: any) => {
          const newExpense = {
            ...data,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
          };
          return old ? [newExpense, ...old] : [newExpense];
        });
        
        // Update stats optimistically
        queryClient.setQueryData(['stats', user.user_id, 'hybrid'], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            totalExpenses: (old.totalExpenses || 0) + (data.amount || 0),
            profit: (old.profit || 0) - (data.amount || 0),
          };
        });
        break;
    }

    // Schedule a full refresh after optimistic update
    setTimeout(() => refreshAllData(), 100);
  };

  useEffect(() => {
    // Set up periodic refresh for real-time updates
    const interval = setInterval(() => {
      refreshAllData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user?.user_id]);

  return {
    refreshAllData,
    triggerOptimisticUpdate,
  };
}