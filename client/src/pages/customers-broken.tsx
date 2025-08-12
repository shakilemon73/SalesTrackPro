import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { formatCurrency, toBengaliNumber, formatBengaliPhone } from '@/lib/bengali-utils';

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      console.log('🔥 FETCHING CUSTOMERS from Supabase...');
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', '11111111-1111-1111-1111-111111111111')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching customers:', error);
        throw error;
      }

      console.log('✅ Customers fetched from Supabase:', data?.length, data);
      return data || [];
    }
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone_number && customer.phone_number.includes(searchTerm))
  );

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
                <h1 className="text-lg font-bold text-slate-900 bengali-font">গ্রাহক তালিকা</h1>
                <div className="text-sm text-slate-500 flex items-center space-x-2">
                  <span>মোট {toBengaliNumber(customers.length)} জন গ্রাহক</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">লাইভ</span>
                </div>
              </div>
            </div>
            <Link to="/customers/new">
              <Button size="sm">
                <i className="fas fa-user-plus mr-2"></i>
                নতুন
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-content content-max-width">
        {/* Search Section */}
        <div className="section-spacing">
          <Input
            placeholder="গ্রাহকের নাম বা ফোন নম্বর খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Customer List */}
        <div className="section-spacing">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-4 bg-white rounded-lg border border-slate-200 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-slate-200 w-12 h-12 rounded-xl"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                        <div className="h-3 bg-slate-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-20"></div>
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-slate-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2 bengali-font">
                {searchTerm ? "কোনো গ্রাহক পাওয়া যায়নি" : "কোনো গ্রাহক নেই"}
              </h3>
              <p className="text-slate-500 mb-6 bengali-font">
                {searchTerm 
                  ? "আপনার খোঁজা গ্রাহক খুঁজে পাওয়া যায়নি"
                  : "এখনো কোনো গ্রাহক যোগ করা হয়নি"
                }
              </p>
              {!searchTerm && (
                <Link to="/customers/new">
                  <Button>
                    <i className="fas fa-user-plus mr-2"></i>
                    প্রথম গ্রাহক যোগ করুন
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map(customer => (
                <Link key={customer.id} to={`/customers/${customer.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-user text-blue-600"></i>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 bengali-font">{customer.name}</p>
                            <p className="text-sm text-slate-500">{customer.phone_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">
                            {customer.total_credit > 0 ? `বাকি: ৳${customer.total_credit}` : 'পরিশোধিত'}
                          </p>
                          <p className="text-sm text-slate-500">
                            <i className="fas fa-chevron-right"></i>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="customer-card skeleton">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 w-12 h-12 rounded-xl"></div>
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
              </div>
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3 className="heading-3 text-gray-900 mb-2 bengali-font">
              {searchTerm ? "কোনো গ্রাহক পাওয়া যায়নি" : "কোনো গ্রাহক নেই"}
            </h3>
            <p className="body-regular text-gray-500 mb-6 bengali-font">
              {searchTerm 
                ? "আপনার খোঁজা গ্রাহক খুঁজে পাওয়া যায়নি"
                : "এখনো কোনো গ্রাহক যোগ করা হয়নি"
              }
            </p>
            <Link to="/customers/new">
              <Button className="action-btn action-btn-primary">
                <i className="fas fa-user-plus mr-2"></i>
                প্রথম গ্রাহক যোগ করুন
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer: any) => (
              <Link key={customer.id} to={`/customers/${customer.id}`}>
                <div className="customer-card fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <i className="fas fa-user text-blue-600 text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="body-large font-semibold text-gray-900 bengali-font mb-1">{customer.name}</h3>
                        <div className="flex items-center space-x-3">
                          <span className="caption text-gray-500">{customer.phone_number || 'ফোন নেই'}</span>
                          {(customer.total_credit || 0) > 0 && (
                            <span className="status-badge warning">
                              বাকি: {formatCurrency(customer.total_credit || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`currency-display text-lg ${
                        (customer.total_credit || 0) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(customer.total_credit || 0)}
                      </div>
                      <div className="caption text-gray-500 bengali-font">
                        {(customer.total_credit || 0) > 0 ? 'বাকি' : 'পরিশোধিত'}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Summary Card */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="text-center">
                <div className="body-regular text-blue-700 mb-3 bengali-font">গ্রাহক সারাংশ</div>
                <div className="responsive-grid-2 gap-4">
                  <div>
                    <div className="number-display text-blue-600 text-lg">
                      {toBengaliNumber(filteredCustomers.length)}
                    </div>
                    <div className="caption text-blue-500 bengali-font">মোট গ্রাহক</div>
                  </div>
                  <div>
                    <div className="number-display text-red-600 text-lg">
                      {formatCurrency(
                        filteredCustomers.reduce((sum, customer) => 
                          sum + (customer.total_credit || 0), 0
                        )
                      )}
                    </div>
                    <div className="caption text-red-500 bengali-font">মোট বাকি</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Link to="/customers/new">
        <div className="fab">
          <i className="fas fa-user-plus text-xl"></i>
        </div>
      </Link>
    </div>
  );
}