import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { getBengaliDate, formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";

export default function Reports() {
  const [reportPeriod, setReportPeriod] = useState("today");

  const { data: stats } = useQuery({
    queryKey: ['dashboard', CURRENT_USER_ID],
    queryFn: () => supabaseService.getStats(CURRENT_USER_ID),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', CURRENT_USER_ID],
    queryFn: () => supabaseService.getExpenses(CURRENT_USER_ID),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
  });

  // Calculate period-based data
  const getFilteredData = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (reportPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return sales.filter(sale => new Date(sale.sale_date) >= startDate);
  };

  const filteredSales = getFilteredData();

  // Calculate top products from actual sales data
  const getTopProducts = () => {
    const productStats: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    
    filteredSales.forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((item: any) => {
          const productName = item.productName || 'অজানা পণ্য';
          if (!productStats[productName]) {
            productStats[productName] = { name: productName, quantity: 0, revenue: 0 };
          }
          productStats[productName].quantity += parseInt(item.quantity) || 0;
          productStats[productName].revenue += parseFloat(item.totalPrice) || 0;
        });
      }
    });

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Calculate top customers from actual sales data
  const getTopCustomers = () => {
    const customerStats: { [key: string]: { name: string; purchases: number; amount: number } } = {};
    
    filteredSales.forEach(sale => {
      const customerId = sale.customer_id;
      const customerName = sale.customer_name || 'অজানা গ্রাহক';
      
      if (!customerStats[customerId]) {
        customerStats[customerId] = { name: customerName, purchases: 0, amount: 0 };
      }
      customerStats[customerId].purchases += 1;
      customerStats[customerId].amount += parseFloat(sale.total_amount) || 0;
    });

    return Object.values(customerStats)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();
  const topCustomers = getTopCustomers();

  // Calculate revenue and profit based on selected period
  const calculatePeriodStats = () => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const totalProfit = totalRevenue - totalExpense;
    
    return { totalRevenue, totalProfit, totalExpense };
  };

  const { totalRevenue, totalProfit, totalExpense } = calculatePeriodStats();
  const totalDue = stats?.pendingCollection || 0;

  const handleDataExport = () => {
    const exportData = {
      period: reportPeriod,
      stats: { totalRevenue, totalProfit, totalExpense, totalDue },
      topProducts,
      topCustomers,
      sales: filteredSales,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${reportPeriod}-${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background-app">
      {/* Premium Header */}
      <div className="header-bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <button className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20">
                <i className="fas fa-arrow-left text-white"></i>
              </button>
            </Link>
            <div>
              <h1 className="heading-2 text-white mb-0.5">রিপোর্ট ও বিশ্লেষণ</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-white/90 bengali-font">{getBengaliDate()}</p>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-200 font-semibold">ডেটা আপডেট</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleDataExport}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <i className="fas fa-download mr-2"></i>
            এক্সপোর্ট
          </Button>
        </div>
      </div>

      {/* Enhanced Period Filter */}
      <div className="p-4 bg-surface border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <i className="fas fa-calendar-alt text-blue-600"></i>
          </div>
          <div className="flex-1">
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="enhanced-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">আজকের রিপোর্ট</SelectItem>
                <SelectItem value="week">সাপ্তাহিক রিপোর্ট</SelectItem>
                <SelectItem value="month">মাসিক রিপোর্ট</SelectItem>
                <SelectItem value="year">বার্ষিক রিপোর্ট</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-4 mobile-safe-area space-y-6">
        {/* Enhanced Revenue Summary */}
        <div className="stats-grid grid-cols-2 gap-4">
          <div className="stats-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-chart-line text-white"></i>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full opacity-60"></div>
            </div>
            <h3 className="text-sm font-semibold text-green-700 mb-1 bengali-font">মোট বিক্রয়</h3>
            <p className="text-2xl font-bold text-green-800 number-font tracking-tight">
              {formatCurrency(totalRevenue)}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium bengali-font">
                {toBengaliNumber(filteredSales.length)} টি লেনদেন
              </span>
            </div>
          </div>

          <div className="stats-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-coins text-white"></i>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
            </div>
            <h3 className="text-sm font-semibold text-blue-700 mb-1 bengali-font">মোট লাভ</h3>
            <p className="text-2xl font-bold text-blue-800 number-font tracking-tight">
              {formatCurrency(totalProfit)}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-600 font-medium bengali-font">
                {totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}%` : '০%'} লাভের হার
              </span>
            </div>
          </div>

          <div className="stats-card bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-receipt text-white"></i>
              </div>
              <div className="w-2 h-2 bg-red-500 rounded-full opacity-60"></div>
            </div>
            <h3 className="text-sm font-semibold text-red-700 mb-1 bengali-font">মোট খরচ</h3>
            <p className="text-2xl font-bold text-red-800 number-font tracking-tight">
              {formatCurrency(totalExpense)}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
              <span className="text-xs text-red-600 font-medium bengali-font">
                {toBengaliNumber(expenses.length)} টি খরচ
              </span>
            </div>
          </div>

          <div className="stats-card bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-hand-holding-usd text-white"></i>
              </div>
              <div className="w-2 h-2 bg-orange-500 rounded-full opacity-60"></div>
            </div>
            <h3 className="text-sm font-semibold text-orange-700 mb-1 bengali-font">বাকি আদায়</h3>
            <p className="text-2xl font-bold text-orange-800 number-font tracking-tight">
              {formatCurrency(totalDue)}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
              <span className="text-xs text-orange-600 font-medium bengali-font">পেন্ডিং</span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <Card className="enhanced-card">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center bengali-font">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-crown text-purple-600"></i>
              </div>
              জনপ্রিয় পণ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {toBengaliNumber(index + 1)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 bengali-font">{product.name}</p>
                      <p className="text-sm text-gray-600 bengali-font">
                        বিক্রি: {toBengaliNumber(product.quantity)} টি
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 number-font">{formatCurrency(product.revenue)}</p>
                    <p className="text-sm text-gray-600 bengali-font">আয়</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-box-open text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500 bengali-font">এই সময়ে কোনো বিক্রয় নেই</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="enhanced-card">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center bengali-font">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-star text-blue-600"></i>
              </div>
              সেরা গ্রাহক
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCustomers.length > 0 ? (
              topCustomers.map((customer, index) => (
                <div key={customer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {toBengaliNumber(index + 1)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 bengali-font">{customer.name}</p>
                      <p className="text-sm text-gray-600 bengali-font">
                        {toBengaliNumber(customer.purchases)} টি কেনাকাটা
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 number-font">{formatCurrency(customer.amount)}</p>
                    <p className="text-sm text-gray-600 bengali-font">মোট কেনাকাটা</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-users text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500 bengali-font">এই সময়ে কোনো গ্রাহক ক্রয় নেই</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="responsive-grid-2 gap-4">
          <Link to="/sales">
            <Card className="enhanced-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-chart-line text-green-600 text-xl"></i>
                </div>
                <h3 className="body-large font-semibold text-gray-900 bengali-font">বিক্রয় দেখুন</h3>
                <p className="caption text-gray-500 bengali-font">সব বিক্রয়ের তথ্য</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/expenses/new">
            <Card className="enhanced-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-receipt text-red-600 text-xl"></i>
                </div>
                <h3 className="body-large font-semibold text-gray-900 bengali-font">খরচ যোগ করুন</h3>
                <p className="caption text-gray-500 bengali-font">নতুন খরচ এন্ট্রি</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}