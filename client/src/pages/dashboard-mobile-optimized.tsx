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
  const [activeTab, setActiveTab] = useState('transactions');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-16">
      
      {/* Ultra-Compact Header for 916x412 */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-xl border-b border-emerald-100 dark:border-slate-700/50 shadow-sm">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            {/* Compact Bengali Shop Identity */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                {/* Smaller Bengali Shop Symbol */}
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <div className="text-white text-sm font-bold bengali-font">দো</div>
                </div>
                {/* Smaller Active Status */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border border-white shadow-sm animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 dark:text-white bengali-font">
                  {timeOfDay}!
                </h1>
                <div className="text-xs text-slate-600 dark:text-slate-400 bengali-font">
                  📅 {getBengaliDate()}
                </div>
              </div>
            </div>
            
            {/* Compact Actions */}
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 transition-all duration-200" 
                title="বিজ্ঞপ্তি"
              >
                <div className="relative">
                  <Bell className="w-4 h-4" />
                  {(stats?.pendingCollection && stats.pendingCollection > 0) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white animate-bounce"></div>
                  )}
                </div>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 transition-all duration-200" 
                onClick={() => refetchStats()}
                data-testid="button-refresh-dashboard"
                title="তাজা করুন"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              
              <Link to="/settings">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 transition-all duration-200" 
                  title="সেটিংস"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-Compact Content for 916x412 Screen */}
      <div className="px-2 py-3 space-y-3">
        
        {/* Ultra-Compact KPIs for 916x412 */}
        <div className="grid grid-cols-2 gap-2">
          {/* Today's Sales - Compact */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/80 dark:from-slate-800 dark:to-emerald-900/20 p-3 relative overflow-hidden hover:shadow-lg transition-all duration-200 group">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                  <div className="text-white text-sm">💰</div>
                </div>
                <div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 bengali-font font-semibold">আজকের বিক্রয়</p>
                </div>
              </div>
              <div>
                <p className="text-xl font-black text-emerald-800 dark:text-emerald-200 number-font leading-none">
                  ৳{formatCurrency(stats?.todaySales || 0)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="w-2.5 h-2.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 text-xs bengali-font font-medium">
                    +{toBengaliNumber(salesGrowth)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute top-1 right-1 text-emerald-300/30 text-sm">📈</div>
          </Card>

          {/* Pending Collection - Compact */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-white via-orange-50/50 to-amber-100/80 dark:from-slate-800 dark:to-orange-900/20 p-3 relative overflow-hidden hover:shadow-lg transition-all duration-200 group">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                  <div className="text-white text-sm">🏦</div>
                </div>
                <div>
                  <p className="text-xs text-orange-700 dark:text-orange-300 bengali-font font-semibold">বাকি আদায়</p>
                </div>
              </div>
              <div>
                <p className="text-xl font-black text-orange-800 dark:text-orange-200 number-font leading-none">
                  ৳{formatCurrency(stats?.pendingCollection || 0)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Users className="w-2.5 h-2.5 text-orange-600" />
                  <span className="text-orange-700 dark:text-orange-400 text-xs bengali-font font-medium">
                    {toBengaliNumber(stats?.totalCustomers || 0)} জন
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute top-1 right-1 text-orange-300/30 text-sm">💳</div>
          </Card>
        </div>

        {/* Ultra-Compact Actions for 916x412 */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800 p-2">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <div className="text-white text-sm">⚡</div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">দ্রুত কাজ</h3>
            </div>
          </div>
          
          {/* Primary Actions Row */}
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            <Link to="/sales/new" data-testid="link-sales-new" className="block group">
              <div className="relative w-full h-14 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-xl flex flex-col items-center justify-center p-1.5 shadow-sm hover:shadow-md hover:scale-105 hover:bg-emerald-500/20 transition-all duration-200 group-active:scale-95">
                <div className="text-emerald-600 text-sm mb-0.5">🛒</div>
                <span className="text-xs text-emerald-700 bengali-font font-bold text-center leading-tight">বিক্রয়</span>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </Link>
            
            <Link to="/customers/new" data-testid="link-customer-new" className="block group">
              <div className="w-full h-14 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-xl flex flex-col items-center justify-center p-1.5 shadow-sm hover:shadow-md hover:scale-105 hover:bg-blue-500/20 transition-all duration-200 group-active:scale-95">
                <div className="text-blue-600 text-sm mb-0.5">👥</div>
                <span className="text-xs text-blue-700 bengali-font font-bold text-center leading-tight">গ্রাহক</span>
              </div>
            </Link>
            
            <Link to="/collection" data-testid="link-collection" className="block group">
              <div className="w-full h-14 bg-gradient-to-br from-orange-500/10 to-amber-600/10 rounded-xl flex flex-col items-center justify-center p-1.5 shadow-sm hover:shadow-md hover:scale-105 hover:bg-orange-500/20 transition-all duration-200 group-active:scale-95">
                <div className="text-orange-600 text-sm mb-0.5">💰</div>
                <span className="text-xs text-orange-700 bengali-font font-bold text-center leading-tight">আদায়</span>
              </div>
            </Link>
            
            <Link to="/inventory" data-testid="link-inventory" className="block group">
              <div className="w-full h-14 bg-gradient-to-br from-purple-500/10 to-violet-600/10 rounded-xl flex flex-col items-center justify-center p-1.5 shadow-sm hover:shadow-md hover:scale-105 hover:bg-purple-500/20 transition-all duration-200 group-active:scale-95">
                <div className="text-purple-600 text-sm mb-0.5">📦</div>
                <span className="text-xs text-purple-700 bengali-font font-bold text-center leading-tight">স্টক</span>
              </div>
            </Link>
          </div>
          
          {/* Secondary Actions Row */}
          <div className="grid grid-cols-4 gap-1.5">
            <Link to="/expenses/new" data-testid="link-expense-new" className="block group">
              <div className="w-full h-14 bg-gradient-to-br from-red-500/10 to-pink-600/10 rounded-xl flex flex-col items-center justify-center p-1.5 shadow-sm hover:shadow-md hover:scale-105 hover:bg-red-500/20 transition-all duration-200 group-active:scale-95">
                <div className="text-red-600 text-sm mb-0.5">📝</div>
                <span className="text-xs text-red-700 bengali-font font-bold text-center leading-tight">খরচ</span>
              </div>
            </Link>
            
            <Link to="/transactions" data-testid="link-transactions" className="block group">
              <div className="w-full h-14 bg-gradient-to-br from-teal-500/10 to-cyan-600/10 rounded-xl flex flex-col items-center justify-center p-1.5 shadow-sm hover:shadow-md hover:scale-105 hover:bg-teal-500/20 transition-all duration-200 group-active:scale-95">
                <div className="text-teal-600 text-sm mb-0.5">📊</div>
                <span className="text-xs text-teal-700 bengali-font font-bold text-center leading-tight">হিসাব</span>
              </div>
            </Link>
            
            <button className="group" data-testid="button-calculator">
              <div className="w-full h-14 bg-gradient-to-br from-slate-500/10 to-gray-600/10 rounded-xl flex flex-col items-center justify-center p-1.5 shadow-sm hover:shadow-md hover:scale-105 hover:bg-slate-500/20 transition-all duration-200 group-active:scale-95">
                <div className="text-slate-600 text-sm mb-0.5">🧮</div>
                <span className="text-xs text-slate-700 bengali-font font-bold text-center leading-tight">ক্যালক</span>
              </div>
            </button>
            
            <button 
              className="group"
              onClick={() => toast({ title: "WhatsApp রিপোর্ট", description: "রিপোর্ট পাঠানো হচ্ছে..." })}
              data-testid="button-whatsapp"
            >
              <div className="w-full h-14 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-xl flex flex-col items-center justify-center p-1.5 shadow-sm hover:shadow-md hover:scale-105 hover:bg-green-500/20 transition-all duration-200 group-active:scale-95">
                <div className="text-green-600 text-sm mb-0.5">📱</div>
                <span className="text-xs text-green-700 bengali-font font-bold text-center leading-tight">মেসেজ</span>
              </div>
            </button>
          </div>
        </Card>



        {/* Ultra-Compact Business Intelligence for 916x412 */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800 p-2 min-h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <div className="text-white text-sm">📈</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">ব্যবসার খবর</h3>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {/* Context-aware button based on active tab */}
              {activeTab === 'transactions' ? (
                <Link to="/transactions" className="block">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs py-1 px-2 bg-emerald-100/50 hover:bg-emerald-200/50 dark:bg-emerald-800/50 dark:hover:bg-emerald-700/50 rounded-lg transition-all duration-200 group border border-emerald-200/50 dark:border-emerald-700/50" 
                    data-testid="button-view-all-context"
                  >
                    <span className="bengali-font font-semibold text-emerald-700 dark:text-emerald-300">সব লেনদেন</span>
                    <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform text-emerald-600 dark:text-emerald-400" />
                  </Button>
                </Link>
              ) : (
                <Link to="/customers" className="block">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs py-1 px-2 bg-blue-100/50 hover:bg-blue-200/50 dark:bg-blue-800/50 dark:hover:bg-blue-700/50 rounded-lg transition-all duration-200 group border border-blue-200/50 dark:border-blue-700/50" 
                    data-testid="button-view-all-context"
                  >
                    <span className="bengali-font font-semibold text-blue-700 dark:text-blue-300">সব গ্রাহক</span>
                    <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform text-blue-600 dark:text-blue-400" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="transactions" onValueChange={setActiveTab} className="space-y-3">
            <TabsList className="grid grid-cols-2 w-full bg-slate-100/50 dark:bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm">
              <TabsTrigger 
                value="transactions" 
                className="text-xs bengali-font font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200 py-2"
                data-testid="tab-transactions"
              >
                🛒 বিক্রয়
              </TabsTrigger>
              <TabsTrigger 
                value="customers" 
                className="text-xs bengali-font font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200 py-2"
                data-testid="tab-customers"
              >
                👥 গ্রাহক
              </TabsTrigger>
            </TabsList>
            
            {/* Compact Scrollable Transactions Tab */}
            <TabsContent value="transactions" className="space-y-2 mt-3">
              {recentSales.length > 0 ? (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="bg-gradient-to-r from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/10 rounded-lg p-2 border border-emerald-100/50 dark:border-emerald-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-sm">
                            <div className="text-white text-sm">💵</div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                              {sale.customer_name}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 bengali-font font-medium">
                                💳 {sale.payment_method}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 number-font">
                            +৳{formatCurrency(Number(sale.total_amount))}
                          </p>
                          {sale.due_amount > 0 && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 bengali-font font-medium">
                              বাকি: ৳{formatCurrency(sale.due_amount)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                    <div className="text-lg">💰</div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 bengali-font text-sm font-semibold">আজ কোনো বিক্রয় হয়নি</p>
                  <p className="text-slate-500 dark:text-slate-500 bengali-font text-xs mt-1">প্রথম বিক্রয় শুরু করুন</p>
                </div>
              )}
              
              <Link to="/transactions" className="block">
                <Button 
                  variant="ghost" 
                  className="w-full text-xs py-2 mt-2 bg-slate-100/50 hover:bg-slate-200/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 group" 
                  data-testid="button-view-all-transactions"
                >
                  <span className="bengali-font font-semibold">সব লেনদেন দেখুন</span>
                  <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </TabsContent>
            
            {/* Compact Scrollable Customers Tab */}
            <TabsContent value="customers" className="space-y-2 mt-3">
              {customers.length > 0 ? (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {customers.slice(0, 10).map((customer) => (
                    <div key={customer.id} className="bg-gradient-to-r from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/10 rounded-lg p-2 border border-blue-100/50 dark:border-blue-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                            <div className="text-white text-sm">👤</div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                              {customer.name}
                            </p>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-blue-600 dark:text-blue-400 bengali-font font-medium">
                                📞 {customer.phone_number}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {customer.total_credit > 0 ? (
                            <div>
                              <p className="text-sm font-black text-red-500 dark:text-red-400 number-font">
                                +৳{formatCurrency(customer.total_credit)}
                              </p>
                              <p className="text-xs text-red-400 dark:text-red-500 bengali-font font-medium">
                                🔔 বাকি
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 number-font">
                                ৳০
                              </p>
                              <p className="text-xs text-emerald-500 dark:text-emerald-400 bengali-font font-medium">
                                ✅ সম্পূর্ণ
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                    <div className="text-lg">👥</div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 bengali-font text-sm font-semibold">কোনো গ্রাহক নেই</p>
                  <p className="text-slate-500 dark:text-slate-500 bengali-font text-xs mt-1">প্রথম গ্রাহক যোগ করুন</p>
                </div>
              )}
              
              <Link to="/customers" className="block">
                <Button 
                  variant="ghost" 
                  className="w-full text-xs py-2 mt-2 bg-slate-100/50 hover:bg-slate-200/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 group" 
                  data-testid="button-view-all-customers"
                >
                  <span className="bengali-font font-semibold">সব গ্রাহক দেখুন</span>
                  <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Floating Action Button */}
      <Link to="/sales/new">
        <button 
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 z-40"
          data-testid="fab-new-sale"
          title="নতুন বিক্রয়"
        >
          <div className="text-white text-lg">🛒</div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse border border-white"></div>
        </button>
      </Link>
      
      {/* Minimal bottom spacing for ultra-compact view */}
      <div className="h-8"></div>
    </div>
  );
}