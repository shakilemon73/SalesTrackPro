import { toBengaliNumber, formatCurrency, getBengaliDate } from "@/lib/bengali-utils";
import { Link } from "wouter";
import { hybridAuth } from "@/lib/hybrid-auth";
import { useHybridStats, useHybridSales, useHybridCustomers } from "@/hooks/use-hybrid-data";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardSkeleton } from "@/components/loading-skeletons";
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, 
  Wallet, AlertCircle, Plus, Bell, Eye,
  ArrowUpRight, Package, MessageCircle,
  BarChart3, Settings, Clock, Target,
  ChevronRight, Activity, RefreshCw, FileText,
  PenTool, Receipt, DollarSign, ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DashboardHeaderEnhanced from "@/components/ui/dashboard-header-enhanced";

export default function DashboardMobileOptimized() {
  const [timeOfDay, setTimeOfDay] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('transactions');
  const [selectedView, setSelectedView] = useState('sales');
  const { toast } = useToast();
  const user = hybridAuth.getCurrentUser();
  const { isOnline } = useNetworkStatus();
  const authLoading = false;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('সুপ্রভাত');
    else if (hour < 17) setTimeOfDay('শুভ দুপুর');
    else setTimeOfDay('শুভ সন্ধ্যা');
  }, []);

  const { data: stats, isLoading: statsLoading, error: statsError } = useHybridStats();
  const { data: recentSales = [] } = useHybridSales(2);
  const { data: customers = [] } = useHybridCustomers();



  // Show skeleton while auth or stats are loading
  if (authLoading || (!!user?.user_id && statsLoading)) {
    return <DashboardSkeleton />;
  }

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
            onClick={() => window.location.reload()} 
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

  const salesGrowth = stats?.totalSales && stats.totalSales > 0 ? 12.5 : 0;
  const profitMargin = stats?.totalSales && stats.totalSales > 0 && stats.profit ? (stats.profit / stats.totalSales) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-16">
      


      {/* Enhanced Header with Key Metrics */}
      <DashboardHeaderEnhanced
        timeOfDay={timeOfDay}
        stats={{
          todaySales: stats?.totalSales || 0,
          todayProfit: stats?.profit || 0,
          pendingCollection: stats?.pendingCollection || 0,
          salesCount: stats?.salesCount || 0
        }}
        isLoading={statsLoading}
        onRefresh={() => window.location.reload()}
      />

      {/* Mobile Framework Container */}
      <div className="container px-2 py-3">
        
        {/* Mobile Framework Grid - KPIs */}
        <div className="row mb-3">
          <div className="col-6">
            {/* Today's Sales - Using Mobile Framework */}
            <div className="card shadow-md p-3 position-relative" style={{
              background: 'linear-gradient(135deg, white 0%, rgba(16, 185, 129, 0.05) 50%, rgba(16, 185, 129, 0.08) 100%)'
            }}>
              <div className="d-flex align-items-center mb-2">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl d-flex align-items-center justify-content-center shadow-sm mr-2">
                  <div className="text-white text-sm">💰</div>
                </div>
                <div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 bengali-font font-weight-semibold mb-0">আজকের বিক্রয়</p>
                </div>
              </div>
              <div>
                <p className="text-xl font-weight-bold text-emerald-800 dark:text-emerald-200 number-font mb-1">
                  ৳{formatCurrency(stats?.totalSales || 0)}
                </p>
                <div className="d-flex align-items-center">
                  <ArrowUpRight className="w-2.5 h-2.5 text-emerald-600 mr-1" />
                  <span className="text-emerald-700 dark:text-emerald-400 text-xs bengali-font font-weight-medium">
                    +{toBengaliNumber(salesGrowth)}%
                  </span>
                </div>
              </div>
              <div className="position-absolute" style={{top: '4px', right: '4px', fontSize: '14px', opacity: '0.3'}}>📈</div>
            </div>
          </div>
          <div className="col-6">

            {/* Pending Collection - Using Mobile Framework */}
            <div className="card shadow-md p-3 position-relative" style={{
              background: 'linear-gradient(135deg, white 0%, rgba(251, 146, 60, 0.05) 50%, rgba(251, 146, 60, 0.08) 100%)'
            }}>
              <div className="d-flex align-items-center mb-2">
                <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl d-flex align-items-center justify-content-center shadow-sm mr-2">
                  <div className="text-white text-sm">🏦</div>
                </div>
                <div>
                  <p className="text-xs text-orange-700 dark:text-orange-300 bengali-font font-weight-semibold mb-0">বাকি আদায়</p>
                </div>
              </div>
              <div>
                <p className="text-xl font-weight-bold text-orange-800 dark:text-orange-200 number-font mb-1">
                  ৳{formatCurrency(stats?.pendingCollection || 0)}
                </p>
                <div className="d-flex align-items-center">
                  <Users className="w-2.5 h-2.5 text-orange-600 mr-1" />
                  <span className="text-orange-700 dark:text-orange-400 text-xs bengali-font font-weight-medium">
                    {toBengaliNumber(stats?.totalCustomers || 0)} জন
                  </span>
                </div>
              </div>
              <div className="position-absolute" style={{top: '4px', right: '4px', fontSize: '14px', opacity: '0.3'}}>💳</div>
            </div>
          </div>
        </div>

        {/* Mobile Framework Actions */}
        <div className="card shadow-md p-2">
          <div className="d-flex align-items-center mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg d-flex align-items-center justify-content-center shadow-sm mr-2">
              <div className="text-white text-sm">⚡</div>
            </div>
            <div>
              <h3 className="text-sm font-weight-bold text-slate-900 dark:text-white bengali-font">দ্রুত কাজ</h3>
            </div>
          </div>
          
          {/* Primary Actions Row using Mobile Framework */}
          <div className="row mb-2">
            <div className="col-3">
              <Link to="/sales/new" data-testid="link-sales-new" className="btn btn-touch-target text-center">
                <div className="card-mini p-2 text-center bg-emerald-50 hover-scale">
                  <div className="text-emerald-600 text-sm mb-1">🛒</div>
                  <span className="text-xs text-emerald-700 bengali-font font-weight-bold">বিক্রয়</span>
                </div>
              </Link>
            </div>
            <div className="col-3">
              <Link to="/customers/new" data-testid="link-customer-new" className="btn btn-touch-target text-center">
                <div className="card-mini p-2 text-center bg-blue-50 hover-scale">
                  <div className="text-blue-600 text-sm mb-1">👥</div>
                  <span className="text-xs text-blue-700 bengali-font font-weight-bold">গ্রাহক</span>
                </div>
              </Link>
            </div>
            <div className="col-3">
              <Link to="/collection" data-testid="link-collection" className="btn btn-touch-target text-center">
                <div className="card-mini p-2 text-center bg-orange-50 hover-scale">
                  <div className="text-orange-600 text-sm mb-1">💰</div>
                  <span className="text-xs text-orange-700 bengali-font font-weight-bold">আদায়</span>
                </div>
              </Link>
            </div>
            <div className="col-3">
              <Link to="/inventory" data-testid="link-inventory" className="btn btn-touch-target text-center">
                <div className="card-mini p-2 text-center bg-purple-50 hover-scale">
                  <div className="text-purple-600 text-sm mb-1">📦</div>
                  <span className="text-xs text-purple-700 bengali-font font-weight-bold">স্টক</span>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Secondary Actions Row */}
          <div className="row">
            <div className="col-3">
              <Link to="/expenses/new" data-testid="link-expense-new" className="btn btn-touch-target text-center">
                <div className="card-mini p-2 text-center bg-red-50 hover-scale">
                  <div className="text-red-600 text-sm mb-1">📝</div>
                  <span className="text-xs text-red-700 bengali-font font-weight-bold">খরচ</span>
                </div>
              </Link>
            </div>
            <div className="col-3">
              <Link to="/transactions" data-testid="link-transactions" className="btn btn-touch-target text-center">
                <div className="card-mini p-2 text-center bg-teal-50 hover-scale">
                  <div className="text-teal-600 text-sm mb-1">📊</div>
                  <span className="text-xs text-teal-700 bengali-font font-weight-bold">হিসাব</span>
                </div>
              </Link>
            </div>
            <div className="col-3">
              <button className="btn btn-touch-target text-center w-100" data-testid="button-calculator">
                <div className="card-mini p-2 text-center bg-slate-50 hover-scale">
                  <div className="text-slate-600 text-sm mb-1">🧮</div>
                  <span className="text-xs text-slate-700 bengali-font font-weight-bold">ক্যালক</span>
                </div>
              </button>
            </div>
            <div className="col-3">
              <button 
                className="btn btn-touch-target text-center w-100"
                onClick={() => toast({ title: "WhatsApp রিপোর্ট", description: "রিপোর্ট পাঠানো হচ্ছে..." })}
                data-testid="button-whatsapp"
              >
                <div className="card-mini p-2 text-center bg-green-50 hover-scale">
                  <div className="text-green-600 text-sm mb-1">📱</div>
                  <span className="text-xs text-green-700 bengali-font font-weight-bold">মেসেজ</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Business Intelligence Dashboard - Mobile Framework */}
        <div className="card shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
          {/* Mobile Framework Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="d-flex align-items-center justify-content-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">ব্যবসার খবর</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 bengali-font">সাম্প্রতিক কার্যকলাপ</p>
                </div>
              </div>
              <Link to={activeTab === 'transactions' ? '/transactions' : '/customers'}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-xs bengali-font font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 rounded-lg group border border-indigo-200 dark:border-indigo-800"
                  data-testid="button-view-all-dynamic"
                >
                  <span className="text-xs">সব দেখুন</span>
                  <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile-Optimized Tab System */}
          <div className="p-3">
            <Tabs defaultValue="transactions" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-1 h-10">
                <TabsTrigger 
                  value="transactions" 
                  className="text-xs bengali-font font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md rounded-lg transition-all duration-300 py-2 relative group"
                  data-testid="tab-transactions"
                >
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-xs">বিক্রয়</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="text-xs bengali-font font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md rounded-lg transition-all duration-300 py-2 relative group"
                  data-testid="tab-customers"
                >
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <span className="text-xs">গ্রাহক</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            
              {/* Mobile-Optimized Sales List */}
              <TabsContent value="transactions" className="mt-3">
                {recentSales.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                    {recentSales.map((sale, index) => (
                      <div key={sale.id} className="group relative bg-gradient-to-r from-emerald-50/50 to-green-50/30 dark:from-emerald-900/20 dark:to-green-900/10 rounded-xl p-2.5 hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-emerald-100/50 dark:border-emerald-800/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                            <div className="relative">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-sm">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              </div>
                              {sale.due_amount > 0 && (
                                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white bengali-font truncate">
                                {sale.customer_name}
                              </p>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 bengali-font font-medium px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                  {sale.payment_method}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 bengali-font">
                                  {new Date(sale.sale_date).toLocaleDateString('bn-BD')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 number-font">
                              ৳{formatCurrency(Number(sale.total_amount))}
                            </p>
                            {sale.due_amount > 0 && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 bengali-font font-semibold bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full mt-0.5">
                                বাকি: ৳{formatCurrency(sale.due_amount)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-1">আজ কোনো বিক্রয় হয়নি</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 bengali-font">প্রথম বিক্রয় যোগ করুন এবং আপনার ব্যবসা শুরু করুন</p>
                  </div>
                )}
              </TabsContent>
            
              {/* Mobile-Optimized Customers List */}
              <TabsContent value="customers" className="mt-3">
                {customers.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                    {customers.slice(0, 10).map((customer, index) => (
                      <div key={customer.id} className="group relative bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-xl p-2.5 hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-blue-100/50 dark:border-blue-800/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                            <div className="relative">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              {customer.total_credit > 0 && (
                                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white bengali-font truncate">
                                {customer.name}
                              </p>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className="text-xs text-blue-600 dark:text-blue-400 bengali-font font-medium px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                  {customer.phone_number}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            {customer.total_credit > 0 ? (
                              <div>
                                <p className="text-base font-black text-red-500 dark:text-red-400 number-font">
                                  ৳{formatCurrency(customer.total_credit)}
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-400 bengali-font font-semibold bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full mt-0.5">
                                  বাকি আছে
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 number-font">
                                  ৳০
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 bengali-font font-semibold bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full mt-0.5">
                                  সম্পূর্ণ
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-1">কোনো গ্রাহক নেই</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 bengali-font">প্রথম গ্রাহক যোগ করুন এবং সম্পর্ক গড়ে তুলুন</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      

      
      {/* Minimal bottom spacing for ultra-compact view */}
      <div className="h-8"></div>
    </div>
  );
}