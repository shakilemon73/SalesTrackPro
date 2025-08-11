import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useRoute, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { getBengaliDate, formatCurrency, toBengaliNumber, formatBengaliPhone } from "@/lib/bengali-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";

export default function CustomerDetails() {
  const [match, params] = useRoute("/customers/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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
      setLocation('/customers');
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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerMutation.mutate(editForm);
  };

  const handleDelete = () => {
    deleteCustomerMutation.mutate();
  };

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

        {/* Edit and Delete Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <i className="fas fa-edit mr-2"></i>
                সম্পাদনা
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>গ্রাহকের তথ্য সম্পাদনা</DialogTitle>
                <DialogDescription>
                  গ্রাহকের তথ্য পরিবর্তন করুন
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      নাম
                    </Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      ফোন
                    </Label>
                    <Input
                      id="phone"
                      value={editForm.phone_number}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      ঠিকানা
                    </Label>
                    <Textarea
                      id="address"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={updateCustomerMutation.isPending}>
                    {updateCustomerMutation.isPending ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <i className="fas fa-trash mr-2"></i>
                মুছুন
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>গ্রাহক মুছে ফেলুন</AlertDialogTitle>
                <AlertDialogDescription>
                  আপনি কি নিশ্চিত যে আপনি এই গ্রাহককে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={deleteCustomerMutation.isPending}
                  className="bg-destructive text-destructive-foreground"
                >
                  {deleteCustomerMutation.isPending ? 'মুছে ফেলা হচ্ছে...' : 'মুছে ফেলুন'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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