import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { getBengaliDate, formatCurrency, toBengaliNumber, formatBengaliPhone } from "@/lib/bengali-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";

export default function CustomerDetails() {
  const [match, params] = useRoute("/customers/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const customerId = params?.id;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone_number: "",
    address: "",
  });

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => supabaseService.getCustomer(customerId!),
    enabled: !!customerId,
  });

  // Update edit form when customer data is loaded
  useEffect(() => {
    if (customer) {
      setEditForm({
        name: customer.name || "",
        phone_number: customer.phone_number || "",
        address: customer.address || "",
      });
    }
  }, [customer]);

  const { data: customerSales = [] } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID, 'customer', customerId],
    queryFn: async () => {
      const sales = await supabaseService.getSales(CURRENT_USER_ID);
      return sales.filter((sale: any) => sale.customer_id === customerId);
    },
    enabled: !!customerId,
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (updateData: any) => {
      return await supabaseService.updateCustomer(customerId!, updateData);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "গ্রাহকের তথ্য আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "ত্রুটি!",
        description: "গ্রাহকের তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      console.error('Update customer error:', error);
    },
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async () => {
      return await supabaseService.deleteCustomer(customerId!);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "গ্রাহক মুছে ফেলা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setLocation("/customers");
    },
    onError: (error) => {
      toast({
        title: "ত্রুটি!",
        description: "গ্রাহক মুছে ফেলতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      console.error('Delete customer error:', error);
    },
  });

  const handleUpdateSubmit = () => {
    updateCustomerMutation.mutate(editForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-app flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600 bengali-font">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background-app flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-slash text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 bengali-font">গ্রাহক পাওয়া যায়নি</p>
          <Link to="/customers">
            <Button className="mt-4">গ্রাহক তালিকায় ফিরুন</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate customer statistics
  const totalPurchases = customerSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || '0'), 0);
  const totalDue = customerSales.reduce((sum, sale) => sum + parseFloat(sale.due_amount || '0'), 0);
  const totalPaid = customerSales.reduce((sum, sale) => sum + parseFloat(sale.paid_amount || '0'), 0);
  const recentSales = customerSales.slice(0, 5);

  return (
    <div className="min-h-screen bg-background-app">
      {/* Premium Header */}
      <div className="header-bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/customers">
              <button className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20">
                <i className="fas fa-arrow-left text-white"></i>
              </button>
            </Link>
            <div>
              <h1 className="heading-2 text-white mb-0.5">গ্রাহকের বিস্তারিত</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-white/90 bengali-font">{getBengaliDate()}</p>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-200 font-semibold">প্রোফাইল</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setIsEditDialogOpen(true)}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <i className="fas fa-edit mr-2"></i>
              সম্পাদনা
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 mobile-safe-area space-y-6">
        {/* Customer Profile Card */}
        <Card className="enhanced-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-user text-white text-3xl"></i>
              </div>
              <div className="flex-1">
                <h2 className="heading-2 text-blue-900 mb-2 bengali-font">{customer.name}</h2>
                <div className="space-y-2">
                  {customer.phone_number && (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-phone text-blue-600 w-4"></i>
                      <span className="body-regular text-blue-800">{formatBengaliPhone(customer.phone_number)}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-map-marker-alt text-blue-600 w-4 mt-1"></i>
                      <span className="body-regular text-blue-800 bengali-font">{customer.address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-calendar text-blue-600 w-4"></i>
                    <span className="body-regular text-blue-800">
                      সদস্য: {customer.created_at ? new Date(customer.created_at).toLocaleDateString('bn-BD') : 'অজানা'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Link to={`/collection?customer=${customer.id}`}>
                  <Button className="action-btn action-btn-primary mb-2">
                    <i className="fas fa-hand-holding-usd mr-2"></i>
                    টাকা সংগ্রহ
                  </Button>
                </Link>
                <Link to={`/sales/new?customer=${customer.name}`}>
                  <Button variant="outline" className="w-full">
                    <i className="fas fa-shopping-cart mr-2"></i>
                    নতুন বিক্রয়
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Statistics */}
        <div className="stats-grid grid-cols-3 gap-4">
          <div className="stats-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-shopping-bag text-white"></i>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full opacity-60"></div>
            </div>
            <h3 className="text-sm font-semibold text-green-700 mb-1 bengali-font">মোট কেনাকাটা</h3>
            <p className="text-2xl font-bold text-green-800 number-font tracking-tight">
              {formatCurrency(totalPurchases)}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium bengali-font">
                {toBengaliNumber(customerSales.length)} টি ক্রয়
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
            <h3 className="text-sm font-semibold text-blue-700 mb-1 bengali-font">পরিশোধিত</h3>
            <p className="text-2xl font-bold text-blue-800 number-font tracking-tight">
              {formatCurrency(totalPaid)}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-600 font-medium bengali-font">প্রাপ্ত</span>
            </div>
          </div>

          <div className="stats-card bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-hand-holding-usd text-white"></i>
              </div>
              <div className="w-2 h-2 bg-orange-500 rounded-full opacity-60"></div>
            </div>
            <h3 className="text-sm font-semibold text-orange-700 mb-1 bengali-font">বাকি</h3>
            <p className="text-2xl font-bold text-orange-800 number-font tracking-tight">
              {formatCurrency(totalDue + (parseFloat(customer.total_credit) || 0))}
            </p>
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
              <span className="text-xs text-orange-600 font-medium bengali-font">পেন্ডিং</span>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <Card className="enhanced-card">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center justify-between bengali-font">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-shopping-cart text-green-600"></i>
                </div>
                সাম্প্রতিক কেনাকাটা
              </div>
              {customerSales.length > 5 && (
                <Link to="/sales">
                  <Button variant="outline" size="sm">
                    সব দেখুন
                  </Button>
                </Link>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-receipt text-green-600"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 bengali-font">
                          {sale.items && sale.items[0]?.productName || 'বিক্রয়'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('bn-BD') : 'অজানা তারিখ'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 number-font">
                        {formatCurrency(sale.total_amount)}
                      </p>
                      {parseFloat(sale.due_amount) > 0 && (
                        <p className="text-sm text-red-600 bengali-font">
                          বাকি: {formatCurrency(sale.due_amount)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-shopping-cart text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500 bengali-font">কোনো কেনাকাটার ইতিহাস নেই</p>
                <Link to={`/sales/new?customer=${customer.name}`}>
                  <Button className="mt-3">
                    <i className="fas fa-plus mr-2"></i>
                    প্রথম বিক্রয় করুন
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="responsive-grid-2 gap-4">
          <Link to="/customers">
            <Card className="enhanced-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-users text-blue-600 text-xl"></i>
                </div>
                <h3 className="body-large font-semibold text-gray-900 bengali-font">গ্রাহক তালিকা</h3>
                <p className="caption text-gray-500 bengali-font">সব গ্রাহক দেখুন</p>
              </CardContent>
            </Card>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Card className="enhanced-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-red-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-trash text-red-600 text-xl"></i>
                  </div>
                  <h3 className="body-large font-semibold text-red-700 bengali-font">গ্রাহক মুছুন</h3>
                  <p className="caption text-red-500 bengali-font">স্থায়ীভাবে মুছে ফেলুন</p>
                </CardContent>
              </Card>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="bengali-font">গ্রাহক মুছে ফেলবেন?</AlertDialogTitle>
                <AlertDialogDescription className="bengali-font">
                  এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। গ্রাহকের সকল তথ্য স্থায়ীভাবে মুছে যাবে।
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bengali-font">বাতিল</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteCustomerMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700 bengali-font"
                  disabled={deleteCustomerMutation.isPending}
                >
                  {deleteCustomerMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-trash mr-2"></i>
                  )}
                  মুছে ফেলুন
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="enhanced-dialog">
          <DialogHeader>
            <DialogTitle className="bengali-font">গ্রাহকের তথ্য সম্পাদনা</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="bengali-font">গ্রাহকের নাম</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="enhanced-input mt-1"
              />
            </div>
            <div>
              <Label className="bengali-font">ফোন নম্বর</Label>
              <Input
                value={editForm.phone_number}
                onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                className="enhanced-input mt-1"
              />
            </div>
            <div>
              <Label className="bengali-font">ঠিকানা</Label>
              <Textarea
                value={editForm.address}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                className="enhanced-input mt-1 min-h-[80px]"
                rows={3}
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleUpdateSubmit}
                disabled={updateCustomerMutation.isPending}
                className="action-btn action-btn-primary flex-1"
              >
                {updateCustomerMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-save mr-2"></i>
                )}
                সংরক্ষণ করুন
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                বাতিল
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}