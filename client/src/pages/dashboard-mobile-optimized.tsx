import { useQuery } from "@tanstack/react-query";
import { toBengaliNumber, formatCurrency, getBengaliDate } from "@/lib/bengali-utils";
import { Link } from "wouter";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, 
  Wallet, AlertCircle, Plus, Bell, Eye,
  ArrowUpRight, Package, MessageCircle,
  BarChart3, Settings, Clock, Target,
  ChevronRight, Activity, RefreshCw
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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', CURRENT_USER_ID],
    queryFn: () => supabaseService.getStats(CURRENT_USER_ID),
    staleTime: 0,
    gcTime: 0,
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

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400 bengali-font">
            ড্যাশবোর্ড লোড করা হচ্ছে...
          </p>
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
        
        {/* Compact KPI Grid - 2x2 Layout */}
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
            <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
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

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-violet-600 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-purple-100 bengali-font">মোট লাভ</p>
                <Target className="w-4 h-4 text-purple-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {formatCurrency(stats?.profit || 0)}
              </p>
              <p className="text-purple-200 text-xs">
                {toBengaliNumber(profitMargin.toFixed(1))}% মার্জিন
              </p>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-500 to-red-500 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-orange-100 bengali-font">গ্রাহক</p>
                <Users className="w-4 h-4 text-orange-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {toBengaliNumber(stats?.totalCustomers || 0)}
              </p>
              <p className="text-orange-200 text-xs">সক্রিয় সদস্য</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions - Horizontal Scrollable */}
        <Card className="border-0 shadow-md p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">দ্রুত কাজ</h3>
            <Plus className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-1">
            <Link to="/sales/new">
              <Button size="sm" className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 h-12 flex flex-col space-y-1">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs bengali-font">বিক্রয়</span>
              </Button>
            </Link>
            
            <Link to="/customers/new">
              <Button size="sm" variant="outline" className="flex-shrink-0 h-12 flex flex-col space-y-1 px-4">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs bengali-font">গ্রাহক</span>
              </Button>
            </Link>
            
            <Link to="/collection">
              <Button size="sm" variant="outline" className="flex-shrink-0 h-12 flex flex-col space-y-1 px-4">
                <Wallet className="w-4 h-4 text-purple-600" />
                <span className="text-xs bengali-font">আদায়</span>
              </Button>
            </Link>
            
            <Link to="/inventory">
              <Button size="sm" variant="outline" className="flex-shrink-0 h-12 flex flex-col space-y-1 px-4">
                <Package className="w-4 h-4 text-orange-600" />
                <span className="text-xs bengali-font">স্টক</span>
              </Button>
            </Link>
          </div>
        </Card>

        {/* Expandable Sections */}
        <div className="space-y-3">
          
          {/* Recent Activity - Collapsible */}
          <Card className="border-0 shadow-md">
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setExpandedCard(expandedCard === 'activity' ? null : 'activity')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    সাম্প্রতিক কার্যকলাপ
                  </h3>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedCard === 'activity' ? 'rotate-90' : ''}`} />
              </div>
            </div>
            
            {expandedCard === 'activity' && (
              <div className="px-4 pb-4 space-y-2">
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-900 dark:text-white bengali-font">
                            {sale.customer_name}
                          </p>
                          <p className="text-xs text-slate-500">{sale.payment_method}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-green-600 number-font">
                        +{formatCurrency(Number(sale.total_amount))}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2 bengali-font">
                    আজকে কোনো বিক্রয় নেই
                  </p>
                )}
                <Link to="/transactions">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    সব লেনদেন দেখুন
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Alerts - Collapsible */}
          <Card className="border-0 shadow-md">
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setExpandedCard(expandedCard === 'alerts' ? null : 'alerts')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    গুরুত্বপূর্ণ সতর্কতা
                  </h3>
                  {(lowStockProducts.length > 0 || (stats?.pendingCollection && stats.pendingCollection > 0)) && (
                    <Badge className="h-4 text-xs bg-red-500 text-white">
                      {lowStockProducts.length + (stats?.pendingCollection && Number(stats.pendingCollection) > 0 ? 1 : 0)}
                    </Badge>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedCard === 'alerts' ? 'rotate-90' : ''}`} />
              </div>
            </div>
            
            {expandedCard === 'alerts' && (
              <div className="px-4 pb-4 space-y-2">
                {lowStockProducts.length > 0 && (
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Package className="w-4 h-4 text-orange-600" />
                      <p className="text-xs font-medium text-orange-800 dark:text-orange-200 bengali-font">
                        স্টক কম ({toBengaliNumber(lowStockProducts.length)}টি পণ্য)
                      </p>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-300">
                      {lowStockProducts.slice(0, 2).map(p => p.name).join(', ')}
                      {lowStockProducts.length > 2 && ` এবং আরো ${lowStockProducts.length - 2}টি`}
                    </p>
                  </div>
                )}
                
                {stats?.pendingCollection && Number(stats.pendingCollection) > 0 && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Wallet className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-200 bengali-font">
                        বাকি আদায় করুন
                      </p>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      {formatCurrency(stats.pendingCollection)} আদায় বাকি
                    </p>
                  </div>
                )}
                
                {lowStockProducts.length === 0 && (!stats?.pendingCollection || Number(stats.pendingCollection) === 0) && (
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Activity className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-medium text-green-800 dark:text-green-200 bengali-font">
                        সব ঠিক আছে!
                      </p>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-300">
                      আপনার ব্যবসা ভালো চলছে
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick Communication */}
          <Card className="border-0 shadow-md p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3 flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span>দ্রুত যোগাযোগ</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="h-10 flex items-center space-x-2 text-xs"
                onClick={() => toast({ title: "WhatsApp রিপোর্ট", description: "দৈনিক রিপোর্ট পাঠানো হচ্ছে" })}
              >
                <MessageCircle className="w-3 h-3 text-green-600" />
                <span className="bengali-font">WhatsApp</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="h-10 flex items-center space-x-2 text-xs"
                onClick={() => toast({ title: "SMS রিমাইন্ডার", description: "বার্তা পাঠানো হবে" })}
              >
                <Bell className="w-3 h-3 text-blue-600" />
                <span className="bengali-font">SMS</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}