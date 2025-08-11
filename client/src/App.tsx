import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Sales from "@/pages/sales";
import Customers from "@/pages/customers";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import SalesEntry from "@/pages/sales-entry";
import CustomerAdd from "@/pages/customer-add";
import Inventory from "@/pages/inventory";
import Collection from "@/pages/collection";
import ExpenseEntry from "@/pages/expense-entry";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { useEffect } from "react";
import { seedCustomers, seedProducts, seedSales, seedExpenses } from "./lib/seed-data";
import { supabase } from "./lib/supabase";

function Router() {
  return (
    <div className="mobile-container">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/sales" component={Sales} />
        <Route path="/customers" component={Customers} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route path="/sales/new" component={SalesEntry} />
        <Route path="/customers/new" component={CustomerAdd} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/collection" component={Collection} />
        <Route path="/expenses/new" component={ExpenseEntry} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  useEffect(() => {
    console.log('App initialized with Supabase database connection');
    
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
