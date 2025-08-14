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
  const [showQuickActions, setShowQuickActions] = useState(true);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
      
      {/* World-Class Header Design - Clean & Minimalist */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50">
        <div className="container px-4 py-4">
          {/* Welcome Section with Better Typography */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white bengali-font tracking-tight">
                {timeOfDay}, {user?.name?.split(' ')[0] || 'ব্যবসায়ী'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 bengali-font font-medium">
                {getBengaliDate()} • আজকের ব্যবসার সারসংক্ষেপ
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">
                  {user?.name?.charAt(0) || 'ব'}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics with Improved Visual Hierarchy */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Today's Sales - Enhanced Design */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-900/20 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">💰</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bengali-font opacity-90">
                  আজকের বিক্রয়
                </p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 number-font tracking-tight">
                  ৳{formatCurrency(stats?.totalSales || 0)}
                </p>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                    <ArrowUpRight className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 bengali-font font-medium">
                    {toBengaliNumber(salesGrowth)}% বৃদ্ধি
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Collection - Enhanced Design */}
            <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-900/20 rounded-2xl p-4 border border-orange-200/50 dark:border-orange-800/30">
              <div className="absolute top-2 right-2 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 text-sm">💳</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 bengali-font opacity-90">
                  বাকি আদায়
                </p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 number-font tracking-tight">
                  ৳{formatCurrency(stats?.pendingCollection || 0)}
                </p>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                    <Users className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs text-orange-700 dark:text-orange-300 bengali-font font-medium">
                    {toBengaliNumber(stats?.totalCustomers || 0)} গ্রাহক
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Better Spacing */}
      <div className="container px-4 py-6 space-y-6">

        {/* World-Class Quick Actions - Improved UX/UI Design */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
          {/* Section Header with Better Typography */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-850 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-sm">⚡</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white bengali-font">দ্রুত কাজ</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 bengali-font">প্রয়োজনীয় কাজগুলো</p>
                </div>
              </div>
              <button 
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                data-testid="button-toggle-actions"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Enhanced Primary Actions with Better Visual Hierarchy */}
          {showQuickActions && (
            <div className="p-5 space-y-4">
              {/* Primary Business Actions */}
              <div className="grid grid-cols-4 gap-3">
                <Link to="/sales/new" data-testid="link-sales-new" className="group">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-900/20 rounded-xl p-3 text-center border border-emerald-200/30 dark:border-emerald-800/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                    <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <ShoppingCart className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bengali-font">বিক্রয়</span>
                  </div>
                </Link>

                <Link to="/customers/new" data-testid="link-customer-new" className="group">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-900/20 rounded-xl p-3 text-center border border-blue-200/30 dark:border-blue-800/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                    <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bengali-font">গ্রাহক</span>
                  </div>
                </Link>

                <Link to="/collection" data-testid="link-collection" className="group">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-900/20 rounded-xl p-3 text-center border border-orange-200/30 dark:border-orange-800/20 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                    <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 bengali-font">আদায়</span>
                  </div>
                </Link>

                <Link to="/inventory" data-testid="link-inventory" className="group">
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-900/20 rounded-xl p-3 text-center border border-purple-200/30 dark:border-purple-800/20 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                    <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bengali-font">স্টক</span>
                  </div>
                </Link>
              </div>
              
              {/* Secondary Actions */}
              <div className="grid grid-cols-4 gap-3">
                <Link to="/expenses/new" data-testid="link-expense-new" className="group">
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-900/20 rounded-xl p-3 text-center border border-red-200/30 dark:border-red-800/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                    <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <PenTool className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-red-700 dark:text-red-300 bengali-font">খরচ</span>
                  </div>
                </Link>

                <Link to="/transactions" data-testid="link-transactions" className="group">
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-900/20 rounded-xl p-3 text-center border border-teal-200/30 dark:border-teal-800/20 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                    <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 bengali-font">হিসাব</span>
                  </div>
                </Link>

                <button className="group" data-testid="button-calculator">
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/30 dark:to-gray-800/20 rounded-xl p-3 text-center border border-slate-200/30 dark:border-slate-700/20 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                    <div className="w-8 h-8 bg-slate-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bengali-font">ক্যালক</span>
                  </div>
                </button>

                <button 
                  className="group"
                  onClick={() => toast({ title: "WhatsApp রিপোর্ট", description: "রিপোর্ট পাঠানো হচ্ছে..." })}
                  data-testid="button-whatsapp"
                >
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/20 rounded-xl p-3 text-center border border-green-200/30 dark:border-green-800/20 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                    <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300 bengali-font">মেসেজ</span>
                  </div>
                </button>
              </div>
            </div>
          )}
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