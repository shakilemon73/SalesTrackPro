import { useQuery } from "@tanstack/react-query";
import DashboardCard from "@/components/ui/dashboard-card";
import TransactionItem from "@/components/ui/transaction-item";
import CommunicationPanel from "@/components/ui/communication-panel";
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

export default function Dashboard() {
  const [showCommunicationPanel, setShowCommunicationPanel] = useState(false);
  const [smartInsights, setSmartInsights] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard', CURRENT_USER_ID],
    queryFn: () => {
      console.log('🔥 DASHBOARD: Fetching dashboard stats for user:', CURRENT_USER_ID);
      return supabaseService.getStats(CURRENT_USER_ID);
    },
    staleTime: 0,
    gcTime: 0,
  });

  const { data: recentSales = [], isLoading: salesLoading, error: salesError } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID, 'recent'],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID, 3),
    staleTime: 0,
    gcTime: 0,
  });

  if (statsError) console.error('🔥 DASHBOARD Stats error:', statsError);
  if (salesError) console.error('🔥 DASHBOARD Sales error:', salesError);

  // Fetch recent expenses
  const { data: recentExpenses = [] } = useQuery({
    queryKey: ['expenses', CURRENT_USER_ID, 'recent'],
    queryFn: () => supabaseService.getExpenses(CURRENT_USER_ID, 2),
  });

  // Fetch recent collections
  const { data: recentCollections = [] } = useQuery({
    queryKey: ['collections', CURRENT_USER_ID, 'recent'],
    queryFn: () => supabaseService.getCollections(CURRENT_USER_ID, 2),
  });

  const { data: lowStockProducts = [], isLoading: stockLoading } = useQuery({
    queryKey: ['products', CURRENT_USER_ID, 'low-stock'],
    queryFn: () => supabaseService.getLowStockProducts(CURRENT_USER_ID),
  });

  // Load smart insights after stats are available
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

  // Load payment methods on mount
  useEffect(() => {
    const methods = paymentManager.getProviders();
    setPaymentMethods(methods);
  }, []);

  if (statsLoading) {
    console.log('🔥 DASHBOARD: Loading state - waiting for stats...');
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-app">
        <div className="text-center fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground mb-2 bengali-font">লোড হচ্ছে...</h3>
          <p className="text-muted-foreground text-sm">রিয়েল-টাইম ডেটা আনা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  console.log('🔥 DASHBOARD: Stats loaded:', stats);
  console.log('🔥 DASHBOARD: Recent sales loaded:', recentSales);

  // Handle WhatsApp sharing
  const handleShareReport = () => {
    if (stats) {
      whatsappManager.shareSalesReport({
        todaySales: stats.todaySales,
        totalSales: stats.totalSales,
        profit: stats.profit,
        pendingCollection: stats.pendingCollection,
        salesCount: stats.salesCount
      });
    }
  };

  // Handle payment integration
  const handleQuickPayment = (method: string) => {
    const qrCode = paymentManager.generateUniversalQR({
      amount: 100,
      description: 'দোকান হিসাব দ্রুত পেমেন্ট',
      orderId: `QP_${Date.now()}`
    });
    
    toast({
      title: "পেমেন্ট QR তৈরি হয়েছে",
      description: `${method} দিয়ে পেমেন্ট নিতে প্রস্তুত`
    });
  };

  // Handle SMS reminder
  const handleSendReminders = async () => {
    try {
      // Get customers with due amounts
      const customers = await supabaseService.getCustomers(CURRENT_USER_ID);
      const sales = await supabaseService.getSales(CURRENT_USER_ID);
      
      const customersWithDue = customers.filter(customer => {
        const customerSales = sales.filter(sale => sale.customer_id === customer.id);
        const totalDue = customerSales.reduce((sum, sale) => sum + (sale.due_amount || 0), 0);
        return totalDue > 0;
      });

      if (customersWithDue.length > 0) {
        toast({
          title: "রিমাইন্ডার প্রস্তুত",
          description: `${toBengaliNumber(customersWithDue.length)}টি গ্রাহকের জন্য বার্তা প্রস্তুত`
        });
        setShowCommunicationPanel(true);
      } else {
        toast({
          title: "কোন বাকি নেই",
          description: "সব গ্রাহকের পেমেন্ট আপ টু ডেট"
        });
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "রিমাইন্ডার চেক করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {/* Premium Status Bar with Network Status */}
      <div className="status-bar">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className={`w-1 h-1 rounded-full ${isOffline ? 'bg-red-400' : 'bg-white'} opacity-100`}></div>
            <div className={`w-1 h-1 rounded-full ${isOffline ? 'bg-red-400' : 'bg-white'} opacity-100`}></div>
            <div className={`w-1 h-1 rounded-full ${isOffline ? 'bg-red-400' : 'bg-white'} opacity-100`}></div>
            <div className={`w-1 h-1 rounded-full ${isOffline ? 'bg-red-400/60' : 'bg-white/60'}`}></div>
          </div>
          <span className="text-xs font-semibold">দোকান হিসাব</span>
          {isOffline && (
            <Badge variant="destructive" className="text-xs px-2 py-1">অফলাইন</Badge>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold number-font">
            {new Date().toLocaleTimeString('bn-BD', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-2 border border-white/80 rounded-sm relative overflow-hidden">
              <div className={`w-4/5 h-full rounded-sm ${isOffline ? 'bg-red-400' : 'bg-white'}`}></div>
            </div>
            <div className={`w-0.5 h-1 rounded-full ${isOffline ? 'bg-red-400' : 'bg-white'}`}></div>
          </div>
        </div>
      </div>

      {/* Enhanced Header Design */}
      <div className="header-bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
              <i className="fas fa-store text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold bengali-font tracking-tight mb-1">দোকান হিসাব</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-white/90 bengali-font font-medium">
                  {new Date().toLocaleDateString('bn-BD', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-200 font-semibold">লাইভ</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/reports">
              <button className="w-11 h-11 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20">
                <i className="fas fa-chart-line text-white text-lg"></i>
              </button>
            </Link>
            <Link to="/settings">
              <button className="w-11 h-11 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20">
                <i className="fas fa-user-circle text-white text-lg"></i>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content with Improved Spacing */}
      <div className="mobile-safe-area px-4 py-6 space-y-6">
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="stats-card group cursor-pointer" onClick={() => window.location.href = '/sales'}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-chart-line text-white"></i>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full opacity-60"></div>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1 bengali-font">আজকের বিক্রয়</h3>
            <p className="text-2xl font-bold text-foreground number-font tracking-tight">
              {formatCurrency(stats?.todaySales || 0)}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">রিয়েল-টাইম</span>
            </div>
          </div>

          <div className="stats-card group cursor-pointer" onClick={() => window.location.href = '/collection'}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-hand-holding-usd text-white"></i>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1 bengali-font">বাকি আদায়</h3>
            <p className="text-2xl font-bold text-foreground number-font tracking-tight">
              {formatCurrency(stats?.pendingCollection || 0)}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-600 font-medium">মোট বাকি</span>
            </div>
          </div>

          <div className="stats-card group cursor-pointer" onClick={() => window.location.href = '/customers'}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-users text-white"></i>
              </div>
              <div className="w-2 h-2 bg-purple-500 rounded-full opacity-60"></div>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1 bengali-font">মোট গ্রাহক</h3>
            <p className="text-2xl font-bold text-foreground number-font tracking-tight">
              {toBengaliNumber(stats?.totalCustomers || 0)}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-purple-600 font-medium">সক্রিয়</span>
            </div>
          </div>

          <div className="stats-card group cursor-pointer" onClick={() => window.location.href = '/reports'}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-chart-pie text-white"></i>
              </div>
              <div className="w-2 h-2 bg-orange-500 rounded-full opacity-60"></div>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1 bengali-font">মোট লাভ</h3>
            <p className="text-2xl font-bold text-foreground number-font tracking-tight">
              {formatCurrency(stats?.profit || 0)}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
              <span className="text-xs text-orange-600 font-medium">সব মিলিয়ে</span>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions with Smart Features */}
        <div className="dashboard-card">
          <h2 className="text-lg font-bold text-foreground mb-4 bengali-font flex items-center">
            <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-bolt text-primary text-sm"></i>
            </div>
            দ্রুত কাজ
            {smartInsights?.summary.atRiskCustomers > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {toBengaliNumber(smartInsights.summary.atRiskCustomers)} ঝুঁকিপূর্ণ
              </Badge>
            )}
          </h2>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="basic" className="bengali-font">মৌলিক</TabsTrigger>
              <TabsTrigger value="payment" className="bengali-font">পেমেন্ট</TabsTrigger>
              <TabsTrigger value="communication" className="bengali-font">যোগাযোগ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Link to="/sales/new">
                  <button className="quick-action-btn bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <i className="fas fa-plus-circle text-2xl"></i>
                    <span className="text-sm font-semibold bengali-font">নতুন বিক্রয়</span>
                  </button>
                </Link>
                <Link to="/customers/new">
                  <button className="quick-action-btn bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    <i className="fas fa-user-plus text-2xl"></i>
                    <span className="text-sm font-semibold bengali-font">নতুন গ্রাহক</span>
                  </button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/expenses/new">
                  <button className="quick-action-btn bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    <i className="fas fa-receipt text-2xl"></i>
                    <span className="text-sm font-semibold bengali-font">খরচ যোগ</span>
                  </button>
                </Link>
                <button 
                  onClick={handleShareReport}
                  className="quick-action-btn bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <i className="fab fa-whatsapp text-2xl"></i>
                  <span className="text-sm font-semibold bengali-font">রিপোর্ট শেয়ার</span>
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="payment">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button 
                  onClick={() => handleQuickPayment('bKash')}
                  className="quick-action-btn bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                >
                  <i className="fas fa-mobile-alt text-2xl"></i>
                  <span className="text-sm font-semibold bengali-font">বিকাশ QR</span>
                </button>
                <button 
                  onClick={() => handleQuickPayment('Nagad')}
                  className="quick-action-btn bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <i className="fas fa-qrcode text-2xl"></i>
                  <span className="text-sm font-semibold bengali-font">নগদ QR</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/collection">
                  <button className="quick-action-btn bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700">
                    <i className="fas fa-coins text-2xl"></i>
                    <span className="text-sm font-semibold bengali-font">টাকা আদায়</span>
                  </button>
                </Link>
                <Link to="/analytics">
                  <button className="quick-action-btn bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                    <i className="fas fa-chart-line text-2xl"></i>
                    <span className="text-sm font-semibold bengali-font">AI অ্যানালিটিক্স</span>
                  </button>
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="communication">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button 
                  onClick={handleSendReminders}
                  className="quick-action-btn bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  <i className="fas fa-bell text-2xl"></i>
                  <span className="text-sm font-semibold bengali-font">বাকি রিমাইন্ডার</span>
                </button>
                <button 
                  onClick={() => setShowCommunicationPanel(true)}
                  className="quick-action-btn bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <i className="fas fa-comments text-2xl"></i>
                  <span className="text-sm font-semibold bengali-font">যোগাযোগ কেন্দ্র</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/loyalty">
                  <button className="quick-action-btn bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700">
                    <i className="fas fa-star text-2xl"></i>
                    <span className="text-sm font-semibold bengali-font">লয়ালটি প্রোগ্রাম</span>
                  </button>
                </Link>
                <Link to="/smart-inventory">
                  <button className="quick-action-btn bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
                    <i className="fas fa-brain text-2xl"></i>
                    <span className="text-sm font-semibold bengali-font">স্মার্ট স্টক</span>
                  </button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Activity with Enhanced Visual Design */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground bengali-font flex items-center">
              <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-clock text-blue-500 text-sm"></i>
              </div>
              সাম্প্রতিক কার্যক্রম
            </h2>
            <Link to="/transactions">
              <button className="text-sm text-primary hover:text-primary-hover font-semibold bengali-font flex items-center space-x-1 transition-colors">
                <span>সব দেখুন</span>
                <i className="fas fa-arrow-right text-xs"></i>
              </button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {(() => {
              // Combine recent sales and expenses for display
              const allTransactions = [
                ...recentSales.map((sale: any) => ({
                  id: sale.id,
                  type: 'sale',
                  displayName: sale.customer_name || 'অজানা গ্রাহক',
                  displayAmount: `+ ${formatCurrency(sale.total_amount)}`,
                  displayType: 'বিক্রয়',
                  time: new Date(sale.sale_date || sale.created_at),
                  icon: 'fas fa-shopping-cart',
                  iconColor: 'text-green-600',
                  bgColor: 'bg-green-50'
                })),
                ...recentExpenses.map((expense: any) => ({
                  id: expense.id,
                  type: 'expense',
                  displayName: expense.description || 'খরচ',
                  displayAmount: `- ${formatCurrency(expense.amount)}`,
                  displayType: 'খরচ',
                  time: new Date(expense.expense_date || expense.created_at),
                  icon: 'fas fa-receipt',
                  iconColor: 'text-red-600',
                  bgColor: 'bg-red-50'
                }))
              ]
              .sort((a, b) => b.time.getTime() - a.time.getTime())
              .slice(0, 5);

              return allTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-receipt text-2xl text-muted-foreground"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 bengali-font">এখনো কোনো লেনদেন নেই</h3>
                  <p className="text-muted-foreground text-sm bengali-font">আপনার প্রথম বিক্রয় বা খরচ যোগ করুন</p>
                </div>
              ) : (
                allTransactions.map((transaction: any, index: number) => (
                  <div 
                    key={`${transaction.type}-${transaction.id || index}`}
                    className="transaction-item scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${transaction.bgColor} rounded-xl flex items-center justify-center`}>
                        <i className={`${transaction.icon} ${transaction.iconColor} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate bengali-font">{transaction.displayName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground bengali-font">{transaction.displayType}</span>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          <span className="text-xs text-muted-foreground number-font">{getBengaliTime(transaction.time)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg number-font ${transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.displayAmount}
                      </p>
                    </div>
                  </div>
                ))
              );
            })()}
          </div>
        </div>

        {/* Low Stock Alert - Enhanced Design */}
        {lowStockProducts.length > 0 && (
          <div className="dashboard-card border-l-4 border-orange-500 bg-orange-50/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center text-orange-700 bengali-font">
                <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-exclamation-triangle text-orange-600 text-sm"></i>
                </div>
                স্টক শেষ হয়ে যাচ্ছে
              </h2>
              <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold number-font">
                {toBengaliNumber(lowStockProducts.length)}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              {lowStockProducts.slice(0, 3).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-box text-orange-600 text-sm"></i>
                    </div>
                    <span className="font-medium text-foreground bengali-font">{product.name}</span>
                  </div>
                  <span className="text-orange-600 font-bold text-sm number-font">
                    {toBengaliNumber(product.currentStock)} টি বাকি
                  </span>
                </div>
              ))}
            </div>
            
            <Link to="/inventory">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors bengali-font">
                সব পণ্য দেখুন
              </button>
            </Link>
          </div>
        )}

        {/* Smart Insights Panel */}
        {smartInsights && (
          <div className="dashboard-card border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center text-purple-700 bengali-font">
                <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-brain text-purple-600 text-sm"></i>
                </div>
                AI বিজনেস ইনসাইট
              </h2>
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                স্মার্ট অ্যানালিটিক্স
              </Badge>
            </div>
            
            <div className="space-y-3">
              {smartInsights.topInsights.slice(0, 3).map((insight: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-lightbulb text-purple-600 text-xs"></i>
                  </div>
                  <span className="text-sm text-gray-700 bengali-font">{insight}</span>
                </div>
              ))}
              
              {smartInsights.recommendations.slice(0, 2).map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-green-200">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-arrow-up text-green-600 text-xs"></i>
                  </div>
                  <span className="text-sm text-gray-700 bengali-font">{recommendation}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-purple-600 number-font">
                    {toBengaliNumber(smartInsights.summary.highValueCustomers)}
                  </p>
                  <p className="text-xs text-purple-600 bengali-font">উচ্চ মূল্যের গ্রাহক</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-600 number-font">
                    {toBengaliNumber(smartInsights.summary.atRiskCustomers)}
                  </p>
                  <p className="text-xs text-orange-600 bengali-font">ঝুঁকিপূর্ণ গ্রাহক</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600 number-font">
                    {smartInsights.summary.profitOptimizationPotential > 0 ? 
                      formatCurrency(smartInsights.summary.profitOptimizationPotential) : '০'}
                  </p>
                  <p className="text-xs text-green-600 bengali-font">অপটিমাইজেশন সম্ভাবনা</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Communication Panel Dialog */}
      {showCommunicationPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bengali-font">যোগাযোগ কেন্দ্র</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCommunicationPanel(false)}
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
              
              <CommunicationPanel 
                salesData={stats ? {
                  todaySales: stats.todaySales,
                  totalSales: stats.totalSales,
                  profit: stats.profit,
                  pendingCollection: stats.pendingCollection,
                  salesCount: stats.salesCount
                } : undefined}
                lowStockItems={lowStockProducts.map(product => ({
                  name: product.name,
                  currentStock: product.currentStock,
                  minStock: product.min_stock_level
                }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Floating Action Button */}
      <Link to="/sales/new">
        <button className="floating-action-btn group">
          <i className="fas fa-plus text-xl transition-transform group-hover:rotate-90"></i>
        </button>
      </Link>
    </>
  );
}