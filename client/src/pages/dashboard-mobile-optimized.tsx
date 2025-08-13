import { useQuery } from "@tanstack/react-query";
import { toBengaliNumber, formatCurrency, getBengaliDate } from "@/lib/bengali-utils";
import { Link } from "wouter";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, 
  Wallet, AlertCircle, Plus, Bell, Eye,
  ArrowUpRight, Package, MessageCircle,
  BarChart3, Settings, Clock, Target,
  ChevronRight, Activity, RefreshCw, FileText,
  PenTool, Receipt, DollarSign
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardMobileOptimized() {
  const [timeOfDay, setTimeOfDay] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('সুপ্রভাত');
    else if (hour < 17) setTimeOfDay('শুভ দুপুর');
    else setTimeOfDay('শুভ সন্ধ্যা');
  }, []);

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard', CURRENT_USER_ID],
    queryFn: () => supabaseService.getStats(CURRENT_USER_ID),
    staleTime: 0,
    gcTime: 0,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: recentSales = [] } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID, 'recent'],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID, 2),
    staleTime: 0,
    gcTime: 0,
  });

  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['products', CURRENT_USER_ID, 'low-stock'],
    queryFn: () => supabaseService.getLowStockProducts(CURRENT_USER_ID),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
    staleTime: 0,
    gcTime: 0,
  });



  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white bengali-font">
              ডেটা লোড করতে সমস্যা হয়েছে
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 bengali-font">
              ইন্টারনেট সংযোগ এবং ডেটাবেস সংযোগ পরীক্ষা করুন
            </p>
          </div>
          <Button 
            onClick={() => refetchStats()} 
            className="bg-emerald-600 hover:bg-emerald-700"
            data-testid="button-retry-stats"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            পুনরায় চেষ্টা করুন
          </Button>
        </div>
      </div>
    );
  }

  const salesGrowth = stats?.todaySales && stats.todaySales > 0 ? 12.5 : 0;
  const profitMargin = stats?.totalSales && stats.totalSales > 0 && stats.profit ? (stats.profit / stats.totalSales) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      
      {/* Compact Header - Reduced Height */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-8 w-8 ring-2 ring-emerald-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                    দহ
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  {timeOfDay}!
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{getBengaliDate()}</span>
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => refetchStats()}
                data-testid="button-refresh-dashboard"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                <Bell className="w-4 h-4" />
                {lowStockProducts.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 text-white">
                    {lowStockProducts.length}
                  </Badge>
                )}
              </Button>
              <Link to="/reports">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container - Optimized Spacing */}
      <div className="px-4 py-4 space-y-4">
        
        {/* Compact KPI Grid - Only 2 Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 relative overflow-hidden">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-emerald-100 bengali-font">আজকের বিক্রয়</p>
                <TrendingUp className="w-4 h-4 text-emerald-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {formatCurrency(stats?.todaySales || 0)}
              </p>
              <div className="flex items-center space-x-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-200" />
                <span className="text-emerald-200 text-xs">
                  +{toBengaliNumber(salesGrowth)}%
                </span>
              </div>
            </div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full"></div>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-100 bengali-font">বাকি আদায়</p>
                <Wallet className="w-4 h-4 text-blue-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {formatCurrency(stats?.pendingCollection || 0)}
              </p>
              <p className="text-blue-200 text-xs">
                {toBengaliNumber(stats?.totalCustomers || 0)} গ্রাহক
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Actions - 4x4 Grid Layout */}
        <Card className="border-0 shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">ব্যবহার করুন</h3>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          
          {/* First Row - 4 buttons */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <Link to="/sales/new" data-testid="link-sales-new">
              <Button size="sm" className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white flex flex-col space-y-1 p-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-xs bengali-font">বিক্রয় করুন</span>
              </Button>
            </Link>
            
            <Link to="/customers/new" data-testid="link-customer-new">
              <Button size="sm" variant="outline" className="w-full h-16 flex flex-col space-y-1 p-2 border-blue-200 hover:bg-blue-50">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-xs bengali-font">নতুন গ্রাহক</span>
              </Button>
            </Link>
            
            <Link to="/collection" data-testid="link-collection">
              <Button size="sm" variant="outline" className="w-full h-16 flex flex-col space-y-1 p-2 border-purple-200 hover:bg-purple-50">
                <Wallet className="w-5 h-5 text-purple-600" />
                <span className="text-xs bengali-font">আদায় করুন</span>
              </Button>
            </Link>
            
            <Link to="/inventory" data-testid="link-inventory">
              <Button size="sm" variant="outline" className="w-full h-16 flex flex-col space-y-1 p-2 border-orange-200 hover:bg-orange-50">
                <Package className="w-5 h-5 text-orange-600" />
                <span className="text-xs bengali-font">স্টক দেখুন</span>
              </Button>
            </Link>
          </div>
          
          {/* Second Row - 4 buttons */}
          <div className="grid grid-cols-4 gap-3">
            <Link to="/expenses/new" data-testid="link-expense-new">
              <Button size="sm" variant="outline" className="w-full h-16 flex flex-col space-y-1 p-2 border-red-200 hover:bg-red-50">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-xs bengali-font">খরচ লিখুন</span>
              </Button>
            </Link>
            
            <Link to="/transactions" data-testid="link-transactions">
              <Button size="sm" variant="outline" className="w-full h-16 flex flex-col space-y-1 p-2 border-indigo-200 hover:bg-indigo-50">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <span className="text-xs bengali-font">দেনা পাওনা</span>
              </Button>
            </Link>
            
            <Button size="sm" variant="outline" className="w-full h-16 flex flex-col space-y-1 p-2 border-gray-200 hover:bg-gray-50" data-testid="button-draft">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-xs bengali-font">খসড়া করুন</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-16 flex flex-col space-y-1 p-2 border-green-200 hover:bg-green-50"
              onClick={() => toast({ title: "WhatsApp রিপোর্ট", description: "রিপোর্ট পাঠানো হচ্ছে..." })}
              data-testid="button-send-message"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="text-xs bengali-font">মেসেজ পাঠান</span>
            </Button>
          </div>
        </Card>



        {/* Recent Activity - Always Expanded with Tabs */}
        <Card className="border-0 shadow-md p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
              সাম্প্রতিক কার্যকলাপ
            </h3>
          </div>
          
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="transactions" className="text-xs bengali-font" data-testid="tab-transactions">
                সাম্প্রতিক লেনদেন
              </TabsTrigger>
              <TabsTrigger value="customers" className="text-xs bengali-font" data-testid="tab-customers">
                গ্রাহক তালিকা
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions" className="space-y-2">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white bengali-font">
                          {sale.customer_name}
                        </p>
                        <p className="text-xs text-slate-500">{sale.payment_method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600 number-font">
                        +{formatCurrency(Number(sale.total_amount))}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(sale.created_at).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 bengali-font">আজকে কোনো বিক্রয় নেই</p>
                </div>
              )}
              <Link to="/transactions">
                <Button variant="ghost" size="sm" className="w-full text-xs mt-3" data-testid="button-view-all-transactions">
                  সব লেনদেন দেখুন
                </Button>
              </Link>
            </TabsContent>
            
            <TabsContent value="customers" className="space-y-2">
              {customers.length > 0 ? (
                customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white bengali-font">
                          {customer.name}
                        </p>
                        <p className="text-xs text-slate-500">{customer.phone_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold number-font ${customer.total_credit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {customer.total_credit > 0 ? `+${formatCurrency(customer.total_credit)}` : '০'}
                      </p>
                      <p className="text-xs text-slate-400 bengali-font">
                        {customer.total_credit > 0 ? 'ক্রেডিট' : 'পেইড'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 bengali-font">কোনো গ্রাহক নেই</p>
                </div>
              )}
              <Link to="/customers">
                <Button variant="ghost" size="sm" className="w-full text-xs mt-3" data-testid="button-view-all-customers">
                  সব গ্রাহক দেখুন
                </Button>
              </Link>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Professional bottom spacing for navigation */}
      <div className="h-24"></div>
    </div>
  );
}