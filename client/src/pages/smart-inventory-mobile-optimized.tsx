import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabaseService, CURRENT_USER_ID } from '@/lib/supabase';
import { formatCurrency, toBengaliNumber, getBengaliDate } from '@/lib/bengali-utils';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, AlertTriangle, TrendingUp, TrendingDown,
  ArrowLeft, Brain, Zap, Target, ShoppingCart,
  CheckCircle, Clock, ArrowRight, BarChart3
} from 'lucide-react';

export default function SmartInventoryMobileOptimized() {
  const { toast } = useToast();

  // Real data from Supabase
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', CURRENT_USER_ID],
    queryFn: () => supabaseService.getProducts(CURRENT_USER_ID),
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID, 100),
  });

  // Smart inventory analysis based on real data
  const smartAnalysis = {
    criticalStock: products.filter((p: any) => p.current_stock === 0),
    lowStock: products.filter((p: any) => p.current_stock > 0 && p.current_stock <= p.min_stock_level),
    goodStock: products.filter((p: any) => p.current_stock > p.min_stock_level),
    reorderSuggestions: products
      .filter((p: any) => p.current_stock <= p.min_stock_level * 1.5)
      .map((p: any) => ({
        ...p,
        suggestedQuantity: Math.max(p.min_stock_level * 3, 20),
        urgency: p.current_stock === 0 ? 'critical' : 'medium'
      })),
    fastMoving: products
      .filter((p: any) => {
        const productSales = sales.filter((s: any) => 
          s.items?.some((item: any) => item.productName === p.name)
        );
        return productSales.length > 2;
      }),
    slowMoving: products
      .filter((p: any) => {
        const productSales = sales.filter((s: any) => 
          s.items?.some((item: any) => item.productName === p.name)
        );
        return productSales.length <= 1 && p.current_stock > p.min_stock_level;
      })
  };

  const isLoading = productsLoading || salesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 bengali-font">স্মার্ট অ্যানালিসিস চলছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Link to="/inventory">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 bengali-font">স্মার্ট ইনভেন্টরি</h1>
            <p className="text-sm text-gray-600 bengali-font">AI-চালিত স্টক ব্যবস্থাপনা</p>
          </div>
          <Brain className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      {/* AI Insights Dashboard */}
      <div className="p-4 pb-6">
        {/* Smart Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 opacity-80" />
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">জরুরি অ্যালার্ট</p>
                <p className="text-xl font-bold">{toBengaliNumber(smartAnalysis.criticalStock.length)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 opacity-80" />
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">কম স্টক</p>
                <p className="text-xl font-bold">{toBengaliNumber(smartAnalysis.lowStock.length)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">দ্রুত বিক্রি</p>
                <p className="text-xl font-bold">{toBengaliNumber(smartAnalysis.fastMoving.length)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 opacity-80" />
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">স্বাভাবিক স্টক</p>
                <p className="text-xl font-bold">{toBengaliNumber(smartAnalysis.goodStock.length)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Friendly Tabs */}
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="alerts" className="text-sm bengali-font">অ্যালার্ট</TabsTrigger>
            <TabsTrigger value="reorder" className="text-sm bengali-font">অর্ডার</TabsTrigger>
            <TabsTrigger value="trends" className="text-sm bengali-font">ট্রেন্ড</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            {/* Critical Stock Alerts */}
            {smartAnalysis.criticalStock.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg bengali-font flex items-center text-red-700">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    জরুরি: স্টক শেষ
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {smartAnalysis.criticalStock.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                        <div>
                          <p className="font-semibold text-sm bengali-font">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="mb-1">
                            স্টক নেই
                          </Badge>
                          <p className="text-xs text-gray-600">
                            মূল্য: {formatCurrency(product.selling_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Low Stock Warnings */}
            {smartAnalysis.lowStock.length > 0 && (
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg bengali-font flex items-center text-orange-700">
                    <Clock className="w-5 h-5 mr-2" />
                    সতর্কতা: কম স্টক
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {smartAnalysis.lowStock.slice(0, 5).map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                        <div>
                          <p className="font-semibold text-sm bengali-font">{product.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress 
                              value={(product.current_stock / product.min_stock_level) * 100} 
                              className="w-16 h-2"
                            />
                            <span className="text-xs text-orange-600">
                              {toBengaliNumber(product.current_stock)}/{toBengaliNumber(product.min_stock_level)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {toBengaliNumber(product.current_stock)} {product.unit}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reorder" className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg bengali-font flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                  AI সুপারিশ: পুনঃঅর্ডার
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {smartAnalysis.reorderSuggestions.slice(0, 6).map((product: any) => (
                    <div key={product.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm bengali-font">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.category}</p>
                        </div>
                        <Badge 
                          variant={product.urgency === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {product.urgency === 'critical' ? 'জরুরি' : 'সাধারণ'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="text-center">
                          <p className="text-gray-600">বর্তমান</p>
                          <p className="font-bold">{toBengaliNumber(product.current_stock)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">সুপারিশ</p>
                          <p className="font-bold text-blue-600">{toBengaliNumber(product.suggestedQuantity)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">আনুমানিক খরচ</p>
                          <p className="font-bold text-green-600">
                            {formatCurrency(product.buying_price * product.suggestedQuantity)}
                          </p>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                        onClick={() => toast({
                          title: "অর্ডার প্রস্তুত!",
                          description: `${product.name} এর জন্য ${toBengaliNumber(product.suggestedQuantity)} ${product.unit} অর্ডার তৈরি করা হয়েছে।`,
                        })}
                      >
                        অর্ডার তৈরি করুন
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            {/* Fast Moving Products */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg bengali-font flex items-center text-green-600">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  দ্রুত বিক্রি হওয়া পণ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {smartAnalysis.fastMoving.slice(0, 4).map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-sm bengali-font">{product.name}</p>
                        <p className="text-xs text-gray-600">বর্তমান স্টক: {toBengaliNumber(product.current_stock)}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 mb-1">
                          জনপ্রিয়
                        </Badge>
                        <p className="text-xs text-green-600 font-medium">
                          মুনাফা: {formatCurrency(product.selling_price - product.buying_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Slow Moving Products */}
            {smartAnalysis.slowMoving.length > 0 && (
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg bengali-font flex items-center text-gray-600">
                    <TrendingDown className="w-5 h-5 mr-2" />
                    ধীর গতির পণ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {smartAnalysis.slowMoving.slice(0, 3).map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm bengali-font">{product.name}</p>
                          <p className="text-xs text-gray-600">অতিরিক্ত স্টক: {toBengaliNumber(product.current_stock - product.min_stock_level)}</p>
                        </div>
                        <Badge variant="outline" className="text-gray-600">
                          ছাড় বিবেচনা করুন
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/inventory">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-full">
              <Package className="w-4 h-4 mr-2" />
              স্টক দেখুন
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full rounded-full"
            onClick={() => toast({
              title: "AI রিপোর্ট!",
              description: "বিস্তারিত AI বিশ্লেষণ শীঘ্রই আসছে।",
            })}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI রিপোর্ট
          </Button>
        </div>
      </div>

      {/* Bottom Spacing for Navigation */}
      <div className="h-24"></div>
    </div>
  );
}