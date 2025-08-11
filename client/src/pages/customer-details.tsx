import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { getBengaliDate, formatCurrency, toBengaliNumber, formatBengaliPhone } from "@/lib/bengali-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";

export default function CustomerDetails() {
  const [match, params] = useRoute("/customers/:id");
  const customerId = params?.id;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => supabaseService.getCustomer(customerId!),
    enabled: !!customerId,
  });

  const { data: customerSales = [] } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID, 'customer', customerId],
    queryFn: async () => {
      const sales = await supabaseService.getSales(CURRENT_USER_ID);
      return sales.filter((sale: any) => sale.customer_id === customerId);
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-times text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">গ্রাহক পাওয়া যায়নি</h3>
          <Link to="/customers">
            <Button>গ্রাহক তালিকায় ফিরুন</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPurchases = customerSales.reduce((sum: number, sale: any) => 
    sum + parseFloat(sale.total_amount || '0'), 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/customers">
              <button className="p-2">
                <i className="fas fa-arrow-left"></i>
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">গ্রাহকের বিস্তারিত</h1>
              <p className="text-sm text-green-100">{getBengaliDate()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Customer Info */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-user text-primary text-xl"></i>
              </div>
              <div>
                <h2 className="text-xl">{customer.name}</h2>
                {customer.phone_number && (
                  <p className="text-sm text-gray-600 number-font">
                    {formatBengaliPhone(customer.phone_number)}
                  </p>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customer.address && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-1">ঠিকানা</h4>
                <p className="text-gray-600">{customer.address}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">মোট কেনাকাটা</p>
                <p className="text-lg font-bold text-primary number-font">
                  {formatCurrency(totalPurchases)}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">বর্তমান বাকি</p>
                <p className="text-lg font-bold text-warning number-font">
                  {formatCurrency(parseFloat(customer.total_credit || '0'))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button 
            onClick={() => {
              if (customer.phone_number) {
                window.open(`tel:${customer.phone_number}`, '_self');
              }
            }}
            disabled={!customer.phone_number}
            className="bg-secondary"
          >
            <i className="fas fa-phone mr-2"></i>
            কল করুন
          </Button>
          {parseFloat(customer.total_credit || '0') > 0 && (
            <Link to={`/collection?customer=${customer.id}`}>
              <Button className="bg-success w-full">
                <i className="fas fa-money-bill-wave mr-2"></i>
                বাকি আদায়
              </Button>
            </Link>
          )}
        </div>

        {/* Sales History */}
        <Card>
          <CardHeader>
            <CardTitle>ক্রয়ের ইতিহাস</CardTitle>
          </CardHeader>
          <CardContent>
            {customerSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-shopping-cart text-3xl mb-2 text-gray-300"></i>
                <p>এখনো কোনো ক্রয় নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerSales.slice(0, 10).map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(sale.sale_date).toLocaleDateString('bn-BD')}</p>
                      <p className="text-sm text-gray-600">{sale.payment_method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold number-font">{formatCurrency(parseFloat(sale.total_amount))}</p>
                      {parseFloat(sale.due_amount || '0') > 0 && (
                        <p className="text-sm text-warning number-font">
                          বাকি: {formatCurrency(parseFloat(sale.due_amount))}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}