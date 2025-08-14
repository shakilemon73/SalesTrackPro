import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { getBengaliDate, formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hybridAuth } from "@/lib/hybrid-auth";
import { useHybridStats, useHybridSales, useHybridCustomers } from "@/hooks/use-hybrid-data";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { 
  ArrowLeft, TrendingUp, TrendingDown, Calendar,
  BarChart3, PieChart, Users, Package,
  Download, Eye, Clock, DollarSign,
  Activity, Target, Star, Award
} from "lucide-react";

export default function ReportsMobileOptimized() {
  const [reportPeriod, setReportPeriod] = useState("today");
  const [activeTab, setActiveTab] = useState("overview");
  const user = hybridAuth.getCurrentUser();
  const { isOnline } = useNetworkStatus();

  const { data: stats } = useHybridStats();
  const { data: sales = [] } = useHybridSales();
  const { data: customers = [] } = useHybridCustomers();
  
  // For now, use empty array for expenses
  const expenses: any[] = [];

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

    const filteredSales = sales.filter(sale => new Date(sale.sale_date) >= startDate);
    const filteredExpenses = expenses.filter(expense => new Date(expense.expense_date) >= startDate);
    
    return { filteredSales, filteredExpenses };
  };

  const { filteredSales, filteredExpenses } = getFilteredData();

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

  const topProducts = getTopProducts();

  // Calculate top customers by purchase value
  const getTopCustomers = () => {
    const customerStats: { [key: string]: { name: string; totalSpent: number; orderCount: number } } = {};
    
    filteredSales.forEach(sale => {
      const customerId = sale.customer_id;
      const customerName = sale.customer_name;
      const amount = parseFloat(sale.total_amount || 0);
      
      if (!customerStats[customerId]) {
        customerStats[customerId] = { name: customerName, totalSpent: 0, orderCount: 0 };
      }
      customerStats[customerId].totalSpent += amount;
      customerStats[customerId].orderCount += 1;
    });

    return Object.values(customerStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  };

  const topCustomers = getTopCustomers();

  // Period calculations
  const periodTotals = {
    sales: filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0),
    expenses: filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0),
    transactions: filteredSales.length + filteredExpenses.length,
    get profit() { return this.sales - this.expenses; },
    get margin() { return this.sales > 0 ? (this.profit / this.sales) * 100 : 0; }
  };

  const getPeriodLabel = () => {
    switch (reportPeriod) {
      case 'today': return 'আজকের';
      case 'week': return 'সাপ্তাহিক';
      case 'month': return 'মাসিক';
      case 'year': return 'বার্ষিক';
      default: return 'আজকের';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      
      {/* Compact Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  ব্যবসায়িক রিপোর্ট
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <BarChart3 className="w-3 h-3" />
                  <span>{getPeriodLabel()} বিশ্লেষণ</span>
                </div>
              </div>
            </div>
            
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">আজ</SelectItem>
                <SelectItem value="week">সপ্তাহ</SelectItem>
                <SelectItem value="month">মাস</SelectItem>
                <SelectItem value="year">বছর</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-4 space-y-4">
        
        {/* Period Summary Cards - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-green-100 bengali-font">বিক্রয়</p>
                <TrendingUp className="w-4 h-4 text-green-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {formatCurrency(periodTotals.sales)}
              </p>
              <p className="text-green-200 text-xs">
                {toBengaliNumber(filteredSales.length)}টি লেনদেন
              </p>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-red-500 to-rose-600 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-red-100 bengali-font">খরচ</p>
                <TrendingDown className="w-4 h-4 text-red-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {formatCurrency(periodTotals.expenses)}
              </p>
              <p className="text-red-200 text-xs">
                {toBengaliNumber(filteredExpenses.length)}টি খরচ
              </p>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-100 bengali-font">লাভ</p>
                <Target className="w-4 h-4 text-blue-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {formatCurrency(periodTotals.profit)}
              </p>
              <p className="text-blue-200 text-xs">
                {toBengaliNumber(periodTotals.margin.toFixed(1))}% মার্জিন
              </p>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-violet-600 text-white p-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-purple-100 bengali-font">গ্রাহক</p>
                <Users className="w-4 h-4 text-purple-200" />
              </div>
              <p className="text-xl font-bold number-font">
                {toBengaliNumber(customers.length)}
              </p>
              <p className="text-purple-200 text-xs">
                সক্রিয় গ্রাহক
              </p>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <Button
            size="sm"
            variant={activeTab === "overview" ? "default" : "ghost"}
            className={`flex-1 h-8 text-xs ${activeTab === "overview" ? "bg-white shadow-sm" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Activity className="w-3 h-3 mr-1" />
            সারসংক্ষেপ
          </Button>
          <Button
            size="sm"
            variant={activeTab === "products" ? "default" : "ghost"}
            className={`flex-1 h-8 text-xs ${activeTab === "products" ? "bg-white shadow-sm" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package className="w-3 h-3 mr-1" />
            পণ্য
          </Button>
          <Button
            size="sm"
            variant={activeTab === "customers" ? "default" : "ghost"}
            className={`flex-1 h-8 text-xs ${activeTab === "customers" ? "bg-white shadow-sm" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            <Users className="w-3 h-3 mr-1" />
            গ্রাহক
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            <Card className="border-0 shadow-md p-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3 flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>{getPeriodLabel()} পারফরমেন্স</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 bengali-font">মোট লেনদেন</span>
                  <span className="font-medium">{toBengaliNumber(periodTotals.transactions)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 bengali-font">গড় বিক্রয়</span>
                  <span className="font-medium">
                    {formatCurrency(filteredSales.length > 0 ? periodTotals.sales / filteredSales.length : 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 bengali-font">লাভের হার</span>
                  <span className={`font-medium ${periodTotals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {toBengaliNumber(periodTotals.margin.toFixed(1))}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Business Health */}
            <Card className="border-0 shadow-md p-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>ব্যবসার অবস্থা</span>
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${periodTotals.profit > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs bengali-font">
                    {periodTotals.profit > 0 ? 'লাভজনক অবস্থায়' : 'লোকসানে'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${filteredSales.length > 5 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs bengali-font">
                    {filteredSales.length > 5 ? 'ভাল বিক্রয় হচ্ছে' : 'বিক্রয় বাড়ানো প্রয়োজন'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${customers.length > 10 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs bengali-font">
                    {customers.length > 10 ? 'ভাল গ্রাহক বেস' : 'আরও গ্রাহক প্রয়োজন'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "products" && (
          <Card className="border-0 shadow-md p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3 flex items-center space-x-2">
              <Award className="w-4 h-4 text-orange-600" />
              <span>শীর্ষ বিক্রিত পণ্য</span>
            </h3>
            <div className="space-y-2">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white bengali-font">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {toBengaliNumber(product.quantity)} বিক্রি
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-green-600 number-font">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 bengali-font">কোনো পণ্য বিক্রয় নেই</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === "customers" && (
          <Card className="border-0 shadow-md p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3 flex items-center space-x-2">
              <Star className="w-4 h-4 text-blue-600" />
              <span>শীর্ষ গ্রাহক</span>
            </h3>
            <div className="space-y-2">
              {topCustomers.length > 0 ? (
                topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white bengali-font">
                          {customer.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {toBengaliNumber(customer.orderCount)} অর্ডার
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-green-600 number-font">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 bengali-font">কোনো গ্রাহক ডেটা নেই</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border-0 shadow-md p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3">
            দ্রুত কাজ
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/transactions">
              <Button variant="outline" size="sm" className="w-full h-10 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-xs bengali-font">লেনদেন দেখুন</span>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-10 flex items-center space-x-2"
              onClick={() => {/* TODO: Generate PDF report */}}
            >
              <Download className="w-4 h-4 text-green-600" />
              <span className="text-xs bengali-font">PDF রিপোর্ট</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}