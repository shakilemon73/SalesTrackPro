import { useState, useEffect } from "react";
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
import { useOfflineAuth } from "@/hooks/use-offline-auth";
import { usePureOfflineCreateSale, usePureOfflineCustomers, usePureOfflineCreateCustomer } from "@/hooks/use-pure-offline-data";
import { 
  ArrowLeft, Check, DollarSign, User, CreditCard, 
  Calculator, Package, Phone, Plus, ChevronUp,
  ChevronDown, Clock, MapPin, Hash, Wallet, TrendingUp,
  Receipt, Shield, Sparkles, X, MessageCircle, CheckCircle2,
  Star, Home, UserPlus, Save
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

// Success Popup Component
const SuccessPopup = ({ show, onClose, customerName, amount }: {
  show: boolean;
  onClose: () => void;
  customerName: string;
  amount: string;
}) => {
  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-white rounded-t-3xl p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Check className="w-10 h-10 text-white animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">বিক্রয় সম্পন্ন!</h2>
              <p className="text-gray-600">
                <span className="font-semibold">{customerName}</span> এর কাছে{' '}
                <span className="font-bold text-emerald-600">৳{formatCurrency(parseFloat(amount))}</span>{' '}
                টাকার বিক্রয় সফলভাবে সংরক্ষিত হয়েছে
              </p>
            </div>

            <div className="w-full space-y-3 pt-2">
              <Button
                onClick={onClose}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-base rounded-xl shadow-lg"
              >
                <Home className="w-5 h-5 mr-2" />
                ড্যাশবোর্ডে ফিরুন
              </Button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full h-10 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 rounded-lg transition-colors"
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

export default function SalesEntryPureOffline() {
  const [, setLocation] = useLocation();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState({ customerName: '', amount: '' });
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useOfflineAuth();
  const { data: customers = [] } = usePureOfflineCustomers();
  const createSale = usePureOfflineCreateSale();
  const createCustomer = usePureOfflineCreateCustomer();

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

  const watchPaymentMethod = form.watch("paymentMethod");
  const watchCustomerName = form.watch("customerName");

  // Filter customers based on input
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(watchCustomerName.toLowerCase())
  ).slice(0, 5);

  const handleCreateCustomer = async (customerData: any) => {
    try {
      const newCustomer = await createCustomer.mutateAsync({
        name: customerData.customerName,
        phone_number: customerData.customerPhone,
        address: customerData.customerAddress || '',
      });
      
      setSelectedCustomer(newCustomer);
      setShowNewCustomerForm(false);
      toast({
        title: "গ্রাহক যোগ করা হয়েছে",
        description: `${customerData.customerName} সফলভাবে যোগ করা হয়েছে`,
      });
      return newCustomer;
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "গ্রাহক যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      throw error;
    }
  };

  const onSubmit = async (formData: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
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
      
      const saleData = {
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
        sale_date: new Date().toISOString()
      };
      
      await createSale.mutateAsync(saleData);
      
      setSuccessData({
        customerName: formData.customerName,
        amount: formData.amount,
      });
      setShowSuccessPopup(true);
      form.reset();
      setSelectedCustomer(null);
      
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "বিক্রয় সংরক্ষণে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">নতুন বিক্রয়</h1>
              <p className="text-xs text-gray-500">অফলাইন মোড</p>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Status */}
      <div className="px-4 py-2 bg-green-50 border-b border-green-200">
        <div className="flex items-center gap-2 text-green-700 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          সম্পূর্ণ অফলাইন মোড - সব তথ্য আপনার ডিভাইসে সংরক্ষিত হবে
        </div>
      </div>

      {/* Form */}
      <div className="p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Name */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4" />
                  গ্রাহকের নাম *
                </label>
                <div className="relative">
                  <Input
                    {...form.register("customerName")}
                    placeholder="গ্রাহকের নাম লিখুন..."
                    className="text-center"
                    onFocus={() => setShowCustomerSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
                  />
                  
                  {/* Customer Suggestions */}
                  {showCustomerSuggestions && filteredCustomers.length > 0 && watchCustomerName && (
                    <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            form.setValue("customerName", customer.name);
                            form.setValue("customerPhone", customer.phone_number || "");
                            form.setValue("customerAddress", customer.address || "");
                            setShowCustomerSuggestions(false);
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            {customer.phone_number && (
                              <p className="text-xs text-gray-500">{customer.phone_number}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {form.formState.errors.customerName && (
                  <p className="text-red-500 text-xs">{form.formState.errors.customerName.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amount */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  বিক্রয়ের পরিমাণ *
                </label>
                <Input
                  {...form.register("amount")}
                  placeholder="০"
                  type="number"
                  className="text-center text-xl font-bold"
                />
                {form.formState.errors.amount && (
                  <p className="text-red-500 text-xs">{form.formState.errors.amount.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CreditCard className="w-4 h-4" />
                  পেমেন্ট পদ্ধতি
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["নগদ", "বাকি", "মিশ্র"] as const).map((method) => (
                    <label key={method} className="cursor-pointer">
                      <input
                        type="radio"
                        value={method}
                        {...form.register("paymentMethod")}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                        watchPaymentMethod === method
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}>
                        <span className="text-sm font-medium">{method}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Paid Amount for Mixed Payment */}
                {watchPaymentMethod === "মিশ্র" && (
                  <div className="mt-3">
                    <label className="text-sm text-gray-600 mb-1 block">পরিশোধিত পরিমাণ</label>
                    <Input
                      {...form.register("paidAmount")}
                      placeholder="পরিশোধিত পরিমাণ"
                      type="number"
                      className="text-center"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Description */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Package className="w-4 h-4" />
                  পণ্যের বিবরণ
                </label>
                <Input
                  {...form.register("productDescription")}
                  placeholder="পণ্যের নাম বা বিবরণ..."
                  className="text-center"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  সংরক্ষণ করা হচ্ছে...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  বিক্রয় সংরক্ষণ করুন
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      <SuccessPopup
        show={showSuccessPopup}
        onClose={() => {
          setShowSuccessPopup(false);
          setLocation("/");
        }}
        customerName={successData.customerName}
        amount={successData.amount}
      />
    </div>
  );
}