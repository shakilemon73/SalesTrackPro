import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, toBengaliNumber, getBengaliDate } from "@/lib/bengali-utils";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import { 
  ArrowLeft, Check, DollarSign, User, CreditCard, 
  Calculator, Package, Zap, Phone, Plus, ChevronUp,
  ChevronDown, Clock, MapPin, Hash, Wallet, TrendingUp,
  Receipt, Shield, Sparkles, X, MessageCircle
} from "lucide-react";

// Enhanced schema with more validation
const quickSaleSchema = z.object({
  customerName: z.string().min(1, "গ্রাহকের নাম আবশ্যক"),
  amount: z.string().min(1, "টাকার পরিমাণ আবশ্যক"),
  paymentMethod: z.enum(["নগদ", "বাকি", "মিশ্র"]),
  productDescription: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

export default function SalesEntryBottomSheet() {
  const [, setLocation] = useLocation();
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('সুপ্রভাত');
    else if (hour < 17) setTimeOfDay('শুভ দুপুর');
    else setTimeOfDay('শুভ সন্ধ্যা');
  }, []);

  const form = useForm({
    resolver: zodResolver(quickSaleSchema),
    defaultValues: {
      customerName: "",
      amount: "",
      paymentMethod: "নগদ" as const,
      productDescription: "",
      customerPhone: "",
      notes: "",
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
  });

  const { data: recentSales = [] } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID, 'recent'],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID, 3),
  });

  const { data: todayStats } = useQuery({
    queryKey: ['dashboard', CURRENT_USER_ID],
    queryFn: () => supabaseService.getStats(CURRENT_USER_ID),
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
          productName: formData.productDescription || "সাধারণ পণ্য", 
          quantity: 1, 
          unitPrice: formData.amount, 
          totalPrice: amount 
        }],
        sale_date: getBangladeshTimeISO()
      };
      return await supabaseService.createSale(CURRENT_USER_ID, dbSaleData);
    },
    onSuccess: () => {
      toast({
        title: "🎉 সফল!",
        description: "বিক্রয় সফলভাবে রেকর্ড করা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      form.reset();
      setSelectedCustomer(null);
      setSheetExpanded(false);
      setTimeout(() => setLocation("/"), 1500);
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
  ).slice(0, 4);

  const watchedAmount = form.watch("amount");
  const watchedPaymentMethod = form.watch("paymentMethod");
  const watchedCustomerName = form.watch("customerName");

  const selectCustomer = (customer: any) => {
    form.setValue("customerName", customer.name);
    form.setValue("customerPhone", customer.phone_number);
    setSelectedCustomer(customer);
    setShowCustomerSuggestions(false);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 overflow-hidden relative">
      
      {/* Header with Context */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-emerald-200/50 dark:border-slate-700/50 px-4 py-3 relative z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-emerald-100 dark:hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white bengali-font">
                নতুন বিক্রয়
              </h1>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 bengali-font font-medium">
                {timeOfDay} • {getBengaliDate()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-xs text-slate-600 dark:text-slate-400 bengali-font">আজকের বিক্রয়</p>
              <p className="text-sm font-bold text-emerald-600 number-font">
                ৳{formatCurrency(todayStats?.todaySales || 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Background Content - Recent Activity */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
              সাম্প্রতিক বিক্রয়
            </h3>
          </div>
          
          <div className="space-y-2">
            {recentSales.map((sale, index) => (
              <Card key={sale.id} className="bg-white/60 dark:bg-slate-800/60 border border-emerald-200/30 dark:border-slate-600/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white bengali-font">
                          {sale.customer_name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 bengali-font">
                          {sale.payment_method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600 number-font">
                        ৳{formatCurrency(Number(sale.total_amount))}
                      </p>
                      {sale.due_amount > 0 && (
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                          বাকি: ৳{formatCurrency(sale.due_amount)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 transition-all duration-500 ease-out z-40 ${
        sheetExpanded ? 'h-[85vh]' : 'h-[60vh]'
      }`}>
        
        {/* Handle */}
        <div className="flex justify-center py-2">
          <button
            onClick={() => setSheetExpanded(!sheetExpanded)}
            className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
          />
        </div>

        {/* Sheet Header */}
        <div className="px-4 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                দ্রুত এন্ট্রি
              </h2>
            </div>
            
            <button
              onClick={() => setSheetExpanded(!sheetExpanded)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sheetExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronUp className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Sheet Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Customer Input with Enhanced UX */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  গ্রাহকের নাম *
                </label>
                {selectedCustomer && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    নিবন্ধিত
                  </Badge>
                )}
              </div>
              
              <div className="relative">
                <Input
                  {...form.register("customerName")}
                  placeholder="নাম টাইপ করুন..."
                  className="h-12 text-base bengali-font border-2 focus:border-blue-500 pr-10"
                  onFocus={() => setShowCustomerSuggestions(true)}
                  onChange={(e) => {
                    form.setValue("customerName", e.target.value);
                    setShowCustomerSuggestions(e.target.value.length > 0);
                    setSelectedCustomer(null);
                  }}
                  data-testid="input-customer-name"
                />
                
                {selectedCustomer && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Customer Suggestions */}
              {showCustomerSuggestions && watchedCustomerName && filteredCustomers.length > 0 && (
                <div className="space-y-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 shadow-lg max-h-32 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => selectCustomer(customer)}
                      className="w-full text-left p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white bengali-font">
                            {customer.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              📞 {customer.phone_number}
                            </p>
                            {customer.total_credit > 0 && (
                              <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                                বাকি: ৳{formatCurrency(customer.total_credit)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Amount Input with Smart Features */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <label className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    মোট টাকা *
                  </label>
                </div>
                
                {watchedAmount && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 bengali-font font-medium">
                    {toBengaliNumber(parseFloat(watchedAmount))} টাকা
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Input
                  {...form.register("amount")}
                  type="number"
                  placeholder="৳ ০"
                  className="h-12 text-lg pl-8 border-2 focus:border-emerald-500 number-font font-bold"
                  data-testid="input-amount"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">৳</div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 200, 500].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => form.setValue("amount", amount.toString())}
                    className="h-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors bengali-font"
                  >
                    ৳{toBengaliNumber(amount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <label className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  পেমেন্ট পদ্ধতি
                </label>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {["নগদ", "বাকি", "মিশ্র"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => form.setValue("paymentMethod", method as any)}
                    className={`h-11 rounded-xl border-2 transition-all duration-200 bengali-font font-bold text-sm ${
                      form.watch("paymentMethod") === method
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:border-orange-400'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Expanded Fields */}
            {sheetExpanded && (
              <div className="space-y-4 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                
                {/* Product Description */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <label className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                      পণ্যের বিবরণ
                    </label>
                  </div>
                  <Input
                    {...form.register("productDescription")}
                    placeholder="পণ্যের নাম লিখুন..."
                    className="h-11 bengali-font border-2 focus:border-purple-500"
                  />
                </div>

                {/* Customer Phone */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <label className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                      ফোন নম্বর
                    </label>
                  </div>
                  <Input
                    {...form.register("customerPhone")}
                    placeholder="01XXXXXXXXX"
                    className="h-11 number-font border-2 focus:border-green-500"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-indigo-600" />
                    <label className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                      অতিরিক্ত নোট
                    </label>
                  </div>
                  <textarea
                    {...form.register("notes")}
                    placeholder="কোনো বিশেষ তথ্য..."
                    className="w-full h-20 p-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 bengali-font text-sm resize-none"
                  />
                </div>
              </div>
            )}

            {/* Live Preview */}
            {(watchedAmount || watchedCustomerName) && (
              <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                      লাইভ প্রিভিউ
                    </h4>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400 bengali-font">গ্রাহক:</span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white bengali-font">
                        {watchedCustomerName || "নাম নেই"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400 bengali-font">মোট:</span>
                      <span className="text-sm font-black text-emerald-600 number-font">
                        ৳{formatCurrency(parseFloat(watchedAmount || "0"))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400 bengali-font">পদ্ধতি:</span>
                      <Badge className={`text-xs ${
                        watchedPaymentMethod === "নগদ" ? "bg-green-100 text-green-700" :
                        watchedPaymentMethod === "বাকি" ? "bg-orange-100 text-orange-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {watchedPaymentMethod}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={createSaleMutation.isPending || !watchedCustomerName || !watchedAmount}
                className="w-full h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg bengali-font rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                data-testid="button-submit-sale"
              >
                {createSaleMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>সেভ হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5" />
                    <span>বিক্রয় সম্পন্ন করুন</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}