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
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  useEffect(() => {
    const seedDatabase = async () => {
      try {
        console.log('Seeding database with sample data...');
        
        // Check if data already exists
        const { data: existingCustomers } = await supabase
          .from('customers')
          .select('id')
          .limit(1);
        
        if (existingCustomers && existingCustomers.length > 0) {
          console.log('Sample data already exists');
          return;
        }
        
        // Insert seed data
        await Promise.allSettled([
          supabase.from('customers').insert(seedCustomers),
          supabase.from('products').insert(seedProducts),
          supabase.from('sales').insert(seedSales),
          supabase.from('expenses').insert(seedExpenses)
        ]);
        
        console.log('Database seeded successfully!');
      } catch (error) {
        console.error('Error seeding database:', error);
      }
    };
    
    seedDatabase();
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
