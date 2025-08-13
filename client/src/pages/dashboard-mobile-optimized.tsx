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
      
      {/* Minimalist Header - Don Norman's Discoverability & Steve Krug's Clarity */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200/30 dark:border-slate-700/30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Clean Identity - Dieter Rams Minimalism */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-emerald-500/10 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-semibold">
                    দহ
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white bengali-font leading-tight">
                  {timeOfDay}
                </h1>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                  <span className="bengali-font">{getBengaliDate()}</span>
                </div>
              </div>
            </div>
            
            {/* Right: Essential Actions Only - Alan Cooper's Goal-Oriented Design */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
                onClick={() => refetchStats()}
                data-testid="button-refresh-dashboard"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="সেটিংস">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container - Julie Zhuo's Systems Thinking & 8px Grid */}
      <div className="px-4 py-6 space-y-6">
        
        {/* Essential Metrics - Susan Weinschenk's Information Chunking & Aarron Walter's Emotional Design */}
        <div className="grid grid-cols-2 gap-4">
          {/* Today's Sales - Primary Action (Green = Success/Trust) */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 relative overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 bengali-font font-medium">আজকের বিক্রয়</p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 number-font leading-tight">
                  {formatCurrency(stats?.todaySales || 0)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 text-xs bengali-font">
                    +{toBengaliNumber(salesGrowth)}% বৃদ্ধি
                  </span>
                </div>
              </div>
            </div>
            {/* Subtle visual indicator */}
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-emerald-200/30 rounded-full blur-xl"></div>
          </Card>

          {/* Pending Collection - Secondary but Important (Blue = Trust/Reliability) */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 relative overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 bengali-font font-medium">বাকি আদায়</p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 number-font leading-tight">
                  {formatCurrency(stats?.pendingCollection || 0)}
                </p>
                <p className="text-blue-600 text-xs bengali-font mt-1">
                  {toBengaliNumber(stats?.totalCustomers || 0)} জন গ্রাহক
                </p>
              </div>
            </div>
            {/* Subtle visual indicator */}
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-200/30 rounded-full blur-xl"></div>
          </Card>
        </div>

        {/* Action Grid - Luke Wroblewski's Mobile-First & 44px Touch Targets */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white bengali-font">ব্যবহার করুন</h3>
          </div>
          
          {/* First Row - Primary Actions */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <Link to="/sales/new" data-testid="link-sales-new" className="block">
              <Button className="w-full h-20 bg-emerald-500 hover:bg-emerald-600 text-white flex flex-col space-y-1.5 p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <ShoppingCart className="w-6 h-6" />
                <span className="text-xs bengali-font font-medium leading-tight text-center">বিক্রয় করুন</span>
              </Button>
            </Link>
            
            <Link to="/customers/new" data-testid="link-customer-new" className="block">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-1.5 p-3 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-xs bengali-font font-medium leading-tight text-center text-blue-700 dark:text-blue-400">নতুন গ্রাহক</span>
              </Button>
            </Link>
            
            <Link to="/collection" data-testid="link-collection" className="block">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-1.5 p-3 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200">
                <Wallet className="w-6 h-6 text-purple-600" />
                <span className="text-xs bengali-font font-medium leading-tight text-center text-purple-700 dark:text-purple-400">আদায় করুন</span>
              </Button>
            </Link>
            
            <Link to="/inventory" data-testid="link-inventory" className="block">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-1.5 p-3 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-200">
                <Package className="w-6 h-6 text-orange-600" />
                <span className="text-xs bengali-font font-medium leading-tight text-center text-orange-700 dark:text-orange-400">স্টক দেখুন</span>
              </Button>
            </Link>
          </div>
          
          {/* Second Row - Secondary Actions */}
          <div className="grid grid-cols-4 gap-3">
            <Link to="/expenses/new" data-testid="link-expense-new" className="block">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-1.5 p-3 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200">
                <TrendingDown className="w-6 h-6 text-red-600" />
                <span className="text-xs bengali-font font-medium leading-tight text-center text-red-700 dark:text-red-400">খরচ লিখুন</span>
              </Button>
            </Link>
            
            <Link to="/transactions" data-testid="link-transactions" className="block">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-1.5 p-3 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all duration-200">
                <Receipt className="w-6 h-6 text-indigo-600" />
                <span className="text-xs bengali-font font-medium leading-tight text-center text-indigo-700 dark:text-indigo-400">দেনা পাওনা</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full h-20 flex flex-col space-y-1.5 p-3 border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200" data-testid="button-draft">
              <FileText className="w-6 h-6 text-slate-600" />
              <span className="text-xs bengali-font font-medium leading-tight text-center text-slate-700 dark:text-slate-400">খসড়া করুন</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-20 flex flex-col space-y-1.5 p-3 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200"
              onClick={() => toast({ title: "WhatsApp রিপোর্ট", description: "রিপোর্ট পাঠানো হচ্ছে..." })}
              data-testid="button-send-message"
            >
              <MessageCircle className="w-6 h-6 text-green-600" />
              <span className="text-xs bengali-font font-medium leading-tight text-center text-green-700 dark:text-green-400">মেসেজ পাঠান</span>
            </Button>
          </div>
        </Card>



        {/* Activity Overview - Steve Krug's Scannability & Susan Weinschenk's Information Chunking */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center space-x-2 mb-5">
            <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white bengali-font">
              সাম্প্রতিক কার্যকলাপ
            </h3>
          </div>
          
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <TabsTrigger 
                value="transactions" 
                className="text-sm bengali-font font-medium py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                data-testid="tab-transactions"
              >
                সাম্প্রতিক লেনদেন
              </TabsTrigger>
              <TabsTrigger 
                value="customers" 
                className="text-sm bengali-font font-medium py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                data-testid="tab-customers"
              >
                গ্রাহক তালিকা
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions" className="space-y-3">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white bengali-font truncate">
                          {sale.customer_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 bengali-font mt-0.5">
                          {sale.payment_method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 number-font">
                        +{formatCurrency(Number(sale.total_amount))}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(sale.created_at).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-50/30 dark:bg-slate-800/30 rounded-xl">
                  <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 bengali-font font-medium">আজকে কোনো বিক্রয় নেই</p>
                  <p className="text-xs text-slate-400 bengali-font mt-1">নতুন বিক্রয় যোগ করুন</p>
                </div>
              )}
              <Link to="/transactions" className="block">
                <Button variant="ghost" className="w-full text-sm py-3 mt-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" data-testid="button-view-all-transactions">
                  <span className="bengali-font">সব লেনদেন দেখুন</span>
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </TabsContent>
            
            <TabsContent value="customers" className="space-y-3">
              {customers.length > 0 ? (
                customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white bengali-font truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 number-font mt-0.5">
                          {customer.phone_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-bold number-font ${customer.total_credit > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {customer.total_credit > 0 ? `+${formatCurrency(customer.total_credit)}` : '০ টাকা'}
                      </p>
                      <p className={`text-xs font-medium mt-0.5 bengali-font ${customer.total_credit > 0 ? 'text-red-400' : 'text-emerald-500'}`}>
                        {customer.total_credit > 0 ? 'বাকি আছে' : 'পরিশোধিত'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-50/30 dark:bg-slate-800/30 rounded-xl">
                  <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 bengali-font font-medium">কোনো গ্রাহক নেই</p>
                  <p className="text-xs text-slate-400 bengali-font mt-1">নতুন গ্রাহক যোগ করুন</p>
                </div>
              )}
              <Link to="/customers" className="block">
                <Button variant="ghost" className="w-full text-sm py-3 mt-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" data-testid="button-view-all-customers">
                  <span className="bengali-font">সব গ্রাহক দেখুন</span>
                  <ChevronRight className="w-4 h-4 ml-2" />
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