import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatCurrency, toBengaliNumber, getBengaliDate } from "@/lib/bengali-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabaseService } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { CustomerDetailsSkeleton } from "@/components/loading-skeletons";
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, 
  ShoppingCart, Wallet, TrendingUp, Clock,
  CreditCard, Receipt, AlertCircle, Star,
  Edit, MessageCircle, Plus
} from "lucide-react";

interface CustomerDetailsProps {
  params: { id: string };
}

export default function CustomerDetailsMobileOptimized({ params }: CustomerDetailsProps) {
  const customerId = params.id;
  const { userId, isLoading: authLoading } = useAuth();

  const { data: customer, isLoading: customerLoading, error: customerError } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => supabaseService.getCustomer(userId!, customerId),
    enabled: !!userId && !!customerId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', userId],
    queryFn: () => supabaseService.getSales(userId!),
    enabled: !!userId,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['collections', userId],
    queryFn: () => supabaseService.getCollections(userId!),
    enabled: !!userId,
  });

  // Show skeleton loading state while authentication is being checked or data is loading
  if (authLoading || (!!userId && customerLoading)) {
    return <CustomerDetailsSkeleton />;
  }

  // Error or Customer not found state
  if (customerError || (!customerLoading && !customer && !!userId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2 bengali-font">
              গ্রাহক খুঁজে পাওয়া যায়নি
            </h1>
            <p className="text-gray-600 mb-6 bengali-font">
              এই গ্রাহকের তথ্য আর উপলব্ধ নেই বা ভুল আইডি দেওয়া হয়েছে।
            </p>
            <div className="space-y-3">
              <Link to="/customers">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <User className="w-4 h-4 mr-2" />
                  গ্রাহক তালিকায় ফিরে যান
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ড্যাশবোর্ডে ফিরে যান
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If customer is still loading or not available, don't try to calculate stats
  if (!customer) {
    return null;
  }

  // Calculate customer stats
  const customerSales = sales.filter(sale => sale.customer_id === customerId);
  const customerCollections = collections.filter(collection => collection.customer_id === customerId);

  const stats = {
    totalPurchases: customerSales.reduce((sum, sale) => sum + parseFloat(String(sale.total_amount || 0)), 0),
    totalDue: customerSales.reduce((sum, sale) => sum + parseFloat(String(sale.due_amount || 0)), 0),
    totalCollected: customerCollections.reduce((sum, collection) => sum + parseFloat(String(collection.amount || 0)), 0),
    orderCount: customerSales.length,
    avgOrderValue: customerSales.length > 0 ? customerSales.reduce((sum, sale) => sum + parseFloat(String(sale.total_amount || 0)), 0) / customerSales.length : 0,
    lastPurchase: customerSales.length > 0 ? new Date(customerSales.sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())[0].sale_date) : null
  };

  const getCustomerBadge = () => {
    if (stats.orderCount >= 10) return { text: 'VIP গ্রাহক', color: 'bg-gradient-to-r from-purple-500 to-indigo-500' };
    if (stats.orderCount >= 5) return { text: 'নিয়মিত গ্রাহক', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
    if (stats.orderCount >= 1) return { text: 'সাধারণ গ্রাহক', color: 'bg-gradient-to-r from-green-500 to-emerald-500' };
    return { text: 'নতুন গ্রাহক', color: 'bg-gradient-to-r from-slate-500 to-gray-500' };
  };

  const badge = getCustomerBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      
      {/* Compact Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/customers">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white bengali-font truncate max-w-[150px]">
                  {customer.name}
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>গ্রাহকের তথ্য</span>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
              <Edit className="w-3 h-3 mr-1" />
              এডিট
            </Button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-4 space-y-4">
        
        {/* Customer Profile Card */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="text-center">
              {/* Profile Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                {customer.name.charAt(0)}
              </div>
              
              {/* Customer Name & Badge */}
              <h2 className="text-xl font-bold text-slate-900 dark:text-white bengali-font mb-2">
                {customer.name}
              </h2>
              
              <div className={`inline-block ${badge.color} text-white px-3 py-1 rounded-full text-xs font-medium mb-3`}>
                {badge.text}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                {customer.phone_number && (
                  <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone_number}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-center">{customer.address}</span>
                  </div>
                )}
                <div className="flex items-center justify-center space-x-2 text-slate-500 dark:text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>যোগদান: {new Date(customer.created_at).toLocaleDateString('bn-BD')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-100 bengali-font">মোট ক্রয়</p>
                <ShoppingCart className="w-4 h-4 text-blue-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {formatCurrency(stats.totalPurchases)}
              </p>
              <p className="text-blue-200 text-xs">
                {toBengaliNumber(stats.orderCount)}টি অর্ডার
              </p>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-red-500 to-rose-600 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-red-100 bengali-font">বাকি টাকা</p>
                <AlertCircle className="w-4 h-4 text-red-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {formatCurrency(stats.totalDue)}
              </p>
              <p className="text-red-200 text-xs bengali-font">
                {stats.totalDue > 0 ? 'পরিশোধযোগ্য' : 'কোনো বাকি নেই'}
              </p>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-green-100 bengali-font">আদায়</p>
                <Wallet className="w-4 h-4 text-green-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {formatCurrency(stats.totalCollected)}
              </p>
              <p className="text-green-200 text-xs">
                {toBengaliNumber(customerCollections.length)}বার আদায়
              </p>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-violet-600 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-purple-100 bengali-font">গড় ক্রয়</p>
                <TrendingUp className="w-4 h-4 text-purple-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {formatCurrency(stats.avgOrderValue)}
              </p>
              <p className="text-purple-200 text-xs bengali-font">
                প্রতি অর্ডার
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3">
            দ্রুত কাজ
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/sales/new">
              <Button variant="outline" className="w-full h-12 flex flex-col items-center space-y-1">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span className="text-xs bengali-font">নতুন বিক্রয়</span>
              </Button>
            </Link>
            
            {stats.totalDue > 0 && (
              <Link to="/collection">
                <Button variant="outline" className="w-full h-12 flex flex-col items-center space-y-1">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="text-xs bengali-font">টাকা আদায়</span>
                </Button>
              </Link>
            )}
            
            {customer.phone_number && (
              <Button variant="outline" className="w-full h-12 flex flex-col items-center space-y-1">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs bengali-font">SMS পাঠান</span>
              </Button>
            )}
            
            <Button variant="outline" className="w-full h-12 flex flex-col items-center space-y-1">
              <Receipt className="w-4 h-4 text-purple-600" />
              <span className="text-xs bengali-font">রিপোর্ট দেখুন</span>
            </Button>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-md p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3">
            সাম্প্রতিক লেনদেন
          </h3>
          
          {customerSales.length > 0 ? (
            <div className="space-y-2">
              {customerSales
                .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
                .slice(0, 5)
                .map((sale, index) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white number-font">
                          {formatCurrency(parseFloat(String(sale.total_amount || 0)))}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(sale.sale_date).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {parseFloat(String(sale.due_amount || 0)) > 0 && (
                        <Badge variant="outline" className="text-xs h-4 px-1 text-red-600 border-red-200">
                          বাকি: {formatCurrency(parseFloat(String(sale.due_amount || 0)))}
                        </Badge>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {sale.payment_method}
                      </p>
                    </div>
                  </div>
                ))}
                
              {customerSales.length > 5 && (
                <Button variant="ghost" className="w-full text-xs h-8 bengali-font">
                  আরো {toBengaliNumber((customerSales.length - 5).toString())}টি লেনদেন দেখুন
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <ShoppingCart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 bengali-font mb-3">
                এখনো কোনো ক্রয় নেই
              </p>
              <Link to="/sales/new">
                <Button size="sm" variant="outline">
                  প্রথম বিক্রয় করুন
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Customer Insights */}
        {stats.orderCount > 0 && (
          <Card className="border-0 shadow-md p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3 flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>গ্রাহক পরিসংখ্যান</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 bengali-font">প্রথম ক্রয়</span>
                <span className="font-medium">
                  {customerSales.length > 0 && new Date(customerSales.sort((a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime())[0].sale_date).toLocaleDateString('bn-BD')}
                </span>
              </div>
              {stats.lastPurchase && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 bengali-font">সর্বশেষ ক্রয়</span>
                  <span className="font-medium">
                    {stats.lastPurchase.toLocaleDateString('bn-BD')}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 bengali-font">গ্রাহক অবস্থা</span>
                <Badge variant="outline" className="text-xs h-4 px-1">
                  {stats.totalDue > 0 ? 'বাকি আছে' : 'পরিশোধিত'}
                </Badge>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}