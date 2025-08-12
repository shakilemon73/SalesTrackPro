import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import { 
  ArrowLeft, Plus, Minus, ShoppingCart, User, 
  Calculator, CreditCard, Banknote, DollarSign,
  Trash2, Package, Check, AlertCircle
} from "lucide-react";

const saleSchema = z.object({
  customerName: z.string().min(1, "গ্রাহকের নাম আবশ্যক"),
  paymentMethod: z.enum(["নগদ", "বাকি", "মিশ্র"]),
  paidAmount: z.string().min(1, "পেমেন্ট পরিমাণ আবশ্যক"),
});

interface SaleItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: number;
}

export default function SalesEntryMobileOptimized() {
  const [, setLocation] = useLocation();
  const [items, setItems] = useState<SaleItem[]>([
    { productName: "", quantity: 1, unitPrice: "", totalPrice: 0 }
  ]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(1); // Multi-step form for mobile
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerName: "",
      paymentMethod: "নগদ" as const,
      paidAmount: "",
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', CURRENT_USER_ID],
    queryFn: () => supabaseService.getProducts(CURRENT_USER_ID),
  });

  const createSaleMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { getBangladeshTimeISO } = await import('@/lib/bengali-utils');
      const dbSaleData = {
        customer_id: formData.customer_id,
        customer_name: formData.customer_name,
        total_amount: formData.total_amount,
        paid_amount: formData.paid_amount,
        due_amount: formData.due_amount,
        payment_method: formData.payment_method,
        items: formData.items,
        sale_date: getBangladeshTimeISO()
      };
      return await supabaseService.createSale(CURRENT_USER_ID, dbSaleData);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "বিক্রয় সফলভাবে রেকর্ড করা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setLocation("/");
    },
    onError: (error) => {
      console.error('Sale creation error:', error);
      toast({
        title: "ত্রুটি!",
        description: "বিক্রয় রেকর্ড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // Calculate totals
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const paidAmount = parseFloat(form.watch("paidAmount") || "0");
  const dueAmount = totalAmount - paidAmount;

  const updateItemTotal = (index: number, quantity: number, unitPrice: string) => {
    const price = parseFloat(unitPrice) || 0;
    const total = quantity * price;
    
    const newItems = [...items];
    newItems[index] = { ...newItems[index], quantity, unitPrice, totalPrice: total };
    setItems(newItems);
  };

  const addNewItem = () => {
    if (items.length < 10) { // Limit to 10 items for mobile
      setItems([...items, { productName: "", quantity: 1, unitPrice: "", totalPrice: 0 }]);
    }
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const onSubmit = (data: z.infer<typeof saleSchema>) => {
    if (items.length === 0 || items.some(item => !item.productName || !item.unitPrice)) {
      toast({
        title: "ত্রুটি!",
        description: "সব পণ্যের তথ্য পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      customer_id: selectedCustomerId || "walk-in-customer",
      customer_name: data.customerName,
      total_amount: totalAmount.toString(),
      paid_amount: data.paidAmount,
      due_amount: dueAmount.toString(),
      payment_method: data.paymentMethod,
      items: items,
    };

    createSaleMutation.mutate(saleData);
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomerId(customerId);
      form.setValue("customerName", customer.name);
    }
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
                  নতুন বিক্রয়
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <ShoppingCart className="w-3 h-3" />
                  <span>পণ্য বিক্রয় এন্ট্রি</span>
                </div>
              </div>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Step 1: Customer Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Card className="border-0 shadow-md p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    গ্রাহক নির্বাচন
                  </h3>
                </div>

                {/* Existing Customer Select */}
                <div className="space-y-2 mb-4">
                  <Label className="text-xs bengali-font">পূর্বের গ্রাহক</Label>
                  <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="গ্রাহক নির্বাচন করুন..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="bengali-font">{customer.name}</span>
                            {customer.phone_number && (
                              <span className="text-xs text-slate-500 ml-2">{customer.phone_number}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manual Customer Name */}
                <div className="space-y-2">
                  <Label className="text-xs bengali-font">অথবা নতুন নাম লিখুন</Label>
                  <Input
                    {...form.register("customerName")}
                    placeholder="গ্রাহকের নাম লিখুন..."
                    className="h-10 text-sm"
                  />
                </div>

                {form.formState.errors.customerName && (
                  <p className="text-red-500 text-xs mt-1 bengali-font">
                    {form.formState.errors.customerName.message}
                  </p>
                )}
              </Card>

              <Button 
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={!form.watch("customerName")}
              >
                পরবর্তী ধাপ
                <Package className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Product Items */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Card className="border-0 shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                      পণ্য তালিকা
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {toBengaliNumber(items.length)} আইটেম
                  </Badge>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bengali-font">
                          পণ্য #{toBengaliNumber(index + 1)}
                        </span>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Input
                          placeholder="পণ্যের নাম"
                          value={item.productName}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].productName = e.target.value;
                            setItems(newItems);
                          }}
                          className="h-9 text-sm"
                        />
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs bengali-font">পরিমাণ</Label>
                            <div className="flex items-center space-x-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateItemTotal(index, Math.max(1, item.quantity - 1), item.unitPrice)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemTotal(index, parseInt(e.target.value) || 1, item.unitPrice)}
                                className="h-8 text-center text-xs number-font"
                                min="1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateItemTotal(index, item.quantity + 1, item.unitPrice)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs bengali-font">দাম</Label>
                            <Input
                              type="number"
                              placeholder="০"
                              value={item.unitPrice}
                              onChange={(e) => updateItemTotal(index, item.quantity, e.target.value)}
                              className="h-8 text-xs number-font"
                            />
                          </div>

                          <div>
                            <Label className="text-xs bengali-font">মোট</Label>
                            <div className="h-8 bg-slate-100 dark:bg-slate-700 border rounded-md flex items-center justify-center text-xs font-bold text-emerald-600">
                              {formatCurrency(item.totalPrice)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {items.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addNewItem}
                    className="w-full mt-3 h-10 border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    আরো পণ্য যোগ করুন
                  </Button>
                )}
              </Card>

              {/* Total Summary */}
              <Card className="border-0 shadow-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4">
                <div className="text-center">
                  <p className="text-xs text-emerald-100 bengali-font mb-1">মোট বিক্রয়</p>
                  <p className="text-2xl font-bold number-font">{formatCurrency(totalAmount)}</p>
                </div>
              </Card>

              <div className="flex space-x-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 h-12"
                >
                  পূর্ববর্তী
                </Button>
                <Button 
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600"
                  disabled={totalAmount === 0}
                >
                  পরবর্তী ধাপ
                  <CreditCard className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Card className="border-0 shadow-md p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                    পেমেন্ট তথ্য
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label className="text-xs bengali-font">পেমেন্ট পদ্ধতি</Label>
                    <Select value={form.watch("paymentMethod")} onValueChange={(value) => form.setValue("paymentMethod", value as "নগদ" | "বাকি" | "মিশ্র")}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="নগদ">
                          <div className="flex items-center space-x-2">
                            <Banknote className="w-4 h-4 text-green-600" />
                            <span className="bengali-font">নগদ</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="বাকি">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span className="bengali-font">বাকি</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="মিশ্র">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                            <span className="bengali-font">মিশ্র</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Paid Amount */}
                  <div className="space-y-2">
                    <Label className="text-xs bengali-font">প্রদেয় টাকা</Label>
                    <Input
                      {...form.register("paidAmount")}
                      type="number"
                      placeholder="০"
                      className="h-12 text-lg text-center number-font"
                    />
                    {form.formState.errors.paidAmount && (
                      <p className="text-red-500 text-xs bengali-font">
                        {form.formState.errors.paidAmount.message}
                      </p>
                    )}
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[100, 500, 1000, totalAmount].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => form.setValue("paidAmount", amount.toString())}
                      >
                        {formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Payment Summary */}
              <Card className="border-0 shadow-md p-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3">
                  পেমেন্ট সারসংক্ষেপ
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 bengali-font">মোট বিক্রয়</span>
                    <span className="font-medium text-slate-900 dark:text-white number-font">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 bengali-font">প্রদেয় টাকা</span>
                    <span className="font-medium text-green-600 number-font">
                      {formatCurrency(paidAmount)}
                    </span>
                  </div>
                  <hr className="border-slate-200 dark:border-slate-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 dark:text-white font-medium bengali-font">বাকি টাকা</span>
                    <span className={`font-bold number-font ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(dueAmount)}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="flex space-x-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 h-12"
                >
                  পূর্ববর্তী
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600"
                  disabled={createSaleMutation.isPending}
                >
                  {createSaleMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      সেভ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      বিক্রয় সম্পন্ন
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}