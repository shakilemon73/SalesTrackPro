/**
 * Advanced Analytics Page
 * AI-powered business intelligence and insights
 * Beyond competitor capabilities - smart analytics for Bengali businesses
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabaseService, CURRENT_USER_ID } from '@/lib/supabase';
import { analyticsEngine } from '@/lib/advanced-analytics';
import { smartInventory } from '@/lib/smart-inventory';
import { loyaltyProgram } from '@/lib/loyalty-program';
import { formatCurrency, toBengaliNumber, getBengaliDate } from '@/lib/bengali-utils';
import { Link } from 'wouter';

export default function Analytics() {
  const [customerInsights, setCustomerInsights] = useState<any[]>([]);
  const [salesPatterns, setSalesPatterns] = useState<any[]>([]);
  const [inventoryMetrics, setInventoryMetrics] = useState<any>(null);
  const [loyaltyAnalytics, setLoyaltyAnalytics] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        console.log('🧠 ANALYTICS PAGE: Loading comprehensive analytics...');
        
        const [
          insights,
          patterns,
          inventory,
          loyalty,
          monthlyForecast
        ] = await Promise.all([
          analyticsEngine.analyzeCustomerBehavior(),
          analyticsEngine.analyzeSalesPatterns(6),
          smartInventory.getInventoryMetrics(),
          loyaltyProgram.getLoyaltyAnalytics(),
          analyticsEngine.generateBusinessForecast('month')
        ]);

        setCustomerInsights(insights);
        setSalesPatterns(patterns);
        setInventoryMetrics(inventory);
        setLoyaltyAnalytics(loyalty);
        setForecast(monthlyForecast);
        
        console.log('🧠 ANALYTICS PAGE: All analytics loaded successfully');
      } catch (error) {
        console.error('🧠 ANALYTICS PAGE: Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-app">
        <div className="text-center fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground mb-2 bengali-font">AI অ্যানালিটিক্স লোড হচ্ছে...</h3>
          <p className="text-muted-foreground text-sm">স্মার্ট ইনসাইট প্রস্তুত করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 bengali-font flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
                <i className="fas fa-brain text-white text-xl"></i>
              </div>
              AI বিজনেস অ্যানালিটিক্স
            </h1>
            <p className="text-muted-foreground bengali-font">স্মার্ট ইনসাইট এবং ভবিষ্যত পূর্বাভাস</p>
          </div>
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <i className="fas fa-robot mr-2"></i>
            AI-চালিত
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="bengali-font">সংক্ষিপ্ত</TabsTrigger>
          <TabsTrigger value="customers" className="bengali-font">গ্রাহক</TabsTrigger>
          <TabsTrigger value="sales" className="bengali-font">বিক্রয়</TabsTrigger>
          <TabsTrigger value="inventory" className="bengali-font">স্টক</TabsTrigger>
          <TabsTrigger value="forecast" className="bengali-font">পূর্বাভাস</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground bengali-font">মোট গ্রাহক</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 number-font">
                  {toBengaliNumber(customerInsights.length)}
                </div>
                <p className="text-sm text-muted-foreground bengali-font mt-1">
                  {toBengaliNumber(customerInsights.filter(c => c.riskLevel === 'high').length)} ঝুঁকিপূর্ণ
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground bengali-font">আজকের প্রবণতা</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {forecast?.trendDirection === 'up' ? '↗️' : forecast?.trendDirection === 'down' ? '↘️' : '➡️'}
                </div>
                <p className="text-sm text-muted-foreground bengali-font mt-1">
                  {forecast?.trendDirection === 'up' ? 'বৃদ্ধি পাচ্ছে' : 
                   forecast?.trendDirection === 'down' ? 'হ্রাস পাচ্ছে' : 'স্থিতিশীল'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground bengali-font">স্টক স্বাস্থ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 number-font">
                  {inventoryMetrics ? `${Math.round((inventoryMetrics.totalProducts - inventoryMetrics.lowStockCount) / inventoryMetrics.totalProducts * 100)}%` : '০%'}
                </div>
                <p className="text-sm text-muted-foreground bengali-font mt-1">
                  ভালো অবস্থায়
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground bengali-font">পূর্বাভাস আত্মবিশ্বাস</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 number-font">
                  {toBengaliNumber(forecast?.confidence || 0)}%
                </div>
                <p className="text-sm text-muted-foreground bengali-font mt-1">
                  নির্ভুলতা
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="bengali-font flex items-center">
                <i className="fas fa-lightbulb text-yellow-500 mr-3"></i>
                আজকের স্মার্ট ইনসাইট
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerInsights.slice(0, 4).map((customer, index) => (
                  <div key={customer.customerId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold bengali-font">{customer.customerName}</h4>
                      <Badge variant={customer.riskLevel === 'high' ? 'destructive' : 
                                    customer.riskLevel === 'medium' ? 'default' : 'secondary'}>
                        {customer.riskLevel === 'high' ? 'ঝুঁকিপূর্ণ' : 
                         customer.riskLevel === 'medium' ? 'মাঝামাঝি' : 'নিরাপদ'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground bengali-font mb-2">
                      মোট কেনাকাটা: {formatCurrency(customer.totalPurchases)}
                    </p>
                    <div className="space-y-1">
                      {customer.recommendedActions.slice(0, 2).map((action: string, actionIndex: number) => (
                        <p key={actionIndex} className="text-xs text-blue-600 bengali-font">
                          • {action}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Analysis Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="bengali-font">গ্রাহক আচরণ বিশ্লেষণ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerInsights.map((customer, index) => (
                  <div key={customer.customerId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg bengali-font">{customer.customerName}</h3>
                        <p className="text-sm text-muted-foreground">
                          আজীবন মূল্য: {formatCurrency(customer.lifetimeValue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={customer.riskLevel === 'high' ? 'destructive' : 
                                      customer.riskLevel === 'medium' ? 'default' : 'secondary'}>
                          {customer.riskLevel === 'high' ? 'ঝুঁকিপূর্ণ' : 
                           customer.riskLevel === 'medium' ? 'মাঝামাঝি' : 'নিরাপদ'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          ক্রেডিট স্কোর: {toBengaliNumber(customer.creditScore)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground bengali-font">মোট কেনাকাটা</p>
                        <p className="font-semibold number-font">{formatCurrency(customer.totalPurchases)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground bengali-font">গড় অর্ডার</p>
                        <p className="font-semibold number-font">{formatCurrency(customer.averageOrderValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground bengali-font">মাসিক ফ্রিকোয়েন্সি</p>
                        <p className="font-semibold number-font">{customer.purchaseFrequency.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground bengali-font">শেষ কেনাকাটা</p>
                        <p className="font-semibold text-xs">
                          {customer.lastPurchaseDate ? 
                            new Date(customer.lastPurchaseDate).toLocaleDateString('bn-BD') : 'নেই'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-2 bengali-font">সুপারিশসমূহ:</p>
                      <div className="space-y-1">
                        {customer.recommendedActions.map((action: string, actionIndex: number) => (
                          <p key={actionIndex} className="text-sm text-blue-600 bengali-font">
                            • {action}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Patterns Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="bengali-font">বিক্রয় প্যাটার্ন বিশ্লেষণ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {salesPatterns.map((pattern, index) => (
                  <div key={pattern.period} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg bengali-font">
                        {new Date(pattern.period + '-01').toLocaleDateString('bn-BD', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </h3>
                      <Badge variant="outline">
                        {toBengaliNumber(pattern.transactions)} লেনদেন
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground bengali-font">আয়</p>
                        <p className="font-bold text-green-600 number-font">{formatCurrency(pattern.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground bengali-font">লাভ</p>
                        <p className="font-bold text-blue-600 number-font">{formatCurrency(pattern.profit)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground bengali-font">গড় বাস্কেট</p>
                        <p className="font-bold text-purple-600 number-font">{formatCurrency(pattern.averageBasketSize)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground bengali-font">গ্রাহক ধরে রাখা</p>
                        <p className="font-bold text-orange-600 number-font">{pattern.customerRetention.toFixed(1)}%</p>
                      </div>
                    </div>

                    {pattern.topProducts.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2 bengali-font">জনপ্রিয় পণ্য:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {pattern.topProducts.slice(0, 3).map((product: any, productIndex: number) => (
                            <div key={productIndex} className="bg-gray-50 rounded p-2">
                              <p className="font-medium text-sm bengali-font">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {toBengaliNumber(product.quantity)}টি • {formatCurrency(product.revenue)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {inventoryMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="bengali-font">স্মার্ট ইনভেন্টরি অ্যানালিটিক্স</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 number-font">
                      {toBengaliNumber(inventoryMetrics.totalProducts)}
                    </div>
                    <p className="text-sm text-muted-foreground bengali-font">মোট পণ্য</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 number-font">
                      {toBengaliNumber(inventoryMetrics.lowStockCount)}
                    </div>
                    <p className="text-sm text-muted-foreground bengali-font">কম স্টক</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 number-font">
                      {toBengaliNumber(inventoryMetrics.fastMovingCount)}
                    </div>
                    <p className="text-sm text-muted-foreground bengali-font">দ্রুত বিক্রি</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 number-font">
                      {formatCurrency(inventoryMetrics.inventoryValue)}
                    </div>
                    <p className="text-sm text-muted-foreground bengali-font">স্টকের মূল্য</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium bengali-font">স্টক স্বাস্থ্য</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((inventoryMetrics.totalProducts - inventoryMetrics.lowStockCount) / inventoryMetrics.totalProducts * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(inventoryMetrics.totalProducts - inventoryMetrics.lowStockCount) / inventoryMetrics.totalProducts * 100} 
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium bengali-font">টার্নওভার রেট</span>
                      <span className="text-sm text-muted-foreground number-font">
                        {inventoryMetrics.turnoverRate.toFixed(1)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(inventoryMetrics.turnoverRate * 10, 100)} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6">
          {forecast && (
            <Card>
              <CardHeader>
                <CardTitle className="bengali-font flex items-center">
                  <i className="fas fa-crystal-ball text-purple-500 mr-3"></i>
                  AI ভবিষ্যত পূর্বাভাস
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 number-font mb-2">
                      {formatCurrency(forecast.predictedRevenue)}
                    </div>
                    <p className="text-sm text-blue-600 bengali-font">পূর্বাভাসিত আয়</p>
                    <p className="text-xs text-muted-foreground bengali-font mt-1">আগামী মাস</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 number-font mb-2">
                      {formatCurrency(forecast.predictedProfit)}
                    </div>
                    <p className="text-sm text-green-600 bengali-font">পূর্বাভাসিত লাভ</p>
                    <p className="text-xs text-muted-foreground bengali-font mt-1">আগামী মাস</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 number-font mb-2">
                      {toBengaliNumber(forecast.confidence)}%
                    </div>
                    <p className="text-sm text-purple-600 bengali-font">আত্মবিশ্বাস</p>
                    <p className="text-xs text-muted-foreground bengali-font mt-1">নির্ভুলতার স্তর</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 bengali-font">প্রভাবকারী কারণসমূহ:</h3>
                    <div className="space-y-2">
                      {forecast.factors.map((factor: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm bengali-font">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold bengali-font">প্রবণতার দিক</p>
                      <p className="text-sm text-muted-foreground bengali-font">
                        {forecast.trendDirection === 'up' ? 'বৃদ্ধি পাচ্ছে' : 
                         forecast.trendDirection === 'down' ? 'হ্রাস পাচ্ছে' : 'স্থিতিশীল'}
                      </p>
                    </div>
                    <div className="text-3xl">
                      {forecast.trendDirection === 'up' ? '📈' : 
                       forecast.trendDirection === 'down' ? '📉' : '📊'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="mt-8 flex justify-center">
        <Link to="/dashboard">
          <Button variant="outline" className="bengali-font">
            <i className="fas fa-arrow-left mr-2"></i>
            ড্যাশবোর্ডে ফিরুন
          </Button>
        </Link>
      </div>
    </div>
  );
}