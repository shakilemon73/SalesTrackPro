import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFoundMobileOptimized from "@/pages/not-found-mobile-optimized";
import DashboardMobileOptimized from "@/pages/dashboard-mobile-optimized";
import TransactionsMobileOptimized from "@/pages/transactions-mobile-optimized";
import CustomersMobileOptimized from "@/pages/customers-mobile-optimized";
import ReportsMobileOptimized from "@/pages/reports-mobile-optimized";
import SettingsMobileOptimized from "@/pages/settings-mobile-optimized";
import SalesEntryMobileOptimized from "@/pages/sales-entry-mobile-optimized";
import SalesEntrySplitScreen from "@/pages/sales-entry-split-screen";
import SalesEntryBottomSheet from "@/pages/sales-entry-bottom-sheet";
import CustomerAddMobileOptimized from "@/pages/customer-add-mobile-optimized";
import CustomerDetailsMobileOptimized from "@/pages/customer-details-mobile-optimized";
import CollectionMobileOptimized from "@/pages/collection-mobile-optimized";
import ExpenseEntryMobileOptimized from "@/pages/expense-entry-mobile-optimized";
import InventoryMobileOptimizedFixed from "@/pages/inventory-mobile-optimized-fixed";
import BottomNavigationOptimized from "@/components/ui/bottom-navigation-optimized";
import CommunicationPanel from "@/components/ui/communication-panel";
import FloatingActionMenuClean from "@/components/ui/floating-action-menu-clean";


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// Removed seed data import - using only live Supabase data
import { supabase } from "./lib/supabase";
import { initializeAndroidOptimizations } from "./lib/android-optimizations";


function Router() {
  const [showCommunicationPanel, setShowCommunicationPanel] = useState(false);
  const [location] = useLocation();
  
  // Hide bottom navigation on specific pages
  const hideBottomNav = location === "/sales/new" || location === "/customers/new" || location === "/expenses/new";

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden w-full">
      <Switch>
        <Route path="/" component={DashboardMobileOptimized} />
        <Route path="/transactions" component={TransactionsMobileOptimized} />
        <Route path="/customers" component={CustomersMobileOptimized} />
        <Route path="/reports" component={ReportsMobileOptimized} />
        <Route path="/settings" component={SettingsMobileOptimized} />
        <Route path="/sales/new" component={SalesEntryBottomSheet} />
        <Route path="/customers/new" component={CustomerAddMobileOptimized} />
        <Route path="/customers/:id" component={CustomerDetailsMobileOptimized} />
        <Route path="/inventory" component={InventoryMobileOptimizedFixed} />
        <Route path="/collection" component={CollectionMobileOptimized} />
        <Route path="/expenses/new" component={ExpenseEntryMobileOptimized} />


        <Route component={NotFoundMobileOptimized} />
      </Switch>
      {!hideBottomNav && <BottomNavigationOptimized />}
      {!hideBottomNav && <FloatingActionMenuClean />}
    </div>
  );
}

function App() {
  useEffect(() => {
    console.log('App initialized with Supabase database connection');
    
    // Initialize Android APK optimizations
    initializeAndroidOptimizations();
    
    // Check database connection
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', '11111111-1111-1111-1111-111111111111');
          
        if (error) {
          console.error('Database connection error:', error);
        } else {
          console.log('Database connected successfully. Total customers:', data?.length || 0);
          if (data && data.length > 0) {
            console.log('Sample customer:', data[0].name);
          }
          

        }
      } catch (error) {
        console.error('Database check failed:', error);
      }
    };
    
    checkConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
