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
    <div className="page-layout">
      {/* Modern Header with Status */}
      <div className="page-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="w-10 h-10">
                  <i className="fas fa-arrow-left text-slate-600"></i>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-900 bengali-font">রিপোর্ট ও বিশ্লেষণ</h1>
                <div className="text-sm text-slate-500 flex items-center space-x-2">
                  <span>{getBengaliDate()}</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">লাইভ</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleDataExport} 
                variant="outline"
                size="sm"
              >
                <i className="fas fa-download mr-2"></i>
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-content content-max-width">
        {/* Period Selection */}
        <div className="section-spacing">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">আজকের</SelectItem>
              <SelectItem value="week">সাপ্তাহিক</SelectItem>
              <SelectItem value="month">মাসিক</SelectItem>
              <SelectItem value="year">বার্ষিক</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Revenue Summary */}
        <div className="section-spacing">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 bengali-font">মোট আয়</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-chart-line text-green-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profit Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 bengali-font">নিট লাভ</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalProfit)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-coins text-blue-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 bengali-font">মোট খরচ</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpense)}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-receipt text-red-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Due Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 bengali-font">বাকি আদায়</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalDue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-yellow-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Products and Customers */}
        <div className="section-spacing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="bengali-font">শীর্ষ পণ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 bengali-font">{product.name}</p>
                          <p className="text-sm text-slate-500">বিক্রি: {toBengaliNumber(product.quantity)}</p>
                        </div>
                        <p className="font-bold text-slate-900">{formatCurrency(product.revenue)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-4 bengali-font">কোনো পণ্য বিক্রি হয়নি</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="bengali-font">শীর্ষ গ্রাহক</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCustomers.length > 0 ? (
                    topCustomers.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 bengali-font">{customer.name}</p>
                          <p className="text-sm text-slate-500">ক্রয়: {toBengaliNumber(customer.purchases)} বার</p>
                        </div>
                        <p className="font-bold text-slate-900">{formatCurrency(customer.amount)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-4 bengali-font">কোনো গ্রাহক নেই</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}