import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HybridAuthGuard from "@/components/auth/hybrid-auth-guard";

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
import CustomerEditMobileOptimized from "@/pages/customer-edit-mobile-optimized";
import TransactionDetailsMobileOptimized from "@/pages/transaction-details-mobile-optimized";
import CollectionMobileOptimized from "@/pages/collection-mobile-optimized";
import ExpenseEntryMobileOptimized from "@/pages/expense-entry-mobile-optimized";
import InventoryMobileOptimizedFixed from "@/pages/inventory-mobile-optimized-fixed";
import AnalyticsMobileOptimized from "@/pages/analytics-mobile-optimized";
import NotificationsMobileOptimized from "@/pages/notifications-mobile-optimized";
import SalesEntryPureOffline from "@/pages/sales-entry-pure-offline";
import CustomersMobileOptimizedOffline from "@/pages/customers-mobile-optimized-offline";
import CustomerAddMobileOptimizedOffline from "@/pages/customer-add-mobile-optimized-offline";
import BottomNavigationOptimized from "@/components/ui/bottom-navigation-optimized";
import CommunicationPanel from "@/components/ui/communication-panel";
import FloatingActionMenu from "@/components/ui/floating-action-menu";


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// Removed seed data import - using only live Supabase data
import { supabase } from "./lib/supabase";
import { initializeAndroidOptimizations } from "./lib/android-optimizations";
import { useOfflineInit } from "./hooks/use-offline-data";
import OfflineStatus from "./components/ui/offline-status";


function Router() {
  const [showCommunicationPanel, setShowCommunicationPanel] = useState(false);
  const [location] = useLocation();
  
  // Initialize offline functionality
  const { isInitialized } = useOfflineInit();
  
  // Hide bottom navigation on specific pages
  const hideBottomNav = location === "/sales/new" || location === "/customers/new" || location === "/expenses/new" || location.includes("/edit");

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden w-full">
      {/* Main Content */}
      <div>
        <Switch>
        <Route path="/" component={DashboardMobileOptimized} />
        <Route path="/dashboard" component={DashboardMobileOptimized} />
        <Route path="/transactions" component={TransactionsMobileOptimized} />
        <Route path="/customers" component={CustomersMobileOptimized} />
        <Route path="/reports" component={ReportsMobileOptimized} />
        <Route path="/settings" component={SettingsMobileOptimized} />
        <Route path="/sales/new" component={SalesEntryBottomSheet} />
        <Route path="/customers/new" component={CustomerAddMobileOptimized} />
        <Route path="/customers/:id/edit">
          {(params) => <CustomerEditMobileOptimized customerId={params.id} />}
        </Route>
        <Route path="/transactions/:type/:id">
          {(params) => <TransactionDetailsMobileOptimized type={params.type} id={params.id} />}
        </Route>
        <Route path="/customers/:id" component={CustomerDetailsMobileOptimized} />
        <Route path="/inventory" component={InventoryMobileOptimizedFixed} />
        <Route path="/collection" component={CollectionMobileOptimized} />
        <Route path="/expenses/new" component={ExpenseEntryMobileOptimized} />
        <Route path="/analytics" component={AnalyticsMobileOptimized} />
        <Route path="/notifications" component={NotificationsMobileOptimized} />


          <Route component={NotFoundMobileOptimized} />
        </Switch>

        {/* Bottom Navigation - hidden on certain pages */}
        {!hideBottomNav && <BottomNavigationOptimized />}

        {/* Floating Action Menu */}
        <FloatingActionMenu />

        {/* Communication Panel */}
        {showCommunicationPanel && (
          <CommunicationPanel />
        )}
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    console.log('App initialized with Supabase database connection');
    
    // Initialize Android APK optimizations
    initializeAndroidOptimizations();
    
    // Test database connection (will only work after authentication)
    const testConnection = async () => {
      try {
        const { count, error } = await supabase.from('customers').select('count', { count: 'exact', head: true });
        if (!error) {
          console.log('✅ Database connection verified');
        }
      } catch (error) {
        console.log('🔄 Database connection will be available after authentication');
      }
    };
    
    testConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HybridAuthGuard>
          <Router />
        </HybridAuthGuard>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
