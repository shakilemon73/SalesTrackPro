import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { hybridAuth } from "@/lib/hybrid-auth";
import { useHybridCustomers, useHybridSales, useHybridCreateCollection } from "@/hooks/use-hybrid-data";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Wallet, User, CreditCard, 
  Banknote, CheckCircle, AlertCircle, 
  DollarSign, Calculator, Users
} from "lucide-react";

const collectionSchema = z.object({
  customer_id: z.string().min(1, "গ্রাহক নির্বাচন করুন"),
  amount: z.string().min(1, "টাকার পরিমাণ লিখুন").refine((val) => parseFloat(val) > 0, "টাকার পরিমাণ শূন্যের চেয়ে বেশি হতে হবে"),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function CollectionMobileOptimized() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const user = hybridAuth.getCurrentUser();
  const { isOnline } = useNetworkStatus();

  const { data: customers = [] } = useHybridCustomers();
  const { data: sales = [] } = useHybridSales();

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      customer_id: "",
      amount: "",
    },
  });

  // Calculate customers with due amounts
  const customersWithDue = customers.map(customer => {
    const customerSales = sales.filter(sale => sale.customer_id === customer.id);
    const totalDue = customerSales.reduce((sum, sale) => sum + (parseFloat(sale.due_amount.toString()) || 0), 0);
    return {
      ...customer,
      totalDue: totalDue + (parseFloat(customer.total_credit.toString()) || 0)
    };
  }).filter(customer => customer.totalDue > 0);

  // Get selected customer's due amount
  const selectedCustomerId = form.watch("customer_id");
  const selectedCustomer = customersWithDue.find(c => c.id === selectedCustomerId);
  const maxCollectableAmount = selectedCustomer?.totalDue || 0;

  const createCollectionMutation = useHybridCreateCollection();


  const onSubmit = (data: CollectionFormData) => {
    const collectionAmount = parseFloat(data.amount);
    
    if (collectionAmount > maxCollectableAmount) {
      toast({
        title: "সতর্কতা!",
        description: `সর্বোচ্চ ${formatCurrency(maxCollectableAmount)} টাকা আদায় করতে পারবেন`,
        variant: "destructive",
      });
      return;
    }
    
    const { getBangladeshTimeISO } = require('@/lib/bengali-utils');
    const collectionData = {
      customer_id: data.customer_id,
      amount: collectionAmount,
      collection_date: getBangladeshTimeISO(),
    };

    createCollectionMutation.mutate(collectionData, {
      onSuccess: () => {
        toast({
          title: "সফল!",
          description: isOnline ? "টাকা আদায় সফলভাবে রেকর্ড করা হয়েছে এবং সিঙ্ক হয়েছে" : "টাকা আদায় স্থানীয়ভাবে সংরক্ষিত হয়েছে",
        });
        setLocation("/");
      },
      onError: (error) => {
        console.error('Collection creation error:', error);
        toast({
          title: "ত্রুটি!",
          description: "টাকা আদায় রেকর্ড করতে সমস্যা হয়েছে",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      
      {/* Compact Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  টাকা আদায়
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Wallet className="w-3 h-3" />
                  <span>বাকি টাকা সংগ্রহ</span>
                </div>
              </div>
            </div>
            
            {customersWithDue.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {toBengaliNumber(customersWithDue.length)} জনের বাকি
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-4">
        {customersWithDue.length > 0 ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Due Customers Overview */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 bengali-font mb-1">মোট বাকি টাকা</p>
                  <p className="text-2xl font-bold number-font">
                    {formatCurrency(customersWithDue.reduce((sum, customer) => sum + customer.totalDue, 0))}
                  </p>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 text-blue-200 mx-auto mb-1" />
                  <p className="text-xs text-blue-200 bengali-font">
                    {toBengaliNumber(customersWithDue.length)} জন গ্রাহক
                  </p>
                </div>
              </div>
            </Card>

            {/* Customer Selection */}
            <Card className="border-0 shadow-md p-4">
              <div className="flex items-center space-x-2 mb-3">
                <User className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  গ্রাহক নির্বাচন
                </h3>
              </div>

              <div className="space-y-2">
                <Label className="text-xs bengali-font">যার কাছ থেকে টাকা নিবেন</Label>
                <Select value={form.watch("customer_id")} onValueChange={(value) => form.setValue("customer_id", value)}>
                  <SelectTrigger className="h-12 text-sm">
                    <SelectValue placeholder="গ্রাহক নির্বাচন করুন..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customersWithDue.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium bengali-font">{customer.name}</p>
                              <p className="text-xs text-slate-500">
                                বাকি: {formatCurrency(customer.totalDue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.customer_id && (
                  <div className="flex items-center space-x-1 text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    <p className="text-xs bengali-font">
                      {form.formState.errors.customer_id.message}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Selected Customer Due Info */}
            {selectedCustomer && (
              <Card className="border-0 shadow-md bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white bengali-font">
                        {selectedCustomer.name}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 bengali-font">
                        মোট বাকি টাকা
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400 number-font">
                      {formatCurrency(selectedCustomer.totalDue)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Collection Amount */}
            <Card className="border-0 shadow-md p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  আদায়ের পরিমাণ
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs bengali-font">কত টাকা নিবেন?</Label>
                  <Input
                    {...form.register("amount")}
                    type="number"
                    placeholder="০"
                    className="h-12 text-lg text-center number-font"
                    max={maxCollectableAmount}
                  />
                  {form.formState.errors.amount && (
                    <div className="flex items-center space-x-1 text-red-500">
                      <AlertCircle className="w-3 h-3" />
                      <p className="text-xs bengali-font">
                        {form.formState.errors.amount.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                {selectedCustomer && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      Math.floor(selectedCustomer.totalDue * 0.25),
                      Math.floor(selectedCustomer.totalDue * 0.5),
                      Math.floor(selectedCustomer.totalDue * 0.75),
                      selectedCustomer.totalDue
                    ].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => form.setValue("amount", amount.toString())}
                      >
                        {amount === selectedCustomer.totalDue ? 'সব' : formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Collection will be recorded as cash payment by default */}

            {/* Action Button */}
            <Button 
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
              disabled={createCollectionMutation.isPending}
            >
              {createCollectionMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="bengali-font">রেকর্ড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="bengali-font">টাকা আদায় করুন</span>
                </>
              )}
            </Button>
          </form>
        ) : (
          /* No Due Customers */
          <Card className="border-0 shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white bengali-font mb-2">
              সবার টাকা পরিশোধিত!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 bengali-font mb-4">
              কোনো গ্রাহকের বাকি টাকা নেই
            </p>
            <Link to="/">
              <Button variant="outline" size="sm">
                ড্যাশবোর্ডে ফিরুন
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}