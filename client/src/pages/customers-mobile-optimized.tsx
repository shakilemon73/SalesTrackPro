import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { hybridAuth } from "@/lib/hybrid-auth";
import { useHybridCustomers, useHybridSales } from "@/hooks/use-hybrid-data";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { CustomerListSkeleton } from "@/components/loading-skeletons";
import { 
  ArrowLeft, Search, UserPlus, Phone, MapPin,
  Users, TrendingUp, AlertCircle, Eye,
  Wallet, Star, Clock
} from "lucide-react";

export default function CustomersMobileOptimized() {
  const [searchTerm, setSearchTerm] = useState("");
  const user = hybridAuth.getCurrentUser();
  const { isOnline } = useNetworkStatus();
  
  const { data: customers = [], isLoading } = useHybridCustomers();
  const { data: sales = [] } = useHybridSales();

  // Show skeleton loading state while data is loading
  if (!!user?.user_id && isLoading) {
    return <CustomerListSkeleton />;
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone_number && customer.phone_number.includes(searchTerm))
  );

  // Calculate customer stats
  const getCustomerStats = (customerId: string) => {
    const customerSales = sales.filter(sale => sale.customer_id === customerId);
    const totalPurchases = customerSales.reduce((sum, sale) => sum + parseFloat(String(sale.total_amount || '0')), 0);
    const totalDue = customerSales.reduce((sum, sale) => sum + parseFloat(String(sale.due_amount || '0')), 0);
    return { totalPurchases, totalDue, salesCount: customerSales.length };
  };

  // Customer segments
  const regularCustomers = filteredCustomers.filter(customer => {
    const stats = getCustomerStats(customer.id);
    return stats.salesCount >= 3;
  });

  const newCustomers = filteredCustomers.filter(customer => {
    const stats = getCustomerStats(customer.id);
    return stats.salesCount <= 2;
  });

  const customersWithDue = filteredCustomers.filter(customer => {
    const stats = getCustomerStats(customer.id);
    return stats.totalDue > 0;
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
      
      {/* World-Class Header Design */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </div>
              </Link>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  গ্রাহক তালিকা
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>মোট {toBengaliNumber(customers.length)} জন</span>
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <Link to="/customers/new">
              <Button className="btn-touch-target bg-emerald-500 hover:bg-emerald-600">
                <UserPlus className="w-3 h-3 mr-1" />
                নতুন
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-4 space-y-4">
        
        {/* Summary Cards - Mobile Framework Grid */}
        <div className="grid-container">
          <div className="grid-row">
            <div className="col-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3">
                <div className="text-center space-y-1">
                  <Star className="w-4 h-4 mx-auto text-blue-200" />
                  <p className="text-xs text-blue-100 bengali-font">নিয়মিত</p>
                  <p className="text-sm font-bold number-font">
                    {toBengaliNumber(regularCustomers.length)}
                  </p>
                </div>
              </Card>
            </div>

            <div className="col-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3">
                <div className="text-center space-y-1">
                  <Clock className="w-4 h-4 mx-auto text-green-200" />
                  <p className="text-xs text-green-100 bengali-font">নতুন</p>
                  <p className="text-sm font-bold number-font">
                    {toBengaliNumber(newCustomers.length)}
                  </p>
                </div>
              </Card>
            </div>

            <div className="col-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-orange-500 to-red-500 text-white p-3">
                <div className="text-center space-y-1">
                  <AlertCircle className="w-4 h-4 mx-auto text-orange-200" />
                  <p className="text-xs text-orange-100 bengali-font">বাকি</p>
                  <p className="text-sm font-bold number-font">
                    {toBengaliNumber(customersWithDue.length)}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="গ্রাহকের নাম বা ফোন নম্বর খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>

        {/* Customer List - Compact Cards */}
        <div className="space-y-2">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => {
              const stats = getCustomerStats(customer.id);
              return (
                <Card key={customer.id} className="border-0 shadow-sm">
                  <Link to={`/customers/${customer.id}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 dark:text-white bengali-font text-sm truncate">
                              {customer.name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              {customer.phone_number && (
                                <>
                                  <Phone className="w-3 h-3" />
                                  <span>{customer.phone_number}</span>
                                </>
                              )}
                              {customer.address && (
                                <>
                                  <span>•</span>
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{customer.address}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          {stats.totalPurchases > 0 && (
                            <p className="text-sm font-bold text-green-600 number-font">
                              {formatCurrency(stats.totalPurchases)}
                            </p>
                          )}
                          <div className="flex items-center space-x-1">
                            {stats.totalDue > 0 && (
                              <Badge variant="outline" className="text-xs h-4 px-1 text-red-600 border-red-200">
                                বাকি {formatCurrency(stats.totalDue)}
                              </Badge>
                            )}
                            {stats.salesCount >= 3 && (
                              <Badge variant="outline" className="text-xs h-4 px-1 text-blue-600 border-blue-200">
                                নিয়মিত
                              </Badge>
                            )}
                          </div>
                          {customer.total_credit && Number(customer.total_credit) > 0 && (
                            <p className="text-xs text-green-600 font-medium">
                              ক্রেডিট: {formatCurrency(Number(customer.total_credit))}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })
          ) : (
            <Card className="border-0 shadow-sm p-6 text-center">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 bengali-font mb-3">
                {searchTerm ? 'কোনো গ্রাহক পাওয়া যায়নি' : 'এখনো কোনো গ্রাহক যোগ করা হয়নি'}
              </p>
              <Link to="/customers/new">
                <Button size="sm" variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  প্রথম গ্রাহক যোগ করুন
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3">
            দ্রুত কাজ
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/customers/new">
              <Button variant="outline" size="sm" className="w-full h-10 flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-green-600" />
                <span className="text-xs bengali-font">নতুন গ্রাহক</span>
              </Button>
            </Link>
            
            <Link to="/collection">
              <Button variant="outline" size="sm" className="w-full h-10 flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className="text-xs bengali-font">টাকা আদায়</span>
              </Button>
            </Link>
          </div>
        </Card>

        {/* Customer Insights */}
        {customers.length > 0 && (
          <Card className="border-0 shadow-md p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>গ্রাহক পরিসংখ্যান</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span className="bengali-font">নিয়মিত গ্রাহক (৩+ ক্রয়)</span>
                <span className="font-medium">{toBengaliNumber(regularCustomers.length)} জন</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="bengali-font">বাকি রয়েছে</span>
                <span className="font-medium text-red-600">{toBengaliNumber(customersWithDue.length)} জন</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="bengali-font">মোট বাকি টাকা</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(customersWithDue.reduce((sum, customer) => {
                    const stats = getCustomerStats(customer.id);
                    return sum + stats.totalDue;
                  }, 0))}
                </span>
              </div>
            </div>
          </Card>
        )}
        
        {/* Professional bottom spacing for navigation */}
        <div className="h-24"></div>
      </div>
    </div>
  );
}