import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { getBengaliDate, formatCurrency, toBengaliNumber, formatBengaliPhone } from "@/lib/bengali-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => {
      console.log('🔥 CUSTOMERS PAGE: Fetching customers for user:', CURRENT_USER_ID);
      return supabaseService.getCustomers(CURRENT_USER_ID);
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  if (error) {
    console.error('❌ CUSTOMERS PAGE error:', error);
  }

  console.log('🔥 CUSTOMERS PAGE: Loaded customers:', customers.length, customers);

  const filteredCustomers = customers.filter((customer: any) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone_number && customer.phone_number.includes(searchTerm))
  );

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
              <h1 className="text-lg font-semibold">গ্রাহক তালিকা</h1>
              <p className="text-sm text-green-100">
                মোট {toBengaliNumber(customers.length)} জন গ্রাহক
              </p>
            </div>
          </div>
          <Link to="/customers/new">
            <Button className="bg-accent hover:bg-accent/90">
              <i className="fas fa-user-plus mr-2"></i>
              নতুন
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white border-b">
        <Input
          placeholder="গ্রাহকের নাম বা ফোন নম্বর খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Customer List */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-200 w-12 h-12 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? "কোনো গ্রাহক পাওয়া যায়নি" : "কোনো গ্রাহক নেই"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? "আপনার খোঁজা গ্রাহক খুঁজে পাওয়া যায়নি"
                : "এখনো কোনো গ্রাহক যোগ করা হয়নি"
              }
            </p>
            <Link to="/customers/new">
              <Button className="bg-primary">
                <i className="fas fa-user-plus mr-2"></i>
                প্রথম গ্রাহক যোগ করুন
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer: any) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-primary text-xl"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                        {customer.phone_number && (
                          <p className="text-sm text-gray-600 number-font">
                            {formatBengaliPhone(customer.phone_number)}
                          </p>
                        )}
                        {customer.address && (
                          <p className="text-xs text-gray-500 mt-1">{customer.address}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {parseFloat(customer.total_credit) > 0 ? (
                        <>
                          <p className="text-sm text-gray-600">বাকি</p>
                          <p className="font-bold text-warning number-font">
                            {formatCurrency(parseFloat(customer.total_credit))} টাকা
                          </p>
                        </>
                      ) : (
                        <p className="text-success font-medium">
                          <i className="fas fa-check-circle mr-1"></i>
                          পরিশোধিত
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        if (customer.phone_number) {
                          window.open(`tel:${customer.phone_number}`, '_self');
                        }
                      }}
                      disabled={!customer.phone_number}
                    >
                      <i className="fas fa-phone mr-2"></i>
                      কল করুন
                    </Button>
                    <Link to={`/customers/${customer.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <i className="fas fa-eye mr-2"></i>
                        বিস্তারিত
                      </Button>
                    </Link>
                    {parseFloat(customer.total_credit || '0') > 0 && (
                      <Link to={`/collection?customer=${customer.id}`} className="flex-1">
                        <Button size="sm" className="bg-success w-full">
                          <i className="fas fa-money-bill-wave mr-2"></i>
                          আদায়
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {!isLoading && filteredCustomers.length > 0 && (
        <div className="p-4 bg-white border-t sticky bottom-16">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">মোট গ্রাহক</p>
              <p className="text-lg font-bold text-primary number-font">
                {toBengaliNumber(filteredCustomers.length)} জন
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">মোট বাকি</p>
              <p className="text-lg font-bold text-warning number-font">
                {formatCurrency(
                  filteredCustomers.reduce((sum: number, customer: any) => 
                    sum + parseFloat(customer.total_credit || '0'), 0
                  )
                )} টাকা
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
