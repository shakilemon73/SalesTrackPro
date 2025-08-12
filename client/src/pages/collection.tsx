import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import { formatCurrency, toBengaliNumber, getBengaliDate } from "@/lib/bengali-utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const collectionSchema = z.object({
  customer_id: z.string().min(1, "গ্রাহক নির্বাচন করুন"),
  amount: z.string().min(1, "টাকার পরিমাণ লিখুন").refine((val) => parseFloat(val) > 0, "টাকার পরিমাণ শূন্যের চেয়ে বেশি হতে হবে"),
  payment_method: z.string().min(1, "পেমেন্ট পদ্ধতি নির্বাচন করুন"),
  notes: z.string().optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function Collection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID),
  });

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      customer_id: "",
      amount: "",
      payment_method: "",
      notes: "",
    },
  });

  // Calculate customers with due amounts
  const customersWithDue = customers.map(customer => {
    const customerSales = sales.filter(sale => sale.customer_id === customer.id);
    const totalDue = customerSales.reduce((sum, sale) => sum + (parseFloat(sale.due_amount) || 0), 0);
    return {
      ...customer,
      totalDue: totalDue + (parseFloat(customer.total_credit) || 0)
    };
  }).filter(customer => customer.totalDue > 0);

  // Get selected customer's due amount
  const selectedCustomerId = form.watch("customer_id");
  const selectedCustomer = customersWithDue.find(c => c.id === selectedCustomerId);
  const maxCollectableAmount = selectedCustomer?.totalDue || 0;

  const createCollectionMutation = useMutation({
    mutationFn: async (data: CollectionFormData) => {
      const collectionAmount = parseFloat(data.amount);
      
      // Create a sale record with negative amount to represent collection
      const { getBangladeshTimeISO } = await import('@/lib/bengali-utils');
      const saleData = {
        customer_id: data.customer_id,
        customer_name: selectedCustomer?.name || "",
        total_amount: (-collectionAmount).toString(), // Negative amount for collection (converted to string)
        paid_amount: collectionAmount.toString(),
        due_amount: "0",
        payment_method: `${data.payment_method} (সংগ্রহ)`,
        items: [{
          productName: `সংগ্রহ - ${selectedCustomer?.name || "গ্রাহক"}`,
          quantity: 1,
          unitPrice: collectionAmount.toString(),
          totalPrice: collectionAmount.toString()
        }],
        sale_date: getBangladeshTimeISO() // Set proper Bangladesh timezone
      };

      return await supabaseService.createSale(CURRENT_USER_ID, saleData);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "টাকা সফলভাবে সংগ্রহ করা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      console.error('Collection error:', error);
      toast({
        title: "ত্রুটি!",
        description: "টাকা সংগ্রহ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CollectionFormData) => {
    const amount = parseFloat(data.amount);
    if (amount > maxCollectableAmount) {
      toast({
        title: "ত্রুটি!",
        description: `সর্বোচ্চ ${formatCurrency(maxCollectableAmount)} টাকা সংগ্রহ করতে পারবেন`,
        variant: "destructive",
      });
      return;
    }
    createCollectionMutation.mutate(data);
  };

  const paymentMethods = [
    "নগদ",
    "বিকাশ",
    "নগদ (Nagad)",
    "রকেট",
    "ব্যাংক ট্রান্সফার",
    "চেক"
  ];

  return (
    <div className="min-h-screen bg-background-app">
      {/* Premium Header */}
      <div className="header-bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard">
              <button className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20">
                <i className="fas fa-arrow-left text-white"></i>
              </button>
            </Link>
            <div>
              <h1 className="heading-2 text-white mb-0.5">টাকা সংগ্রহ</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-white/90 bengali-font">{getBengaliDate()}</p>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-200 font-semibold">পেমেন্ট সংগ্রহ</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              form="collection-form"
              type="submit"
              disabled={createCollectionMutation.isPending}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              {createCollectionMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-hand-holding-usd mr-2"></i>
              )}
              সংগ্রহ করুন
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-20">
        <form id="collection-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Due Customers Summary */}
          {customersWithDue.length > 0 && (
            <Card className="enhanced-card bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardHeader className="enhanced-card-header">
                <CardTitle className="flex items-center bengali-font">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-exclamation-triangle text-orange-600"></i>
                  </div>
                  বাকি পাওনা গ্রাহক
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customersWithDue.slice(0, 5).map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                      <div>
                        <p className="font-semibold text-gray-900 bengali-font">{customer.name}</p>
                        <p className="text-sm text-gray-600 bengali-font">
                          {customer.phone_number && `📞 ${customer.phone_number}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-700 number-font">
                          {formatCurrency(customer.totalDue)}
                        </p>
                        <p className="text-xs text-orange-600 bengali-font">বাকি</p>
                      </div>
                    </div>
                  ))}
                  {customersWithDue.length > 5 && (
                    <p className="text-center text-orange-600 bengali-font text-sm">
                      আরো {toBengaliNumber(customersWithDue.length - 5)} জন গ্রাহকের বাকি আছে
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Collection Form */}
          <Card className="enhanced-card">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center bengali-font">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-hand-holding-usd text-green-600"></i>
                </div>
                টাকা সংগ্রহের তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="bengali-font">গ্রাহক নির্বাচন করুন *</Label>
                <Select 
                  value={form.watch("customer_id")} 
                  onValueChange={(value) => form.setValue("customer_id", value)}
                >
                  <SelectTrigger className="enhanced-select mt-1">
                    <SelectValue placeholder="গ্রাহক নির্বাচন করুন..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customersWithDue.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="bengali-font">{customer.name}</span>
                          <span className="text-sm text-red-600 ml-2 bengali-font">
                            বাকি: {formatCurrency(customer.totalDue)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.customer_id && (
                  <p className="text-sm text-red-600 mt-1 bengali-font">
                    {form.formState.errors.customer_id.message}
                  </p>
                )}
              </div>

              {selectedCustomer && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-blue-900 bengali-font">{selectedCustomer.name}</p>
                      <p className="text-sm text-blue-700 bengali-font">মোট বাকি পরিমাণ</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900 number-font">
                        {formatCurrency(maxCollectableAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="responsive-grid-2 gap-4">
                <div>
                  <Label className="bengali-font">সংগ্রহের পরিমাণ (টাকা) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    max={maxCollectableAmount}
                    {...form.register("amount")}
                    placeholder="০.০০"
                    className="enhanced-input mt-1"
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-red-600 mt-1 bengali-font">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                  {maxCollectableAmount > 0 && (
                    <p className="text-sm text-gray-500 mt-1 bengali-font">
                      সর্বোচ্চ: {formatCurrency(maxCollectableAmount)}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="bengali-font">পেমেন্ট পদ্ধতি *</Label>
                  <Select 
                    value={form.watch("payment_method")} 
                    onValueChange={(value) => form.setValue("payment_method", value)}
                  >
                    <SelectTrigger className="enhanced-select mt-1">
                      <SelectValue placeholder="পেমেন্ট পদ্ধতি নির্বাচন করুন..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          <span className="bengali-font">{method}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.payment_method && (
                    <p className="text-sm text-red-600 mt-1 bengali-font">
                      {form.formState.errors.payment_method.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="bengali-font">অতিরিক্ত নোট (ঐচ্ছিক)</Label>
                <Textarea
                  {...form.register("notes")}
                  placeholder="কোনো বিশেষ তথ্য বা মন্তব্য..."
                  className="enhanced-input mt-1 min-h-[80px]"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Collection Preview */}
          {form.watch("amount") && selectedCustomer && (
            <Card className="enhanced-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="heading-3 text-green-900 mb-4 bengali-font">সংগ্রহের সারাংশ</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="body-regular text-green-700 bengali-font">গ্রাহক:</span>
                    <span className="font-semibold text-green-900 bengali-font">{selectedCustomer.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="body-regular text-green-700 bengali-font">সংগ্রহের পরিমাণ:</span>
                    <span className="currency-display text-xl font-bold text-green-900">
                      {formatCurrency(parseFloat(form.watch("amount")) || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-green-200 pt-3">
                    <span className="body-regular text-green-700 bengali-font">অবশিষ্ট বাকি:</span>
                    <span className="currency-display text-lg font-bold text-orange-700">
                      {formatCurrency(maxCollectableAmount - (parseFloat(form.watch("amount")) || 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Due Customers Message */}
          {customersWithDue.length === 0 && (
            <Card className="enhanced-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-circle text-green-600 text-2xl"></i>
                </div>
                <h3 className="heading-3 text-green-900 mb-2 bengali-font">দুর্দান্ত!</h3>
                <p className="body-regular text-green-700 bengali-font mb-4">
                  কোনো গ্রাহকের বাকি নেই
                </p>
                <Link to="/dashboard">
                  <Button className="action-btn action-btn-primary">
                    <i className="fas fa-home mr-2"></i>
                    ড্যাশবোর্ডে ফিরুন
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}