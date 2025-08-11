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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getBengaliDate, toBengaliNumber, formatCurrency } from "@/lib/bengali-utils";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";

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

export default function SalesEntry() {
  const [, setLocation] = useLocation();
  const [items, setItems] = useState<SaleItem[]>([
    { productName: "", quantity: 1, unitPrice: "", totalPrice: 0 }
  ]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  
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
      const dbSaleData = {
        customer_id: formData.customer_id,
        customer_name: formData.customer_name,
        total_amount: formData.total_amount,
        paid_amount: formData.paid_amount,
        due_amount: formData.due_amount,
        payment_method: formData.payment_method,
        items: formData.items
      };
      console.log('Transformed DB saleData:', dbSaleData);
      return await supabaseService.createSale(CURRENT_USER_ID, dbSaleData);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "বিক্রয় সফলভাবে রেকর্ড করা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setLocation("/sales");
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
  const paidAmount = parseFloat(form.watch("paidAmount")) || 0;
  const dueAmount = totalAmount - paidAmount;

  const addItem = () => {
    setItems([...items, { productName: "", quantity: 1, unitPrice: "", totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].totalPrice = quantity * unitPrice;
    }
    
    setItems(newItems);
  };

  const onSubmit = (data: z.infer<typeof saleSchema>) => {
    if (items.some(item => !item.productName || !item.unitPrice)) {
      toast({
        title: "ত্রুটি!",
        description: "সকল পণ্যের তথ্য সম্পূর্ণ করুন",
        variant: "destructive",
      });
      return;
    }

    const selectedCustomer = customers.find(c => c.name === data.customerName);
    
    const saleData = {
      customer_id: selectedCustomer?.id || null,
      customer_name: data.customerName,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      due_amount: dueAmount,
      payment_method: data.paymentMethod,
      items: items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice.toString()
      }))
    };

    createSaleMutation.mutate(saleData);
  };

  return (
    <div className="min-h-screen bg-background-app">
      {/* Premium Header */}
      <div className="header-bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/sales">
              <button className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20">
                <i className="fas fa-arrow-left text-white"></i>
              </button>
            </Link>
            <div>
              <h1 className="heading-2 text-white mb-0.5">নতুন বিক্রয়</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-white/90 bengali-font">{getBengaliDate()}</p>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-200 font-semibold">নতুন এন্ট্রি</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              form="sales-form"
              type="submit"
              disabled={createSaleMutation.isPending}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              {createSaleMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-save mr-2"></i>
              )}
              সংরক্ষণ
            </Button>
          </div>
        </div>
      </div>

      <form id="sales-form" onSubmit={form.handleSubmit(onSubmit)} className="p-4 pb-20 space-y-6">
        {/* Customer Selection */}
        <Card className="enhanced-card">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center bengali-font">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-user text-blue-600"></i>
              </div>
              গ্রাহকের তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="bengali-font">গ্রাহকের নাম *</Label>
              <Select 
                value={form.watch("customerName")} 
                onValueChange={(value) => form.setValue("customerName", value)}
              >
                <SelectTrigger className="enhanced-select mt-1">
                  <SelectValue placeholder="গ্রাহক নির্বাচন করুন..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.name}>
                      <div className="flex items-center space-x-2">
                        <span className="bengali-font">{customer.name}</span>
                        {customer.total_credit > 0 && (
                          <span className="text-xs text-red-600 bengali-font">
                            (বাকি: {formatCurrency(customer.total_credit)})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.customerName && (
                <p className="text-sm text-red-600 mt-1 bengali-font">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Items */}
        <Card className="enhanced-card">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center justify-between bengali-font">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-shopping-cart text-green-600"></i>
                </div>
                পণ্যের তালিকা
              </div>
              <Button
                type="button"
                onClick={addItem}
                className="action-btn-sm action-btn-secondary"
              >
                <i className="fas fa-plus mr-2"></i>
                যোগ করুন
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="product-item">
                <div className="responsive-grid-2 gap-4">
                  <div>
                    <Label className="bengali-font">পণ্যের নাম *</Label>
                    <Input
                      value={item.productName}
                      onChange={(e) => updateItem(index, 'productName', e.target.value)}
                      placeholder="পণ্যের নাম লিখুন..."
                      className="enhanced-input mt-1"
                    />
                  </div>
                  <div>
                    <Label className="bengali-font">পরিমাণ *</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="enhanced-input mt-1"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label className="bengali-font">একক মূল্য (টাকা) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                      placeholder="০.০০"
                      className="enhanced-input mt-1"
                    />
                  </div>
                  <div>
                    <Label className="bengali-font">মোট মূল্য</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-xl border">
                      <span className="currency-display text-lg font-semibold text-gray-900">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="mt-3 text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    মুছে ফেলুন
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="enhanced-card">
          <CardHeader className="enhanced-card-header">
            <CardTitle className="flex items-center bengali-font">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-credit-card text-purple-600"></i>
              </div>
              পেমেন্ট তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="responsive-grid-2 gap-4">
              <div>
                <Label className="bengali-font">পেমেন্ট পদ্ধতি *</Label>
                <Select 
                  value={form.watch("paymentMethod")} 
                  onValueChange={(value) => form.setValue("paymentMethod", value as any)}
                >
                  <SelectTrigger className="enhanced-select mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="নগদ">নগদ</SelectItem>
                    <SelectItem value="বাকি">বাকি</SelectItem>
                    <SelectItem value="মিশ্র">মিশ্র</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="bengali-font">পরিশোধিত পরিমাণ (টাকা) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("paidAmount")}
                  placeholder="০.০০"
                  className="enhanced-input mt-1"
                />
                {form.formState.errors.paidAmount && (
                  <p className="text-sm text-red-600 mt-1 bengali-font">
                    {form.formState.errors.paidAmount.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="enhanced-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="heading-3 text-blue-900 mb-4 bengali-font">বিক্রয় সারাংশ</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="body-regular text-blue-700 bengali-font">মোট পরিমাণ:</span>
                <span className="currency-display text-xl font-bold text-blue-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-regular text-blue-700 bengali-font">পরিশোধিত:</span>
                <span className="currency-display text-lg font-semibold text-green-700">
                  {formatCurrency(paidAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-blue-200 pt-3">
                <span className="body-regular text-blue-700 bengali-font">বাকি পরিমাণ:</span>
                <span className={`currency-display text-lg font-bold ${
                  dueAmount > 0 ? 'text-red-700' : 'text-green-700'
                }`}>
                  {formatCurrency(dueAmount)}
                </span>
              </div>
            </div>
            
            {dueAmount > 0 && (
              <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-exclamation-triangle text-orange-600"></i>
                  <span className="text-sm text-orange-800 bengali-font font-medium">
                    এই বিক্রয়ে {formatCurrency(dueAmount)} টাকা বাকি থাকবে
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="responsive-grid-2 gap-4">
          <Link to="/customers/new">
            <Card className="enhanced-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-user-plus text-blue-600 text-xl"></i>
                </div>
                <h3 className="body-large font-semibold text-gray-900 bengali-font">নতুন গ্রাহক</h3>
                <p className="caption text-gray-500 bengali-font">গ্রাহক যোগ করুন</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/inventory">
            <Card className="enhanced-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-boxes text-green-600 text-xl"></i>
                </div>
                <h3 className="body-large font-semibold text-gray-900 bengali-font">ইনভেন্টরি</h3>
                <p className="caption text-gray-500 bengali-font">স্টক দেখুন</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </form>
    </div>
  );
}