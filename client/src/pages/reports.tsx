import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { getBengaliDate, formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEMO_USER_ID = "demo-user-123";

export default function Reports() {
  const [reportPeriod, setReportPeriod] = useState("today");

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard', DEMO_USER_ID],
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales', DEMO_USER_ID],
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['/api/expenses', DEMO_USER_ID],
  });

  const todayRevenue = stats?.todaySales || 0;
  const todayProfit = stats?.todayProfit || 0;
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
                  {formatCurrency(todayRevenue)} টাকা
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg">
                <span className="text-gray-700">মোট লাভ</span>
                <span className="font-bold text-success number-font">
                  {formatCurrency(todayProfit)} টাকা
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
              {[
                { name: "চাল (বাসমতী)", sales: 25, revenue: 2500 },
                { name: "ডাল (মসুর)", sales: 18, revenue: 1800 },
                { name: "তেল (সয়াবিন)", sales: 15, revenue: 1950 }
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold number-font">{toBengaliNumber(index + 1)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {toBengaliNumber(product.sales)} বার বিক্রি
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-primary number-font">
                    {formatCurrency(product.revenue)} টাকা
                  </span>
                </div>
              ))}
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
              {[
                { name: "রহিম উদ্দিন", purchases: 12, amount: 5600 },
                { name: "করিম মিয়া", purchases: 8, amount: 3200 },
                { name: "সালমা খাতুন", purchases: 6, amount: 2800 }
              ].map((customer, index) => (
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-area text-accent mr-2"></i>
              মাসিক প্রবণতা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { month: "জানুয়ারি", sales: 45000, profit: 8500 },
                { month: "ফেব্রুয়ারি", sales: 52000, profit: 9200 },
                { month: "মার্চ", sales: 48000, profit: 8800 },
                { month: "এপ্রিল", sales: 55000, profit: 10200 }
              ].map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{data.month}</span>
                    <span className="text-sm text-gray-600">
                      লাভ: {formatCurrency(data.profit)} টাকা
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(data.sales / 60000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm number-font text-gray-600">
                    {formatCurrency(data.sales)} টাকা
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="bg-primary" asChild>
            <Link to="/sales">
              <i className="fas fa-list mr-2"></i>
              বিক্রয় দেখুন
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
