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
    const totalProfit = filteredSales.reduce((sum, sale) => {
      if (sale.items && Array.isArray(sale.items)) {
        return sum + sale.items.reduce((itemSum: number, item: any) => {
          const quantity = parseInt(item.quantity) || 0;
          const sellingPrice = parseFloat(item.unitPrice) || 0;
          // Simplified profit calculation - would need product buying price for accurate calculation
          return itemSum + (quantity * sellingPrice * 0.2); // Assuming 20% profit margin
        }, 0);
      }
      return sum;
    }, 0);
    
    return { totalRevenue, totalProfit };
  };

  const { totalRevenue, totalProfit } = calculatePeriodStats();
  const totalDue = stats?.pendingCollection || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <button className="p-2">
                <i className="fas fa-arrow-left"></i>
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">রিপোর্ট ও বিশ্লেষণ</h1>
              <p className="text-sm text-green-100">{getBengaliDate()}</p>
            </div>
          </div>
          <Button variant="outline" className="text-primary bg-white">
            <i className="fas fa-download mr-2"></i>
            এক্সপোর্ট
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="p-4 bg-white border-b">
        <Select value={reportPeriod} onValueChange={setReportPeriod}>
          <SelectTrigger>
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

      <div className="p-4 space-y-6">
        {/* Revenue Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-line text-primary mr-2"></i>
              আয়ের সারসংক্ষেপ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                <span className="text-gray-700">মোট বিক্রয়</span>
                <span className="font-bold text-primary number-font">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg">
                <span className="text-gray-700">মোট লাভ</span>
                <span className="font-bold text-success number-font">
                  {formatCurrency(totalProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-warning/5 rounded-lg">
                <span className="text-gray-700">বাকি টাকা</span>
                <span className="font-bold text-warning number-font">
                  {formatCurrency(totalDue)} টাকা
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-trophy text-warning mr-2"></i>
              সবচেয়ে বেশি বিক্রিত পণ্য
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <i className="fas fa-box text-3xl mb-2 text-gray-300"></i>
                  <p>এই সময়ের জন্য কোনো বিক্রয় ডেটা নেই</p>
                </div>
              ) : (
                topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold number-font">{toBengaliNumber(index + 1)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {toBengaliNumber(product.quantity)} পিস বিক্রি
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-primary number-font">
                    {formatCurrency(product.revenue)} টাকা
                  </span>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-users text-secondary mr-2"></i>
              সেরা গ্রাহক
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <i className="fas fa-users text-3xl mb-2 text-gray-300"></i>
                  <p>এই সময়ের জন্য কোনো গ্রাহক ডেটা নেই</p>
                </div>
              ) : (
                topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-secondary/10 w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="text-secondary font-bold number-font">{toBengaliNumber(index + 1)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-600">
                        {toBengaliNumber(customer.purchases)} বার কিনেছেন
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-secondary number-font">
                    {formatCurrency(customer.amount)} টাকা
                  </span>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Period Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-area text-accent mr-2"></i>
              সময়কাল সংক্ষেপ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary number-font">
                  {toBengaliNumber(filteredSales.length)}
                </div>
                <div className="text-sm text-gray-600">মোট লেনদেন</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-secondary number-font">
                  {toBengaliNumber(topCustomers.length)}
                </div>
                <div className="text-sm text-gray-600">সক্রিয় গ্রাহক</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="bg-primary" asChild>
            <Link to="/transactions">
              <i className="fas fa-list mr-2"></i>
              লেনদেন দেখুন
            </Link>
          </Button>
          <Button variant="outline" className="border-primary text-primary">
            <i className="fas fa-print mr-2"></i>
            প্রিন্ট করুন
          </Button>
        </div>
      </div>
    </div>
  );
}
