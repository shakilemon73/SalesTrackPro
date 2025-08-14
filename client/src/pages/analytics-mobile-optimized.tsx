/**
 * Analytics Page - Advanced Business Analytics
 * Test page to verify Android scalability
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  PieChart, 
  LineChart,
  Users,
  Package,
  DollarSign,
  Calendar
} from 'lucide-react';
import { formatCurrency, toBengaliNumber } from '@/lib/bengali-utils';
import { useCustomersOffline, useSalesOffline } from '@/hooks/use-offline-data';

export default function AnalyticsMobileOptimized() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const { data: customers = [] } = useCustomersOffline();
  const { data: sales = [] } = useSalesOffline();

  // Calculate analytics data
  const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const totalCustomers = customers.length;
  const averageOrderValue = sales.length > 0 ? totalSales / sales.length : 0;
  const topCustomers = customers.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">ব্যবসা বিশ্লেষণ</h1>
            <p className="text-purple-100 text-sm">বিস্তারিত পরিসংখ্যান ও প্রতিবেদন</p>
          </div>
          <Badge variant="secondary" className="bg-purple-700">
            নতুন ফিচার
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Period Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              সময়কাল নির্বাচন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid-container">
              <div className="grid-row">
              {[
                { key: 'today', label: 'আজ' },
                { key: 'week', label: 'সপ্তাহ' },
                { key: 'month', label: 'মাস' },
                { key: 'year', label: 'বছর' }
              ].map((period) => (
                <div key={period.key} className="col-3">
                  <Button
                    variant={selectedPeriod === period.key ? "default" : "outline"}
                    onClick={() => setSelectedPeriod(period.key as any)}
                    className="btn-touch-target w-full"
                  >
                    {period.label}
                  </Button>
                </div>
              ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">মোট বিক্রয়</p>
                  <p className="text-2xl font-bold">৳{toBengaliNumber(formatCurrency(totalSales))}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+{toBengaliNumber('12')}% গত মাসের তুলনায়</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">মোট গ্রাহক</p>
                  <p className="text-2xl font-bold">{toBengaliNumber(totalCustomers.toString())}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+{toBengaliNumber('5')} নতুন গ্রাহক</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              বিশ্লেষণ চার্ট
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sales">বিক্রয়</TabsTrigger>
                <TabsTrigger value="customers">গ্রাহক</TabsTrigger>
                <TabsTrigger value="products">পণ্য</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sales" className="space-y-4">
                <div className="h-40 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">বিক্রয় ট্রেন্ড চার্ট</p>
                    <p className="text-green-600 text-sm">গত ৩০ দিনের বিক্রয় প্রবণতা</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="customers" className="space-y-4">
                <div className="h-40 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-800 font-medium">গ্রাহক বিতরণ</p>
                    <p className="text-blue-600 text-sm">এলাকা অনুযায়ী গ্রাহক বিভাগ</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-4">
                <div className="h-40 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                    <p className="text-orange-800 font-medium">পণ্য বিক্রয়</p>
                    <p className="text-orange-600 text-sm">সবচেয়ে জনপ্রিয় পণ্যের তালিকা</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>কর্মক্ষমতা সূচক</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>বিক্রয় লক্ষ্য অর্জন</span>
                <span>{toBengaliNumber('75')}%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>গ্রাহক সন্তুষ্টি</span>
                <span>{toBengaliNumber('92')}%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>স্টক দক্ষতা</span>
                <span>{toBengaliNumber('68')}%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>শীর্ষ গ্রাহকগণ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {toBengaliNumber((index + 1).toString())}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-slate-600">{customer.phone_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">৳{toBengaliNumber(formatCurrency(customer.total_credit || 0))}</p>
                    <p className="text-xs text-slate-500">বাকি</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}