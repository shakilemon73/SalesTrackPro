import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { supabaseService } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { 
  ArrowLeft, Check, DollarSign, User, CreditCard, 
  Calculator, Package, Zap, Phone, Plus
} from "lucide-react";

// Minimal schema for fastest entry
const quickSaleSchema = z.object({
  customerName: z.string().min(1, "নাম লিখুন"),
  amount: z.string().min(1, "টাকা লিখুন"),
  paymentMethod: z.enum(["নগদ", "বাকি", "মিশ্র"]),
});

export default function SalesEntrySplitScreen() {
  const [, setLocation] = useLocation();
  const [leftPanelFocus, setLeftPanelFocus] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const form = useForm({
    resolver: zodResolver(quickSaleSchema),
    defaultValues: {
      customerName: "",
      amount: "",
      paymentMethod: "নগদ" as const,
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', userId],
    queryFn: () => supabaseService.getCustomers(userId),
  });

  const { data: recentSales = [] } = useQuery({
    queryKey: ['sales', userId, 'recent'],
    queryFn: () => supabaseService.getSales(userId, 5),
  });

  const createSaleMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { getBangladeshTimeISO } = await import('@/lib/bengali-utils');
      const amount = parseFloat(formData.amount);
      const paidAmount = formData.paymentMethod === "বাকি" ? 0 : amount;
      const dueAmount = amount - paidAmount;
      
      const dbSaleData = {
        customer_id: selectedCustomer?.id || null,
        customer_name: formData.customerName,
        total_amount: amount,
        paid_amount: paidAmount,
        due_amount: dueAmount,
        payment_method: formData.paymentMethod,
        items: [{ 
          productName: "সাধারণ পণ্য", 
          quantity: 1, 
          unitPrice: formData.amount, 
          totalPrice: amount 
        }],
        sale_date: getBangladeshTimeISO()
      };
      return await supabaseService.createSale(userId, dbSaleData);
    },
    onSuccess: () => {
      toast({
        title: "✅ সফল!",
        description: "বিক্রয় রেকর্ড হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      form.reset();
      setSelectedCustomer(null);
      // Auto redirect after 1 second
      setTimeout(() => setLocation("/"), 1000);
    },
    onError: () => {
      toast({
        title: "❌ ত্রুটি!",
        description: "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createSaleMutation.mutate(data);
  };

  // Auto-complete customer names
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(form.watch("customerName").toLowerCase())
  ).slice(0, 5);

  const watchedAmount = form.watch("amount");
  const watchedPaymentMethod = form.watch("paymentMethod");

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Header - Ultra Compact */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-white bengali-font">
                দ্রুত বিক্রয়
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 bengali-font">
                ২ সেকেন্ডে শেষ
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 dark:text-green-400 bengali-font font-medium">
              রিয়েল-টাইম
            </span>
          </div>
        </div>
      </div>

      {/* Split Screen Layout - 917x412 Optimized */}
      <div className="flex h-[calc(100vh-64px)]">
        
        {/* LEFT PANEL - Input Form (60% width) */}
        <div className="w-[60%] bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col">
          
          {/* Main Input Area */}
          <div className="flex-1 p-4 space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Customer Name Input - Primary */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    leftPanelFocus === 'customer' ? 'bg-blue-500 shadow-lg scale-110' : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <User className={`w-4 h-4 ${leftPanelFocus === 'customer' ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <label className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    গ্রাহকের নাম
                  </label>
                </div>
                
                <Input
                  {...form.register("customerName")}
                  placeholder="নাম লিখুন..."
                  className="h-12 text-base bengali-font border-2 focus:border-blue-500 transition-all duration-200"
                  onFocus={() => setLeftPanelFocus('customer')}
                  onBlur={() => setLeftPanelFocus('')}
                  data-testid="input-customer-name"
                />
                
                {/* Quick Customer Selection */}
                {form.watch("customerName") && filteredCustomers.length > 0 && (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          form.setValue("customerName", customer.name);
                          setSelectedCustomer(customer);
                        }}
                        className="w-full text-left p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/40 transition-colors"
                        data-testid={`customer-suggestion-${customer.id}`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                            <span className="text-xs text-blue-700 dark:text-blue-300">👤</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white bengali-font">
                              {customer.name}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 bengali-font">
                              📞 {customer.phone_number}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount Input - Primary */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    leftPanelFocus === 'amount' ? 'bg-emerald-500 shadow-lg scale-110' : 'bg-emerald-100 dark:bg-emerald-900/30'
                  }`}>
                    <DollarSign className={`w-4 h-4 ${leftPanelFocus === 'amount' ? 'text-white' : 'text-emerald-600'}`} />
                  </div>
                  <label className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    মোট টাকা
                  </label>
                </div>
                
                <div className="relative">
                  <Input
                    {...form.register("amount")}
                    type="number"
                    placeholder="৳ ০"
                    className="h-12 text-base pl-8 border-2 focus:border-emerald-500 transition-all duration-200 number-font"
                    onFocus={() => setLeftPanelFocus('amount')}
                    onBlur={() => setLeftPanelFocus('')}
                    data-testid="input-amount"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">৳</div>
                </div>
                
                {watchedAmount && (
                  <div className="text-sm text-emerald-700 dark:text-emerald-300 bengali-font font-medium">
                    কথায়: {toBengaliNumber(parseFloat(watchedAmount || "0"))} টাকা
                  </div>
                )}
              </div>

              {/* Payment Method - Quick Toggle */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                  </div>
                  <label className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    পেমেন্ট
                  </label>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  {["নগদ", "বাকি", "মিশ্র"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => form.setValue("paymentMethod", method as any)}
                      className={`h-10 rounded-lg border-2 transition-all duration-200 bengali-font font-semibold text-sm ${
                        form.watch("paymentMethod") === method
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-105'
                          : 'bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:border-orange-400'
                      }`}
                      data-testid={`payment-method-${method}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createSaleMutation.isPending || !form.watch("customerName") || !form.watch("amount")}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-base bengali-font rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                data-testid="button-submit-sale"
              >
                {createSaleMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>সেভ হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5" />
                    <span>বিক্রয় সম্পন্ন</span>
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Quick Actions Footer */}
          <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs bengali-font"
                data-testid="button-toggle-advanced"
              >
                <Package className="w-3 h-3 mr-1" />
                বিস্তারিত
              </Button>
              
              <div className="flex items-center space-x-1">
                <Calculator className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-600 dark:text-slate-400 bengali-font">
                  দ্রুত হিসাব
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Live Preview & Recent Sales (40% width) */}
        <div className="w-[40%] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex flex-col">
          
          {/* Live Preview */}
          <div className="p-3 border-b border-slate-200/50 dark:border-slate-600/50">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Zap className="w-3 h-3 text-purple-600" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white bengali-font">
                  লাইভ প্রিভিউ
                </h3>
              </div>
              
              <Card className="bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-600/50">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 bengali-font">গ্রাহক:</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white bengali-font">
                      {form.watch("customerName") || "নাম নেই"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 bengali-font">মোট:</span>
                    <span className="text-sm font-black text-emerald-600 number-font">
                      ৳{formatCurrency(parseFloat(form.watch("amount") || "0"))}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 bengali-font">পেমেন্ট:</span>
                    <span className={`text-xs font-semibold bengali-font px-2 py-1 rounded ${
                      form.watch("paymentMethod") === "নগদ" ? "bg-green-100 text-green-700" :
                      form.watch("paymentMethod") === "বাকি" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {form.watch("paymentMethod")}
                    </span>
                  </div>
                  
                  {form.watch("paymentMethod") === "বাকি" && parseFloat(form.watch("amount") || "0") > 0 && (
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-xs text-orange-700 dark:text-orange-300 bengali-font font-medium">
                          বাকি: ৳{formatCurrency(parseFloat(form.watch("amount") || "0"))}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Package className="w-3 h-3 text-indigo-600" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white bengali-font">
                  সাম্প্রতিক বিক্রয়
                </h3>
              </div>
              
              <div className="space-y-1">
                {recentSales.slice(0, 4).map((sale, index) => (
                  <div
                    key={sale.id}
                    className="bg-white/30 dark:bg-slate-800/30 rounded-lg p-2 border border-slate-200/30 dark:border-slate-600/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white bengali-font truncate">
                          {sale.customer_name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 bengali-font">
                          {sale.payment_method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600 number-font">
                          ৳{formatCurrency(Number(sale.total_amount))}
                        </p>
                        {sale.due_amount > 0 && (
                          <p className="text-xs text-orange-600 bengali-font">
                            বাকি: ৳{formatCurrency(sale.due_amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentSales.length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-slate-400 text-xs bengali-font">
                      কোনো বিক্রয় নেই
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}