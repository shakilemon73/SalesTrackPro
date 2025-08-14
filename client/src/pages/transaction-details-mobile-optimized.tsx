import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, toBengaliNumber, getBengaliDate } from "@/lib/bengali-utils";
import { supabaseService } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, Save, Trash2, Edit3, Clock, User, Phone, MapPin,
  Receipt, Wallet, CreditCard, Package, CheckCircle2, AlertTriangle,
  Star, Sparkles, Copy, Share2, Download, Hash, Calendar,
  ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight
} from "lucide-react";

// Schema for editing transaction details
const transactionEditSchema = z.object({
  customer_name: z.string().min(1, "গ্রাহকের নাম আবশ্যক"),
  total_amount: z.string().min(1, "মোট টাকার পরিমাণ আবশ্যক"),
  paid_amount: z.string().optional(),
  payment_method: z.string().min(1, "পেমেন্ট পদ্ধতি আবশ্যক"),
  description: z.string().optional(),
  items: z.array(z.any()).optional(),
});

type TransactionEditForm = z.infer<typeof transactionEditSchema>;

interface TransactionDetailsProps {
  type: string; // 'sale', 'expense', 'collection'
  id: string; 
}

export default function TransactionDetailsMobileOptimized({ type, id }: TransactionDetailsProps) {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const { toast } = useToast();
  const { userId, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Fetch transaction details based on type
  const { data: transaction, isLoading: transactionLoading, error: transactionError } = useQuery({
    queryKey: ['transaction', type, id, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      switch (type) {
        case 'sale':
          const sales = await supabaseService.getSales(userId);
          return sales.find(sale => sale.id === id);
        case 'expense':
          const expenses = await supabaseService.getExpenses(userId);
          return expenses.find(expense => expense.id === id);
        case 'collection':
          const collections = await supabaseService.getCollections(userId);
          return collections.find(collection => collection.id === id);
        default:
          return null;
      }
    },
    enabled: !!userId && !!id && !!type,
  });

  // Fetch customers for customer dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ['customers', userId],
    queryFn: () => userId ? supabaseService.getCustomers(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  // Helper functions to access properties safely
  const getTransactionName = (trans: any) => {
    if (type === 'sale') return trans?.customer_name || "";
    if (type === 'expense') return trans?.description || "";
    if (type === 'collection') return `আদায় - ${customers.find(c => c.id === trans?.customer_id)?.name || 'অজানা গ্রাহক'}` || "";
    return "";
  };

  const getTransactionAmount = (trans: any) => {
    if (type === 'sale') return trans?.total_amount?.toString() || "";
    if (type === 'expense') return trans?.amount?.toString() || "";
    if (type === 'collection') return trans?.amount?.toString() || "";
    return "";
  };

  const getTransactionPaidAmount = (trans: any) => {
    if (type === 'sale') return trans?.paid_amount?.toString() || "";
    return "";
  };

  const getTransactionPaymentMethod = (trans: any) => {
    if (type === 'sale') return trans?.payment_method || "নগদ";
    if (type === 'expense') return trans?.category || "নগদ";
    return "নগদ";
  };

  const getTransactionDescription = (trans: any) => {
    if (type === 'sale') return trans?.items?.map((item: any) => item.productName).join(', ') || "";
    if (type === 'expense') return trans?.description || "";
    return "";
  };

  const getTransactionItems = (trans: any) => {
    if (type === 'sale') return trans?.items || [];
    return [];
  };

  const form = useForm<TransactionEditForm>({
    resolver: zodResolver(transactionEditSchema),
    defaultValues: {
      customer_name: getTransactionName(transaction),
      total_amount: getTransactionAmount(transaction),
      paid_amount: getTransactionPaidAmount(transaction),
      payment_method: getTransactionPaymentMethod(transaction),
      description: getTransactionDescription(transaction),
      items: getTransactionItems(transaction),
    },
  });

  // Reset form when transaction data loads
  useEffect(() => {
    if (transaction) {
      form.reset({
        customer_name: getTransactionName(transaction),
        total_amount: getTransactionAmount(transaction),
        paid_amount: getTransactionPaidAmount(transaction),
        payment_method: getTransactionPaymentMethod(transaction),
        description: getTransactionDescription(transaction),
        items: getTransactionItems(transaction),
      });
    }
  }, [transaction, form, customers, type]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: TransactionEditForm) => {
      if (!userId || !transaction) throw new Error("Invalid transaction or user");
      
      const updateData = {
        customer_name: data.customer_name,
        total_amount: parseFloat(data.total_amount),
        paid_amount: parseFloat(data.paid_amount || "0"),
        due_amount: parseFloat(data.total_amount) - parseFloat(data.paid_amount || "0"),
        payment_method: data.payment_method,
        description: data.description || "",
        items: data.items || [],
      };

      switch (type) {
        case 'sale':
          return supabaseService.updateSale(transaction.id, updateData);
        case 'expense':
          return supabaseService.updateExpense(transaction.id, {
            description: data.description || data.customer_name,
            amount: parseFloat(data.total_amount),
            category: data.payment_method,
          });
        default:
          throw new Error("Update not supported for this transaction type");
      }
    },
    onSuccess: () => {
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 3000);
      toast({
        title: "সফল!",
        description: "লেনদেনের তথ্য আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['transaction', type, id] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি!",
        description: "লেনদেনের তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !transaction) throw new Error("Invalid transaction or user");
      
      switch (type) {
        case 'sale':
          return supabaseService.deleteSale(transaction.id);
        case 'expense':
          return supabaseService.deleteExpense(transaction.id);
        default:
          throw new Error("Delete not supported for this transaction type");
      }
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "লেনদেন মুছে ফেলা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setLocation('/transactions');
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি!",
        description: "লেনদেন মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransactionEditForm) => {
    updateMutation.mutate(data);
  };

  // Loading states
  if (authLoading || transactionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 bengali-font">লেনদেনের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Error or Transaction not found
  if (transactionError || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2 bengali-font">
              লেনদেন খুঁজে পাওয়া যায়নি
            </h1>
            <p className="text-gray-600 mb-6 bengali-font">
              এই লেনদেনের তথ্য আর উপলব্ধ নেই বা ভুল আইডি দেওয়া হয়েছে।
            </p>
            <div className="space-y-3">
              <Link to="/transactions">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Receipt className="w-4 h-4 mr-2" />
                  লেনদেন তালিকায় ফিরে যান
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  হোম পেজে যান
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get transaction type info
  const getTransactionTypeInfo = () => {
    switch (type) {
      case 'sale':
        return {
          title: 'বিক্রয় বিবরণ',
          icon: <ShoppingCart className="w-6 h-6" />,
          color: 'from-green-500 to-emerald-600',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
        };
      case 'expense':
        return {
          title: 'খরচ বিবরণ',
          icon: <ArrowDownRight className="w-6 h-6" />,
          color: 'from-red-500 to-rose-600',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
        };
      case 'collection':
        return {
          title: 'আদায় বিবরণ',
          icon: <Wallet className="w-6 h-6" />,
          color: 'from-blue-500 to-indigo-600',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
        };
      default:
        return {
          title: 'লেনদেন বিবরণ',
          icon: <Receipt className="w-6 h-6" />,
          color: 'from-gray-500 to-slate-600',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
        };
    }
  };

  const typeInfo = getTransactionTypeInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-white animate-bounce" />
                </div>
                <div className="absolute -top-2 -left-2">
                  <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-900 bengali-font">
                আপডেট সম্পন্ন!
              </h2>
              <p className="text-sm text-slate-600 bengali-font">
                লেনদেনের তথ্য সফলভাবে আপডেট হয়েছে
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/transactions">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${typeInfo.color} text-white`}>
                  {typeInfo.icon}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 bengali-font">
                    {typeInfo.title}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {getBengaliDate(new Date(transaction.created_at))}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3 text-xs"
                onClick={() => setIsEditing(!isEditing)}
                data-testid="button-edit-transaction"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                {isEditing ? 'বাতিল' : 'এডিট'}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    data-testid="button-delete-transaction"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    মুছুন
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="bengali-font">লেনদেন মুছে ফেলুন?</AlertDialogTitle>
                    <AlertDialogDescription className="bengali-font">
                      এই লেনদেনটি স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>বাতিল</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      মুছে ফেলুন
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        
        {/* Transaction Summary Card */}
        <Card className={`border-0 shadow-lg ${typeInfo.bgColor}`}>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {/* Transaction ID */}
              <div className="flex items-center justify-center space-x-2 text-slate-500">
                <Hash className="w-4 h-4" />
                <span className="text-sm font-mono">
                  {transaction.id.slice(-8).toUpperCase()}
                </span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>

              {/* Amount Display */}
              <div className="space-y-2">
                <p className="text-sm text-slate-600 bengali-font">
                  {type === 'sale' ? 'বিক্রয়ের পরিমাণ' : type === 'expense' ? 'খরচের পরিমাণ' : 'আদায়ের পরিমাণ'}
                </p>
                <p className={`text-4xl font-black ${typeInfo.textColor} number-font`}>
                  ৳{formatCurrency(parseFloat(getTransactionAmount(transaction)) || 0)}
                </p>
                
                {type === 'sale' && (transaction as any).due_amount > 0 && (
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <span className="text-green-600">
                      পরিশোধিত: ৳{formatCurrency((transaction as any).paid_amount || 0)}
                    </span>
                    <span className="text-red-600">
                      বাকি: ৳{formatCurrency((transaction as any).due_amount || 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method Badge */}
              <Badge variant="secondary" className="px-4 py-2 text-sm bengali-font">
                {getTransactionPaymentMethod(transaction)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <h2 className="text-lg font-bold text-slate-900 bengali-font">
              {isEditing ? 'তথ্য সম্পাদনা' : 'বিস্তারিত তথ্য'}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {isEditing ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Customer Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 bengali-font">
                    গ্রাহকের নাম / বিবরণ
                  </label>
                  <Input
                    {...form.register("customer_name")}
                    placeholder="গ্রাহকের নাম লিখুন"
                    className="h-11 text-base"
                  />
                  {form.formState.errors.customer_name && (
                    <p className="text-sm text-red-600 bengali-font">
                      {form.formState.errors.customer_name.message}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 bengali-font">
                    মোট পরিমাণ (৳)
                  </label>
                  <Input
                    {...form.register("total_amount")}
                    type="number"
                    placeholder="0"
                    className="h-11 text-base number-font"
                  />
                  {form.formState.errors.total_amount && (
                    <p className="text-sm text-red-600 bengali-font">
                      {form.formState.errors.total_amount.message}
                    </p>
                  )}
                </div>

                {/* Paid Amount (for sales) */}
                {type === 'sale' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 bengali-font">
                      পরিশোধিত পরিমাণ (৳)
                    </label>
                    <Input
                      {...form.register("paid_amount")}
                      type="number"
                      placeholder="0"
                      className="h-11 text-base number-font"
                    />
                  </div>
                )}

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 bengali-font">
                    পেমেন্ট পদ্ধতি
                  </label>
                  <Select 
                    value={form.watch("payment_method")} 
                    onValueChange={(value) => form.setValue("payment_method", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="পেমেন্ট পদ্ধতি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="নগদ">নগদ</SelectItem>
                      <SelectItem value="বাকি">বাকি</SelectItem>
                      <SelectItem value="মিশ্র">মিশ্র</SelectItem>
                      <SelectItem value="বিকাশ">বিকাশ</SelectItem>
                      <SelectItem value="নগদ-মোবাইল">নগদ (মোবাইল)</SelectItem>
                      <SelectItem value="রকেট">রকেট</SelectItem>
                      <SelectItem value="ব্যাংক">ব্যাংক ট্রান্সফার</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 bengali-font">
                    অতিরিক্ত বিবরণ
                  </label>
                  <Input
                    {...form.register("description")}
                    placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)"
                    className="h-11 text-base"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        সংরক্ষণ করুন
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-12"
                    onClick={() => setIsEditing(false)}
                  >
                    বাতিল
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                
                {/* Customer Info */}
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                  <User className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 bengali-font">গ্রাহক/বিবরণ</p>
                    <p className="text-base text-slate-900 bengali-font">
                      {getTransactionName(transaction) || 'নাম নেই'}
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                  <CreditCard className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 bengali-font">পেমেন্ট পদ্ধতি</p>
                    <p className="text-base text-slate-900 bengali-font">
                      {getTransactionPaymentMethod(transaction)}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 bengali-font">তারিখ ও সময়</p>
                    <p className="text-base text-slate-900 bengali-font">
                      {getBengaliDate(new Date(transaction.created_at))}
                    </p>
                  </div>
                </div>

                {/* Items (for sales) */}
                {type === 'sale' && getTransactionItems(transaction).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 bengali-font">পণ্যের তালিকা</p>
                    <div className="space-y-2">
                      {getTransactionItems(transaction).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Package className="w-4 h-4 text-slate-600" />
                            <div>
                              <p className="text-sm font-medium text-slate-900 bengali-font">
                                {item.productName || 'সাধারণ পণ্য'}
                              </p>
                              <p className="text-xs text-slate-600">
                                পরিমাণ: {toBengaliNumber(item.quantity)} | দর: ৳{formatCurrency(item.unitPrice)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-900 number-font">
                            ৳{formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 flex-col space-y-1">
                <Share2 className="w-4 h-4" />
                <span className="text-xs bengali-font">শেয়ার</span>
              </Button>
              <Button variant="outline" className="h-12 flex-col space-y-1">
                <Download className="w-4 h-4" />
                <span className="text-xs bengali-font">ডাউনলোড</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}