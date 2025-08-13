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
  Receipt, Shield, Sparkles, X, MessageCircle, CheckCircle2,
  Star, Home, UserPlus
} from "lucide-react";

// Enhanced schema with all fields
const quickSaleSchema = z.object({
  customerName: z.string().min(1, "গ্রাহকের নাম আবশ্যক"),
  amount: z.string().min(1, "টাকার পরিমাণ আবশ্যক"),
  paymentMethod: z.enum(["নগদ", "বাকি", "মিশ্র"] as const),
  paidAmount: z.string().optional(),
  productDescription: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  notes: z.string().optional(),
});

// Bottom Success Popup Modal (like the image)
const SuccessPopup = ({ show, onClose, customerName, amount }: {
  show: boolean;
  onClose: () => void;
  customerName: string;
  amount: string;
}) => {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      
      {/* Popup Modal */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-2xl">
          
          {/* Success Icon with Animation */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              {/* Animated Success Circle */}
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-10 h-10 text-white animate-bounce" />
              </div>
              
              {/* Sparkle Effects */}
              <div className="absolute -top-2 -left-2">
                <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Star className="w-3 h-3 text-pink-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2">
                <Star className="w-3 h-3 text-purple-400 animate-pulse" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white bengali-font">
                বিক্রয় সম্পন্ন!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 bengali-font">
                {customerName} এর জন্য ৳{formatCurrency(parseFloat(amount || "0"))} টাকার বিক্রয় সফল হয়েছে
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-4 py-3 px-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 bengali-font">
                  বিক্রয় নং: #{Date.now().toString().slice(-4)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 bengali-font">
                  {new Date().toLocaleTimeString('bn-BD', { hour12: false })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3 pt-2">
              <Button
                onClick={onClose}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-base bengali-font rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Home className="w-5 h-5 mr-2" />
                ড্যাশবোর্ডে ফিরুন
              </Button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full h-10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm bengali-font hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              >
                নতুন বিক্রয় করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

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
    <div className={`fixed bottom-4 left-4 right-4 z-40 transform transition-all duration-500 ${
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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState({ customerName: '', amount: '' });
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  
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
      paidAmount: "",
      productDescription: "",
      customerPhone: "",
      customerAddress: "",
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

  // Create new customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      return await supabaseService.createCustomer(CURRENT_USER_ID, {
        name: customerData.customerName,
        phone_number: customerData.customerPhone,
        address: customerData.customerAddress || '',
        total_credit: 0
      });
    },
    onSuccess: (newCustomer, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSelectedCustomer(newCustomer);
      setShowNewCustomerForm(false);
      showToast(`✅ নতুন গ্রাহক ${variables.customerName} সফলভাবে যোগ করা হয়েছে`, 'success');
    },
    onError: () => {
      showToast("❌ গ্রাহক যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", 'error');
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { getBangladeshTimeISO } = await import('@/lib/bengali-utils');
      const amount = parseFloat(formData.amount);
      
      let paidAmount = 0;
      if (formData.paymentMethod === "নগদ") {
        paidAmount = amount;
      } else if (formData.paymentMethod === "বাকি") {
        paidAmount = 0;
      } else if (formData.paymentMethod === "মিশ্র") {
        paidAmount = parseFloat(formData.paidAmount || "0");
      }
      
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
    onSuccess: (data, variables) => {
      // Set success data and show popup
      setSuccessData({
        customerName: variables.customerName,
        amount: variables.amount
      });
      setShowSuccessPopup(true);
      
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      form.reset();
      setSelectedCustomer(null);
    },
    onError: () => {
      showToast("❌ বিক্রয় রেকর্ড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", 'error');
    },
  });

  const onSubmit = async (data: any) => {
    showToast("📝 বিক্রয় তথ্য সেভ করা হচ্ছে...", 'info');
    
    // Check if customer exists in the database
    const customerExists = customers.find(customer => 
      customer.name.toLowerCase() === data.customerName.toLowerCase()
    );
    
    // If customer doesn't exist and customer name is provided, auto-create the customer
    if (!customerExists && data.customerName && data.customerName.trim()) {
      console.log("🔧 Auto-creating new customer:", data.customerName);
      
      try {
        console.log("🔧 Attempting to create customer:", {
          name: data.customerName.trim(),
          phone_number: data.customerPhone || '',
          address: data.customerAddress || '',
          total_credit: 0
        });
        
        const newCustomer = await supabaseService.createCustomer(CURRENT_USER_ID, {
          name: data.customerName.trim(),
          phone_number: data.customerPhone || '',
          address: data.customerAddress || '',
          total_credit: 0
        });
        
        console.log("✅ Customer created successfully:", newCustomer);
        
        // Clear cache and update customer list
        const { clearCustomerCache } = await import('@/lib/cache-manager');
        clearCustomerCache(CURRENT_USER_ID);
        
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        queryClient.invalidateQueries({ queryKey: ['customers', CURRENT_USER_ID] });
        setSelectedCustomer(newCustomer);
        
        showToast(`✅ নতুন গ্রাহক ${data.customerName} স্বয়ংক্রিয়ভাবে যোগ করা হয়েছে`, 'success');
        
        // Small delay to ensure customer is created before creating sale
        setTimeout(() => {
          createSaleMutation.mutate(data);
        }, 500);
        
      } catch (error: any) {
        console.error("❌ Auto customer creation failed:", error);
        console.error("❌ Error message:", error?.message || 'Unknown error');
        showToast(`❌ গ্রাহক তৈরিতে সমস্যা: ${error?.message || 'অজানা ত্রুটি'}`, 'error');
        return;
      }
    } else {
      // Customer exists or no customer name provided, proceed with sale
      createSaleMutation.mutate(data);
    }
  };

  // Auto-complete customer names
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(form.watch("customerName").toLowerCase())
  ).slice(0, 4);

  const watchedAmount = form.watch("amount");
  const watchedPaymentMethod = form.watch("paymentMethod");
  const watchedCustomerName = form.watch("customerName");
  const watchedPaidAmount = form.watch("paidAmount");

  const selectCustomer = (customer: any) => {
    form.setValue("customerName", customer.name);
    form.setValue("customerPhone", customer.phone_number);
    setSelectedCustomer(customer);
    setShowCustomerSuggestions(false);
    showToast(`✅ ${customer.name} নির্বাচিত হয়েছে`, 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      
      {/* Compact Header - Optimized for 917x412 */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-emerald-200/50 dark:border-slate-700/50 px-3 py-2 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-100 dark:hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-white bengali-font">
                নতুন বিক্রয়
              </h1>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 bengali-font font-medium">
                {timeOfDay} • {getBengaliDate()}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs font-bold text-emerald-600 number-font">
              ৳{formatCurrency(todayStats?.todaySales || 0)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 bengali-font">
              আজ
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Optimized for 917x412 */}
      <div className="p-3 max-w-sm mx-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          
          {/* Customer Input Section */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800">
            <CardContent className="p-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    গ্রাহকের তথ্য
                  </h3>
                  {selectedCustomer && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      নিবন্ধিত
                    </Badge>
                  )}
                </div>
                
                {!selectedCustomer && watchedCustomerName && filteredCustomers.length === 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg bengali-font font-medium flex items-center space-x-1">
                      <UserPlus className="w-3 h-3" />
                      <span>স্বয়ংক্রিয় যোগ</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                      className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-lg transition-colors bengali-font font-medium"
                    >
                      + ম্যানুয়াল যোগ
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 bengali-font">
                    গ্রাহকের নাম *
                  </label>
                  <Input
                    {...form.register("customerName")}
                    placeholder="নাম টাইপ করুন..."
                    className="h-9 text-sm bengali-font border-2 focus:border-blue-500 mt-1"
                    onFocus={() => setShowCustomerSuggestions(true)}
                    onChange={(e) => {
                      form.setValue("customerName", e.target.value);
                      setShowCustomerSuggestions(e.target.value.length > 0);
                      setSelectedCustomer(null);
                    }}
                    data-testid="input-customer-name"
                  />
                  
                  {selectedCustomer && (
                    <div className="absolute right-3 top-7">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                    </div>
                  )}
                </div>

                {/* New Customer Form */}
                {showNewCustomerForm && (
                  <div className="space-y-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="text-xs font-bold text-green-700 dark:text-green-300 bengali-font">নতুন গ্রাহক যোগ করুন</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          {...form.register("customerPhone")}
                          placeholder="ফোন নম্বর"
                          className="h-9 text-xs number-font border-2 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <Input
                          {...form.register("customerAddress")}
                          placeholder="ঠিকানা"
                          className="h-9 text-xs bengali-font border-2 focus:border-green-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={() => createCustomerMutation.mutate(form.getValues())}
                        disabled={createCustomerMutation.isPending}
                        className="flex-1 h-8 bg-green-600 hover:bg-green-700 text-white text-xs bengali-font"
                      >
                        {createCustomerMutation.isPending ? "যোগ হচ্ছে..." : "গ্রাহক যোগ করুন"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowNewCustomerForm(false)}
                        variant="outline"
                        className="h-8 px-3 text-xs"
                      >
                        বাতিল
                      </Button>
                    </div>
                  </div>
                )}

                {!showNewCustomerForm && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 bengali-font">
                      ফোন নম্বর
                    </label>
                    <Input
                      {...form.register("customerPhone")}
                      placeholder="01XXXXXXXXX"
                      className="h-9 number-font border-2 focus:border-green-500 mt-1 text-sm"
                    />
                  </div>
                )}
                
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

          {/* Amount Section - Compact for 917x412 */}
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800">
            <CardContent className="p-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    বিক্রয়ের পরিমাণ
                  </h3>
                </div>
                
                {watchedAmount && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 bengali-font font-medium">
                    {toBengaliNumber(parseFloat(watchedAmount))} টাকা
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 bengali-font">
                    মোট টাকা *
                  </label>
                  <div className="relative mt-1">
                    <Input
                      {...form.register("amount")}
                      type="number"
                      placeholder="৳ ০"
                      className="h-10 text-base pl-10 border-2 focus:border-emerald-500 number-font font-bold"
                      data-testid="input-amount"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-base">৳</div>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 bengali-font mb-1 block">
                    দ্রুত নির্বাচন
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[50, 100, 200, 500].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => form.setValue("amount", amount.toString())}
                        className="h-8 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors bengali-font"
                      >
                        ৳{toBengaliNumber(amount)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Section - Compact */}
          <Card className="border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800">
            <CardContent className="p-2 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  পেমেন্ট পদ্ধতি
                </h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {["নগদ", "বাকি", "মিশ্র"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => form.setValue("paymentMethod", method as any)}
                    className={`h-9 rounded-lg border-2 transition-all duration-200 bengali-font font-bold text-sm ${
                      form.watch("paymentMethod") === method
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:border-orange-400'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Mixed Payment Details */}
              {form.watch("paymentMethod") === "মিশ্র" && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 space-y-2">
                  <h4 className="text-xs font-bold text-orange-700 dark:text-orange-300 bengali-font">মিশ্র পেমেন্টের বিস্তারিত</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-orange-700 dark:text-orange-300 bengali-font">
                        মোট টাকা
                      </label>
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg border border-orange-300 dark:border-orange-700">
                        <span className="text-sm font-bold text-orange-700 dark:text-orange-300 number-font">
                          ৳{formatCurrency(parseFloat(watchedAmount || "0"))}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-orange-700 dark:text-orange-300 bengali-font">
                        পেইড টাকা *
                      </label>
                      <Input
                        {...form.register("paidAmount")}
                        type="number"
                        placeholder="০"
                        className="h-9 text-sm number-font border-2 focus:border-orange-500"
                        onChange={(e) => {
                          const paid = parseFloat(e.target.value || "0");
                          const total = parseFloat(watchedAmount || "0");
                          if (paid > total) {
                            form.setValue("paidAmount", watchedAmount);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Due Calculation */}
                  {watchedPaidAmount && (
                    <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <span className="text-xs font-semibold text-red-700 dark:text-red-300 bengali-font">বাকি থাকবে:</span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400 number-font">
                        ৳{formatCurrency(Math.max(0, parseFloat(watchedAmount || "0") - parseFloat(watchedPaidAmount || "0")))}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product & Notes Section */}
          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Package className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  অতিরিক্ত তথ্য
                </h3>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 bengali-font">
                    পণ্যের বিবরণ
                  </label>
                  <Input
                    {...form.register("productDescription")}
                    placeholder="পণ্যের নাম লিখুন..."
                    className="h-10 bengali-font border-2 focus:border-purple-500 mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 bengali-font">
                    বিশেষ নোট
                  </label>
                  <textarea
                    {...form.register("notes")}
                    placeholder="কোনো বিশেষ তথ্য..."
                    className="w-full h-16 p-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-purple-500 bengali-font text-xs resize-none mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          {(watchedAmount || watchedCustomerName) && (
            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-300 dark:border-emerald-700">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    লাইভ প্রিভিউ
                  </h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600 dark:text-slate-400 bengali-font">গ্রাহক:</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white bengali-font">
                      {watchedCustomerName || "নাম নেই"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600 dark:text-slate-400 bengali-font">মোট:</span>
                    <span className="text-sm font-black text-emerald-600 number-font">
                      ৳{formatCurrency(parseFloat(watchedAmount || "0"))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600 dark:text-slate-400 bengali-font">পদ্ধতি:</span>
                    <Badge className={`text-xs ${
                      watchedPaymentMethod === "নগদ" ? "bg-green-100 text-green-700" :
                      watchedPaymentMethod === "বাকি" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {watchedPaymentMethod}
                    </Badge>
                  </div>
                  
                  {/* Mixed Payment Preview */}
                  {form.watch("paymentMethod") === "মিশ্র" && watchedAmount && watchedPaidAmount && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300 bengali-font">পেইড:</span>
                          <span className="font-bold text-blue-600 number-font">৳{formatCurrency(parseFloat(watchedPaidAmount))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700 dark:text-red-300 bengali-font">বাকি:</span>
                          <span className="font-bold text-red-600 number-font">৳{formatCurrency(Math.max(0, parseFloat(watchedAmount) - parseFloat(watchedPaidAmount)))}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Due Payment Preview */}
                  {form.watch("paymentMethod") === "বাকি" && parseFloat(watchedAmount || "0") > 0 && (
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs text-orange-700 dark:text-orange-300 bengali-font font-medium">
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
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm bengali-font rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
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

      {/* Success Popup Modal */}
      <SuccessPopup 
        show={showSuccessPopup}
        customerName={successData.customerName}
        amount={successData.amount}
        onClose={() => {
          setShowSuccessPopup(false);
          setLocation("/");
        }}
      />
    </div>
  );
}