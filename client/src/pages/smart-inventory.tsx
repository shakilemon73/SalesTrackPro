/**
 * Smart Inventory Management Page
 * AI-powered stock predictions and inventory optimization
 * Advanced feature beyond basic inventory tracking
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { smartInventory } from '@/lib/smart-inventory';
import { formatCurrency, toBengaliNumber, getBengaliDate } from '@/lib/bengali-utils';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function SmartInventory() {
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [reorderSuggestions, setReorderSuggestions] = useState<any[]>([]);
  const [inventoryMetrics, setInventoryMetrics] = useState<any>(null);
  const [salesVelocity, setSalesVelocity] = useState<any[]>([]);
  const [stockPredictions, setStockPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load smart inventory data
  useEffect(() => {
    const loadSmartInventory = async () => {
      setIsLoading(true);
      try {
        console.log('📦 SMART INVENTORY: Loading AI-powered inventory analytics...');
        
        const [
          alerts,
          suggestions,
          metrics,
          velocity,
          predictions
        ] = await Promise.all([
          smartInventory.generateStockAlerts(),
          smartInventory.generateReorderSuggestions(),
          smartInventory.getInventoryMetrics(),
          smartInventory.analyzeSalesVelocity(),
          smartInventory.predictStockNeeds(30)
        ]);

        setStockAlerts(alerts);
        setReorderSuggestions(suggestions);
        setInventoryMetrics(metrics);
        setSalesVelocity(velocity);
        setStockPredictions(predictions);
        
        console.log('📦 SMART INVENTORY: All analytics loaded successfully');
      } catch (error) {
        console.error('📦 SMART INVENTORY: Failed to load analytics:', error);
        toast({
          title: "ত্রুটি",
          description: "স্মার্ট ইনভেন্টরি ডেটা লোড করতে সমস্যা হয়েছে",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSmartInventory();
  }, []);

  const handleReorderNow = (suggestion: any) => {
    toast({
      title: "রিঅর্ডার সুপারিশ",
      description: `${suggestion.productName} এর জন্য ${toBengaliNumber(suggestion.suggestedOrderQuantity)}টি অর্ডার করার পরামর্শ`
    });
  };

  const handleStockAlert = (alert: any) => {
    toast({
      title: "স্টক সতর্কতা",
      description: `${alert.productName} এর স্টক ${toBengaliNumber(alert.daysUntilStockout)} দিনের মধ্যে শেষ হয়ে যাবে`
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-app">
        <div className="text-center fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground mb-2 bengali-font">স্মার্ট ইনভেন্টরি লোড হচ্ছে...</h3>
          <p className="text-muted-foreground text-sm">AI বিশ্লেষণ প্রস্তুত করা হচ্ছে...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center mr-4">
                <i className="fas fa-brain text-white text-xl"></i>
              </div>
              স্মার্ট ইনভেন্টরি
            </h1>
            <p className="text-muted-foreground bengali-font">AI-চালিত স্টক ব্যবস্থাপনা এবং পূর্বাভাস</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <i className="fas fa-robot mr-2"></i>
              স্মার্ট পূর্বাভাস
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              {toBengaliNumber(stockAlerts.length)} সতর্কতা
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts" className="bengali-font">সতর্কতা</TabsTrigger>
          <TabsTrigger value="reorder" className="bengali-font">রিঅর্ডার</TabsTrigger>
          <TabsTrigger value="velocity" className="bengali-font">বিক্রয় গতি</TabsTrigger>
          <TabsTrigger value="predictions" className="bengali-font">পূর্বাভাস</TabsTrigger>
          <TabsTrigger value="metrics" className="bengali-font">মেট্রিক্স</TabsTrigger>
        </TabsList>

        {/* Stock Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="bengali-font flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                স্টক সতর্কতা
                {stockAlerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {toBengaliNumber(stockAlerts.length)}টি
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stockAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check-circle text-2xl text-green-600"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 bengali-font">সব ঠিক আছে!</h3>
                  <p className="text-muted-foreground text-sm bengali-font">কোন স্টক সতর্কতা নেই</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stockAlerts.map((alert, index) => (
                    <div 
                      key={alert.productId} 
                      className={`border rounded-lg p-4 ${
                        alert.priority === 'critical' ? 'border-red-500 bg-red-50' :
                        alert.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                        alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg bengali-font">{alert.productName}</h3>
                          <p className="text-sm text-muted-foreground">
                            বর্তমান স্টক: {toBengaliNumber(alert.currentStock)}টি
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            alert.priority === 'critical' ? 'destructive' :
                            alert.priority === 'high' ? 'default' :
                            alert.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {alert.priority === 'critical' ? 'জরুরি' :
                             alert.priority === 'high' ? 'উচ্চ' :
                             alert.priority === 'medium' ? 'মাঝামাঝি' : 'কম'}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {toBengaliNumber(alert.daysUntilStockout)} দিন বাকি
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">প্রয়োজনীয় স্টক</p>
                          <p className="font-semibold number-font">{toBengaliNumber(alert.recommendedStock)}টি</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">ঘাটতি</p>
                          <p className="font-semibold text-red-600 number-font">
                            {toBengaliNumber(Math.max(0, alert.recommendedStock - alert.currentStock))}টি
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">করণীয়</p>
                          <p className="font-semibold text-blue-600 bengali-font text-sm">
                            {alert.action === 'reorder_now' ? 'এখনই অর্ডার করুন' :
                             alert.action === 'reorder_soon' ? 'শীঘ্রই অর্ডার করুন' :
                             alert.action === 'monitor' ? 'নজরদারি করুন' : 'অর্ডার কমান'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Progress 
                            value={(alert.currentStock / alert.recommendedStock) * 100} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1 bengali-font">
                            স্টক স্তর: {((alert.currentStock / alert.recommendedStock) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={alert.priority === 'critical' ? 'destructive' : 'outline'}
                          onClick={() => handleStockAlert(alert)}
                          className="ml-4 bengali-font"
                        >
                          {alert.action === 'reorder_now' ? 'অর্ডার করুন' : 'বিস্তারিত'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reorder Suggestions Tab */}
        <TabsContent value="reorder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="bengali-font flex items-center">
                <i className="fas fa-shopping-cart text-blue-500 mr-3"></i>
                স্মার্ট রিঅর্ডার সুপারিশ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reorderSuggestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check-circle text-2xl text-blue-600"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 bengali-font">কোন অর্ডার প্রয়োজন নেই</h3>
                  <p className="text-muted-foreground text-sm bengali-font">সব পণ্যের স্টক যথেষ্ট</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reorderSuggestions.map((suggestion, index) => (
                    <div key={suggestion.productId} className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg bengali-font">{suggestion.productName}</h3>
                          <p className="text-sm text-muted-foreground">
                            বর্তমান স্টক: {toBengaliNumber(suggestion.currentStock)}টি
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            আত্মবিশ্বাস: {Math.round(suggestion.confidenceScore * 100)}%
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            ডেলিভারি: {toBengaliNumber(suggestion.expectedDeliveryDays)} দিন
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">সুপারিশকৃত পরিমাণ</p>
                          <p className="font-bold text-blue-600 number-font text-lg">
                            {toBengaliNumber(suggestion.suggestedOrderQuantity)}টি
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">আনুমানিক খরচ</p>
                          <p className="font-semibold text-green-600 number-font">
                            {formatCurrency(suggestion.estimatedCost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">কারণ</p>
                          <p className="font-semibold text-orange-600 bengali-font text-sm">
                            {suggestion.reasonCode === 'STOCKOUT_IMMINENT' ? 'স্টক শেষ' :
                             suggestion.reasonCode === 'LOW_STOCK_WARNING' ? 'কম স্টক' :
                             suggestion.reasonCode === 'PREVENTIVE_REORDER' ? 'প্রতিরোধমূলক' : 'নিয়মিত'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">অগ্রাধিকার</p>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <i 
                                key={i}
                                className={`fas fa-star text-xs ${
                                  i < suggestion.confidenceScore * 5 ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              ></i>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-600 bengali-font">
                          এই অর্ডারটি আপনার ব্যবসার ধারাবাহিকতা নিশ্চিত করবে
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => handleReorderNow(suggestion)}
                          className="bengali-font"
                        >
                          অর্ডার করুন
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Velocity Tab */}
        <TabsContent value="velocity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="bengali-font flex items-center">
                <i className="fas fa-tachometer-alt text-green-500 mr-3"></i>
                বিক্রয় গতি বিশ্লেষণ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesVelocity.map((velocity, index) => (
                  <div key={velocity.productId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg bengali-font">{velocity.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          প্রবণতা: 
                          <span className={`ml-1 font-semibold ${
                            velocity.trend === 'increasing' ? 'text-green-600' :
                            velocity.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {velocity.trend === 'increasing' ? '↗️ বৃদ্ধি' :
                             velocity.trend === 'decreasing' ? '↘️ হ্রাস' : '➡️ স্থিতিশীল'}
                          </span>
                        </p>
                      </div>
                      <Badge variant={
                        velocity.trend === 'increasing' ? 'default' :
                        velocity.trend === 'decreasing' ? 'destructive' : 'secondary'
                      }>
                        {velocity.dailyAverage >= 2 ? 'দ্রুত বিক্রি' :
                         velocity.dailyAverage >= 0.5 ? 'মাঝামাঝি' : 'ধীর বিক্রি'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xl font-bold text-blue-600 number-font">
                          {velocity.dailyAverage.toFixed(1)}
                        </p>
                        <p className="text-sm text-blue-600 bengali-font">দৈনিক গড়</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600 number-font">
                          {velocity.weeklyAverage.toFixed(1)}
                        </p>
                        <p className="text-sm text-green-600 bengali-font">সাপ্তাহিক গড়</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-xl font-bold text-purple-600 number-font">
                          {velocity.monthlyAverage.toFixed(1)}
                        </p>
                        <p className="text-sm text-purple-600 bengali-font">মাসিক গড়</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="bengali-font flex items-center">
                <i className="fas fa-crystal-ball text-purple-500 mr-3"></i>
                ৩০ দিনের স্টক পূর্বাভাস
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockPredictions.map((prediction, index) => (
                  <div key={prediction.productId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg bengali-font">{prediction.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          বর্তমান স্টক: {toBengaliNumber(prediction.currentStock)}টি
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold number-font">
                          <span className={
                            prediction.predictedStock <= 0 ? 'text-red-600' :
                            prediction.predictedStock <= 10 ? 'text-orange-600' : 'text-green-600'
                          }>
                            {toBengaliNumber(prediction.predictedStock)}টি
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground bengali-font">৩০ দিন পর</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium bengali-font">স্টক পূর্বাভাস</span>
                        <span className="text-sm text-muted-foreground">
                          {prediction.predictedStock > 0 ? 
                            `${((prediction.predictedStock / prediction.currentStock) * 100).toFixed(0)}%` : '0%'}
                        </span>
                      </div>
                      <Progress 
                        value={prediction.predictedStock > 0 ? 
                          Math.min((prediction.predictedStock / prediction.currentStock) * 100, 100) : 0} 
                        className="h-2"
                      />
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-muted-foreground mb-1 bengali-font">সুপারিশ:</p>
                      <p className="text-sm bengali-font">{prediction.recommendedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          {inventoryMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="bengali-font flex items-center">
                  <i className="fas fa-chart-bar text-indigo-500 mr-3"></i>
                  ইনভেন্টরি পারফরম্যান্স মেট্রিক্স
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 number-font mb-2">
                      {toBengaliNumber(inventoryMetrics.totalProducts)}
                    </div>
                    <p className="text-sm text-blue-600 bengali-font">মোট পণ্য</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 number-font mb-2">
                      {toBengaliNumber(inventoryMetrics.lowStockCount)}
                    </div>
                    <p className="text-sm text-red-600 bengali-font">কম স্টক</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 number-font mb-2">
                      {toBengaliNumber(inventoryMetrics.fastMovingCount)}
                    </div>
                    <p className="text-sm text-green-600 bengali-font">দ্রুত বিক্রি</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 number-font mb-2">
                      {toBengaliNumber(inventoryMetrics.slowMovingCount)}
                    </div>
                    <p className="text-sm text-purple-600 bengali-font">ধীর বিক্রি</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3 bengali-font">ইনভেন্টরি মূল্য</h3>
                    <p className="text-2xl font-bold text-green-600 number-font mb-2">
                      {formatCurrency(inventoryMetrics.inventoryValue)}
                    </p>
                    <p className="text-sm text-muted-foreground bengali-font">
                      মোট স্টকের বাজার মূল্য
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3 bengali-font">টার্নওভার রেট</h3>
                    <p className="text-2xl font-bold text-blue-600 number-font mb-2">
                      {inventoryMetrics.turnoverRate.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground bengali-font">
                      মাসিক গড় বিক্রয় গতি
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <h3 className="font-semibold mb-3 bengali-font flex items-center">
                    <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    স্মার্ট সুপারিশ
                  </h3>
                  <div className="space-y-2">
                    {inventoryMetrics.lowStockCount > 0 && (
                      <p className="text-sm text-orange-600 bengali-font">
                        • {toBengaliNumber(inventoryMetrics.lowStockCount)}টি পণ্যের স্টক কম - দ্রুত রিঅর্ডার করুন
                      </p>
                    )}
                    {inventoryMetrics.slowMovingCount > 0 && (
                      <p className="text-sm text-blue-600 bengali-font">
                        • {toBengaliNumber(inventoryMetrics.slowMovingCount)}টি ধীর বিক্রির পণ্য - বিশেষ অফার দিন
                      </p>
                    )}
                    {inventoryMetrics.fastMovingCount > 0 && (
                      <p className="text-sm text-green-600 bengali-font">
                        • {toBengaliNumber(inventoryMetrics.fastMovingCount)}টি দ্রুত বিক্রির পণ্য - স্টক বাড়ান
                      </p>
                    )}
                    {inventoryMetrics.turnoverRate < 1 && (
                      <p className="text-sm text-purple-600 bengali-font">
                        • টার্নওভার রেট কম - মার্কেটিং কৌশল উন্নত করুন
                      </p>
                    )}
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