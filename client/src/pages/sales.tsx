import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { getBengaliDate, getBengaliTime, formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import TransactionItem from "@/components/ui/transaction-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";

export default function Sales() {
  const [dateFilter, setDateFilter] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID),
  });

  const filteredSales = sales.filter((sale: any) => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      return matchesSearch && new Date(sale.saleDate).toDateString() === today;
    }
    
    return matchesSearch;
  });

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
              <h1 className="text-lg font-semibold">বিক্রয় তালিকা</h1>
              <p className="text-sm text-green-100">{getBengaliDate()}</p>
            </div>
          </div>
          <Link to="/sales/new">
            <Button className="bg-accent hover:bg-accent/90">
              <i className="fas fa-plus mr-2"></i>
              নতুন
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border-b">
        <div className="space-y-3">
          <Input
            placeholder="গ্রাহকের নাম খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">আজকের বিক্রয়</SelectItem>
              <SelectItem value="week">এই সপ্তাহ</SelectItem>
              <SelectItem value="month">এই মাস</SelectItem>
              <SelectItem value="all">সব বিক্রয়</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sales List */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse transaction-item bg-white">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-200 p-2 rounded-full w-10 h-10"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-receipt text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">কোনো বিক্রয় নেই</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? "আপনার খোঁজা গ্রাহকের কোনো বিক্রয় পাওয়া যায়নি"
                : "এখনো কোনো বিক্রয় যোগ করা হয়নি"
              }
            </p>
            <Link to="/sales/new">
              <Button className="bg-primary">
                <i className="fas fa-plus mr-2"></i>
                প্রথম বিক্রয় যোগ করুন
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSales.map((sale: any) => (
              <div key={sale.id} className="bg-white rounded-lg card-shadow">
                <TransactionItem
                  customerName={sale.customerName}
                  time={getBengaliTime(new Date(sale.createdAt))}
                  amount={`${formatCurrency(parseFloat(sale.totalAmount))} টাকা`}
                  type={sale.paymentMethod}
                  icon="fas fa-shopping-cart"
                  iconColor={sale.paymentMethod === "নগদ" ? "success" : "warning"}
                />
                
                {/* Sale Details */}
                <div className="px-4 pb-3 border-t border-gray-100 mt-3 pt-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">মোট:</span>
                      <span className="font-medium number-font ml-2">
                        {formatCurrency(parseFloat(sale.totalAmount))} টাকা
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">পেমেন্ট:</span>
                      <span className="font-medium ml-2">{sale.paymentMethod}</span>
                    </div>
                    {parseFloat(sale.dueAmount) > 0 && (
                      <div className="col-span-2">
                        <span className="text-gray-600">বাকি:</span>
                        <span className="font-medium text-warning number-font ml-2">
                          {formatCurrency(parseFloat(sale.dueAmount))} টাকা
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Items */}
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">পণ্য সমূহ:</h4>
                    <div className="space-y-1">
                      {Array.isArray(sale.items) && sale.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm text-gray-600">
                          <span>{item.productName} × {toBengaliNumber(item.quantity)}</span>
                          <span className="number-font">{formatCurrency(parseFloat(item.totalPrice))} টাকা</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {!isLoading && filteredSales.length > 0 && (
        <div className="p-4 bg-white border-t sticky bottom-16">
          <div className="flex justify-between items-center">
            <span className="font-medium">মোট বিক্রয়:</span>
            <span className="text-lg font-bold text-primary number-font">
              {formatCurrency(
                filteredSales.reduce((sum: number, sale: any) => 
                  sum + parseFloat(sale.totalAmount), 0
                )
              )} টাকা
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
