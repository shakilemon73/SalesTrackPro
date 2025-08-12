import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabaseService, CURRENT_USER_ID } from '@/lib/supabase';
import { formatCurrency, toBengaliNumber, getBengaliDate } from '@/lib/bengali-utils';
import { Link } from 'wouter';
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, 
  Package, DollarSign, Calendar, BarChart3,
  ArrowLeft, Eye, Target, Crown
} from 'lucide-react';

export default function AnalyticsMobileOptimized() {
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  
  // Simplified analytics data from Supabase
  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID, 50),
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', CURRENT_USER_ID],
    queryFn: () => supabaseService.getProducts(CURRENT_USER_ID),
  });

  // Calculate analytics from real data
  const analytics = {
    totalSales: sales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0),
    totalProfit: sales.reduce((sum: number, sale: any) => sum + (sale.total_amount * 0.3), 0), // Assuming 30% profit margin
    activeCustomers: customers.length,
    totalProducts: products.length,
    avgOrderValue: sales.length > 0 ? sales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0) / sales.length : 0,
    topCustomers: customers.slice(0, 3),
    recentSales: sales.slice(0, 5),
    lowStockProducts: products.filter((p: any) => p.current_stock <= p.min_stock_level),
  };

  const isLoading = salesLoading || customersLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 bengali-font">অ্যানালিটিক্স লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 bengali-font">বিজনেস অ্যানালিটিক্স</h1>
            <p className="text-sm text-gray-600 bengali-font">ব্যবসায়িক অন্তর্দৃষ্টি ও পরিসংখ্যান</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards - Mobile Optimized */}
      <div className="p-4 pb-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">মোট বিক্রয়</p>
                <p className="text-xl font-bold">{formatCurrency(analytics.totalSales)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">মোট মুনাফা</p>
                <p className="text-xl font-bold">{formatCurrency(analytics.totalProfit)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <Eye className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">গ্রাহক সংখ্যা</p>
                <p className="text-xl font-bold">{toBengaliNumber(analytics.activeCustomers)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">গড় অর্ডার</p>
                <p className="text-xl font-bold">{formatCurrency(analytics.avgOrderValue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Friendly Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-sm bengali-font">সামগ্রিক</TabsTrigger>
            <TabsTrigger value="customers" className="text-sm bengali-font">গ্রাহক</TabsTrigger>
            <TabsTrigger value="products" className="text-sm bengali-font">পণ্য</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Recent Sales */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg bengali-font flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  সাম্প্রতিক বিক্রয়
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {analytics.recentSales.map((sale: any) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-sm bengali-font">{sale.customer_name}</p>
                        <p className="text-xs text-gray-600">{getBengaliDate(new Date(sale.created_at))}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(sale.total_amount)}</p>
                        <Badge variant="outline" className="text-xs">
                          {sale.payment_method}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stock Alerts */}
            {analytics.lowStockProducts.length > 0 && (
              <Card className="bg-white border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg bengali-font flex items-center text-orange-600">
                    <Package className="w-5 h-5 mr-2" />
                    স্টক সতর্কতা
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {analytics.lowStockProducts.slice(0, 3).map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm bengali-font">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {toBengaliNumber(product.current_stock)} {product.unit}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg bengali-font flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                  শীর্ষ গ্রাহকবৃন্দ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {analytics.topCustomers.map((customer: any, index: number) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm bengali-font">{customer.name}</p>
                          <p className="text-xs text-gray-600">{customer.phone}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        নিয়মিত গ্রাহক
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg bengali-font flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  পণ্য পরিসংখ্যান
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{toBengaliNumber(analytics.totalProducts)}</p>
                    <p className="text-sm text-blue-700 bengali-font">মোট পণ্য</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{toBengaliNumber(analytics.lowStockProducts.length)}</p>
                    <p className="text-sm text-red-700 bengali-font">কম স্টক</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {products.slice(0, 5).map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-sm bengali-font">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(product.selling_price)}</p>
                        <p className="text-xs text-gray-600">
                          স্টক: {toBengaliNumber(product.current_stock)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/reports">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-full">
              <BarChart3 className="w-4 h-4 mr-2" />
              বিস্তারিত রিপোর্ট
            </Button>
          </Link>
          <Link to="/inventory">
            <Button variant="outline" className="w-full rounded-full">
              <Package className="w-4 h-4 mr-2" />
              স্টক ম্যানেজমেন্ট
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom Spacing for Navigation */}
      <div className="h-24"></div>
    </div>
  );
}