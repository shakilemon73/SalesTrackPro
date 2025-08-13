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
  Receipt, Shield, Sparkles, X, MessageCircle, CheckCircle2
} from "lucide-react";

// Enhanced schema with all fields
const quickSaleSchema = z.object({
  customerName: z.string().min(1, "গ্রাহকের নাম আবশ্যক"),
  amount: z.string().min(1, "টাকার পরিমাণ আবশ্যক"),
  paymentMethod: z.enum(["নগদ", "বাকি", "মিশ্র"]),
  productDescription: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

// Custom Bottom Toast Component
const BottomToast = ({ show, message, type, onClose }: {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = type === 'success' ? 'from-emerald-500 to-green-600' : 
                  type === 'error' ? 'from-red-500 to-red-600' : 
                  'from-blue-500 to-blue-600';

  const icon = type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
               type === 'error' ? <X className="w-5 h-5" /> :
               <Clock className="w-5 h-5" />;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 transform transition-all duration-500 ${
      show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className={`bg-gradient-to-r ${bgColor} p-4 rounded-xl shadow-lg backdrop-blur-xl border border-white/20`}>
        <div className="flex items-center space-x-3 text-white">
          {icon}
          <span className="text-sm font-semibold bengali-font flex-1">{message}</span>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SalesEntryBottomSheet() {
  const [, setLocation] = useLocation();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
  
  const { toast: systemToast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('সুপ্রভাত');
    else if (hour < 17) setTimeOfDay('শুভ দুপুর');
    else setTimeOfDay('শুভ সন্ধ্যা');
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ show: true, message, type });
  };

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
      showToast("🎉 বিক্রয় সফলভাবে রেকর্ড করা হয়েছে!", 'success');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      form.reset();
      setSelectedCustomer(null);
      setTimeout(() => setLocation("/"), 2000);
    },
    onError: () => {
      showToast("❌ বিক্রয় রেকর্ড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", 'error');
    },
  });

  const onSubmit = (data: any) => {
    showToast("📝 বিক্রয় তথ্য সেভ করা হচ্ছে...", 'info');
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
    showToast(`✅ ${customer.name} নির্বাচিত হয়েছে`, 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 pb-20">
      
      {/* Header with Context */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-emerald-200/50 dark:border-slate-700/50 px-4 py-3 sticky top-0 z-40">
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

      {/* Main Content - Single Page Form */}
      <div className="p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Customer Input Section */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white bengali-font">
                  গ্রাহকের তথ্য
                </h3>
                {selectedCustomer && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    নিবন্ধিত
                  </Badge>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 bengali-font">
                    গ্রাহকের নাম *
                  </label>
                  <Input
                    {...form.register("customerName")}
                    placeholder="নাম টাইপ করুন..."
                    className="h-12 text-base bengali-font border-2 focus:border-blue-500 mt-1"
                    onFocus={() => setShowCustomerSuggestions(true)}
                    onChange={(e) => {
                      form.setValue("customerName", e.target.value);
                      setShowCustomerSuggestions(e.target.value.length > 0);
                      setSelectedCustomer(null);
                    }}
                    data-testid="input-customer-name"
                  />
                  
                  {selectedCustomer && (
                    <div className="absolute right-3 top-9">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 bengali-font">
                    ফোন নম্বর
                  </label>
                  <Input
                    {...form.register("customerPhone")}
                    placeholder="01XXXXXXXXX"
                    className="h-12 number-font border-2 focus:border-green-500 mt-1"
                  />
                </div>
                
                {/* Customer Suggestions */}
                {showCustomerSuggestions && watchedCustomerName && filteredCustomers.length > 0 && (
                  <div className="space-y-1 bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-2 shadow-lg max-h-36 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
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
            </CardContent>
          </Card>

          {/* Amount Section */}
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white bengali-font">
                    বিক্রয়ের পরিমাণ
                  </h3>
                </div>
                
                {watchedAmount && (
                  <div className="text-sm text-emerald-700 dark:text-emerald-300 bengali-font font-medium">
                    {toBengaliNumber(parseFloat(watchedAmount))} টাকা
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 bengali-font">
                    মোট টাকা *
                  </label>
                  <div className="relative mt-1">
                    <Input
                      {...form.register("amount")}
                      type="number"
                      placeholder="৳ ০"
                      className="h-14 text-xl pl-12 border-2 focus:border-emerald-500 number-font font-bold"
                      data-testid="input-amount"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg">৳</div>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 bengali-font mb-2 block">
                    দ্রুত নির্বাচন
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 200, 500].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => form.setValue("amount", amount.toString())}
                        className="h-12 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors bengali-font"
                      >
                        ৳{toBengaliNumber(amount)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Section */}
          <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white bengali-font">
                  পেমেন্ট পদ্ধতি
                </h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {["নগদ", "বাকি", "মিশ্র"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => form.setValue("paymentMethod", method as any)}
                    className={`h-14 rounded-xl border-2 transition-all duration-200 bengali-font font-bold text-base ${
                      form.watch("paymentMethod") === method
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:border-orange-400'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product & Notes Section */}
          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Package className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white bengali-font">
                  অতিরিক্ত তথ্য
                </h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 bengali-font">
                    পণ্যের বিবরণ
                  </label>
                  <Input
                    {...form.register("productDescription")}
                    placeholder="পণ্যের নাম লিখুন..."
                    className="h-12 bengali-font border-2 focus:border-purple-500 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 bengali-font">
                    বিশেষ নোট
                  </label>
                  <textarea
                    {...form.register("notes")}
                    placeholder="কোনো বিশেষ তথ্য..."
                    className="w-full h-20 p-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-purple-500 bengali-font text-sm resize-none mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          {(watchedAmount || watchedCustomerName) && (
            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-300 dark:border-emerald-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white bengali-font">
                    লাইভ প্রিভিউ
                  </h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400 bengali-font">গ্রাহক:</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white bengali-font">
                      {watchedCustomerName || "নাম নেই"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400 bengali-font">মোট:</span>
                    <span className="text-lg font-black text-emerald-600 number-font">
                      ৳{formatCurrency(parseFloat(watchedAmount || "0"))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400 bengali-font">পদ্ধতি:</span>
                    <Badge className={`text-sm ${
                      watchedPaymentMethod === "নগদ" ? "bg-green-100 text-green-700" :
                      watchedPaymentMethod === "বাকি" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {watchedPaymentMethod}
                    </Badge>
                  </div>
                  
                  {form.watch("paymentMethod") === "বাকি" && parseFloat(watchedAmount || "0") > 0 && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-orange-700 dark:text-orange-300 bengali-font font-medium">
                          বাকি থাকবে: ৳{formatCurrency(parseFloat(watchedAmount || "0"))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={createSaleMutation.isPending || !watchedCustomerName || !watchedAmount}
              className="w-full h-16 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg bengali-font rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              data-testid="button-submit-sale"
            >
              {createSaleMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>সেভ হচ্ছে...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Check className="w-6 h-6" />
                  <span>বিক্রয় সম্পন্ন করুন</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Custom Bottom Toast */}
      <BottomToast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}