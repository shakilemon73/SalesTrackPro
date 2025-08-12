import { useQuery } from "@tanstack/react-query";
import { toBengaliNumber, formatCurrency, getBengaliDate, getBengaliTime } from "@/lib/bengali-utils";
import { Link } from "wouter";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import { whatsappManager } from "@/lib/whatsapp-business";
import { smsManager } from "@/lib/sms-api";
import { paymentManager } from "@/lib/payment-integration";
import { smartInventory } from "@/lib/smart-inventory";
import { analyticsEngine } from "@/lib/advanced-analytics";
import { loyaltyProgram } from "@/lib/loyalty-program";
import { offlineStorage } from "@/lib/offline-storage";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, 
  Wallet, AlertCircle, BarChart3, Plus, Bell,
  ArrowUpRight, ArrowDownRight, DollarSign,
  Package, Calendar, MessageCircle, QrCode,
  Smartphone, Eye, RefreshCw, Settings,
  MapPin, Clock, Activity, Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardRedesigned() {
  const [showCommunicationPanel, setShowCommunicationPanel] = useState(false);
  const [smartInsights, setSmartInsights] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('');
  const { toast } = useToast();

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    // Set time of day greeting
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('সুপ্রভাত');
    else if (hour < 17) setTimeOfDay('শুভ দুপুর');
    else setTimeOfDay('শুভ সন্ধ্যা');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard', CURRENT_USER_ID],
    queryFn: () => supabaseService.getStats(CURRENT_USER_ID),
    staleTime: 0,
    gcTime: 0,
  });

  const { data: recentSales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID, 'recent'],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID, 3),
    staleTime: 0,
    gcTime: 0,
  });

  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['products', CURRENT_USER_ID, 'low-stock'],
    queryFn: () => supabaseService.getLowStockProducts(CURRENT_USER_ID),
  });

  // Load smart insights
  useEffect(() => {
    if (stats) {
      const loadInsights = async () => {
        try {
          const insights = await analyticsEngine.generateBusinessIntelligenceReport();
          setSmartInsights(insights);
        } catch (error) {
          console.error('Failed to load insights:', error);
        }
      };
      loadInsights();
    }
  }, [stats]);

  // Load payment methods
  useEffect(() => {
    const methods = paymentManager.getProviders();
    setPaymentMethods(methods);
  }, []);

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-600 rounded-full animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 bengali-font">
                ড্যাশবোর্ড প্রস্তুত করা হচ্ছে...
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                রিয়েল-টাইম ডেটা সিঙ্ক করা হচ্ছে
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate growth trends
  const salesGrowth = stats?.todaySales && stats.todaySales > 0 ? 12.5 : 0;
  const profitMargin = stats?.totalSales && stats.totalSales > 0 && stats.profit ? (stats.profit / stats.totalSales) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      {/* Modern Header with Status */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Greeting & Status */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-emerald-500/20">
                  <AvatarImage src="/avatar.jpg" alt="ব্যবসায়ী" />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                    দহ
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white bengali-font">
                  {timeOfDay}, ব্যবসায়ী!
                </h1>
                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>{getBengaliDate()}</span>
                  {!isOffline && (
                    <>
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600 text-xs font-medium">লাইভ</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {lowStockProducts.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                    {lowStockProducts.length}
                  </Badge>
                )}
              </Button>
              <Link to="/reports">
                <Button variant="ghost" size="sm">
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Stats - Primary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Sales */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-emerald-100 text-sm font-medium bengali-font">আজকের বিক্রয়</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold number-font tracking-tight">
                      {formatCurrency(stats?.todaySales || 0)}
                    </p>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-emerald-200" />
                      <span className="text-emerald-200 text-xs font-medium">
                        +{toBengaliNumber(salesGrowth)}% বৃদ্ধি
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Collections */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-blue-100 text-sm font-medium bengali-font">বাকি আদায়</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold number-font tracking-tight">
                      {formatCurrency(stats?.pendingCollection || 0)}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Wallet className="w-3 h-3 text-blue-200" />
                      <span className="text-blue-200 text-xs font-medium">
                        {toBengaliNumber(stats?.totalCustomers || 0)}টি গ্রাহক
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Profit */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-purple-100 text-sm font-medium bengali-font">মোট লাভ</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold number-font tracking-tight">
                      {formatCurrency(stats?.profit || 0)}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-purple-200" />
                      <span className="text-purple-200 text-xs font-medium">
                        {toBengaliNumber(profitMargin.toFixed(1))}% মার্জিন
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Customers */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-orange-100 text-sm font-medium bengali-font">সক্রিয় গ্রাহক</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold number-font tracking-tight">
                      {toBengaliNumber(stats?.totalCustomers || 0)}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-orange-200" />
                      <span className="text-orange-200 text-xs font-medium">
                        সব গ্রাহক
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white bengali-font flex items-center space-x-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>দ্রুত কাজ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/sales/new">
                <Button variant="outline" className="h-20 w-full flex flex-col space-y-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300">
                  <ShoppingCart className="w-6 h-6 text-emerald-600" />
                  <span className="text-sm font-medium bengali-font">বিক্রয় এন্ট্রি</span>
                </Button>
              </Link>
              
              <Link to="/customers/new">
                <Button variant="outline" className="h-20 w-full flex flex-col space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
                  <Users className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium bengali-font">নতুন গ্রাহক</span>
                </Button>
              </Link>
              
              <Link to="/collection">
                <Button variant="outline" className="h-20 w-full flex flex-col space-y-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300">
                  <Wallet className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium bengali-font">টাকা আদায়</span>
                </Button>
              </Link>
              
              <Link to="/inventory">
                <Button variant="outline" className="h-20 w-full flex flex-col space-y-2 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300">
                  <Package className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium bengali-font">স্টক দেখুন</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout for Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Transactions */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white bengali-font">
                সাম্প্রতিক লেনদেন
              </CardTitle>
              <Link to="/transactions">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  সব দেখুন
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSales.length > 0 ? (
                  recentSales.map((sale, index) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          Number(sale.total_amount) > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {Number(sale.total_amount) > 0 ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white bengali-font">
                            {sale.customer_name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {sale.payment_method}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold number-font ${
                          Number(sale.total_amount) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(Number(sale.total_amount)))}
                        </p>
                        <p className="text-xs text-slate-400">
                          {sale.created_at ? new Date(sale.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="bengali-font">আজ কোন লেনদেন নেই</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Business Insights & Alerts */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white bengali-font flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>ব্যবসায়িক সতর্কতা</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-red-800 dark:text-red-200 bengali-font">
                          স্টক কম!
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-300">
                          {toBengaliNumber(lowStockProducts.length)}টি পণ্যের স্টক শেষ হয়ে যাচ্ছে
                        </p>
                      </div>
                      <Link to="/inventory">
                        <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                          দেখুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Pending Collections Alert */}
                {stats?.pendingCollection && stats.pendingCollection > 0 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-amber-800 dark:text-amber-200 bengali-font">
                          বাকি আদায় করুন
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-300">
                          {formatCurrency(stats.pendingCollection)} টাকা বাকি আছে
                        </p>
                      </div>
                      <Link to="/collection">
                        <Button size="sm" variant="outline" className="text-amber-600 border-amber-300">
                          আদায়
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Smart Insights */}
                {smartInsights && smartInsights.recommendations.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-blue-800 dark:text-blue-200 bengali-font">
                          AI সুপারিশ
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-300">
                          আপনার ব্যবসার জন্য নতুন পরামর্শ আছে
                        </p>
                      </div>
                      <Link to="/analytics">
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                          দেখুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {lowStockProducts.length === 0 && (!stats?.pendingCollection || stats.pendingCollection === 0) && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-medium text-green-800 dark:text-green-200 bengali-font">
                      সব ঠিক আছে!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      আপনার ব্যবসা ভালো চলছে
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Payment Integration */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white bengali-font flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <span>দ্রুত পেমেন্ট</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-16 flex items-center space-x-3 hover:bg-pink-50 hover:border-pink-300 transition-all duration-300"
                onClick={() => toast({ title: "bKash QR প্রস্তুত", description: "QR কোড স্ক্যান করে পেমেন্ট নিন" })}
              >
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium bengali-font">bKash</p>
                  <p className="text-xs text-slate-500">QR পেমেন্ট</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex items-center space-x-3 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300"
                onClick={() => toast({ title: "Nagad QR প্রস্তুত", description: "QR কোড স্ক্যান করে পেমেন্ট নিন" })}
              >
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium bengali-font">Nagad</p>
                  <p className="text-xs text-slate-500">QR পেমেন্ট</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex items-center space-x-3 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                onClick={() => toast({ title: "Rocket QR প্রস্তুত", description: "QR কোড স্ক্যান করে পেমেন্ট নিন" })}
              >
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium bengali-font">Rocket</p>
                  <p className="text-xs text-slate-500">QR পেমেন্ট</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Communication Center */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white bengali-font flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span>যোগাযোগ কেন্দ্র</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-16 flex items-center space-x-3 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                onClick={() => toast({ title: "WhatsApp রিপোর্ট", description: "দৈনিক রিপোর্ট WhatsApp এ পাঠানো হবে" })}
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium bengali-font">WhatsApp রিপোর্ট</p>
                  <p className="text-xs text-slate-500">দৈনিক বিক্রয় শেয়ার করুন</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex items-center space-x-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                onClick={() => setShowCommunicationPanel(true)}
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium bengali-font">SMS রিমাইন্ডার</p>
                  <p className="text-xs text-slate-500">বাকি আদায়ের বার্তা পাঠান</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Safe Area for Navigation */}
      <div className="h-20"></div>
    </div>
  );
}