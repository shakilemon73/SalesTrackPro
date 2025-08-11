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
import { apiRequest } from "@/lib/queryClient";
import { getBengaliDate, toBengaliNumber, formatCurrency } from "@/lib/bengali-utils";

const DEMO_USER_ID = "demo-user-123";

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
    queryKey: ['/api/customers', DEMO_USER_ID],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', DEMO_USER_ID],
  });

  const createSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      return await apiRequest('POST', `/api/sales/${DEMO_USER_ID}`, saleData);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "বিক্রয় সফলভাবে সংরক্ষিত হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      setLocation("/sales");
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "বিক্রয় সংরক্ষণে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

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
    
    // Recalculate total price
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : newItems[index].unitPrice;
      newItems[index].totalPrice = quantity * parseFloat(unitPrice || "0");
    }
    
    setItems(newItems);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    if (product) {
      updateItem(index, 'productId', productId);
      updateItem(index, 'productName', product.name);
      updateItem(index, 'unitPrice', product.sellingPrice);
      updateItem(index, 'totalPrice', items[index].quantity * parseFloat(product.sellingPrice));
    }
  };

  const selectCustomer = (customerId: string) => {
    const customer = customers.find((c: any) => c.id === customerId);
    if (customer) {
      setSelectedCustomerId(customerId);
      form.setValue('customerName', customer.name);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const paidAmount = parseFloat(form.watch('paidAmount') || "0");
  const dueAmount = totalAmount - paidAmount;

  const onSubmit = (data: z.infer<typeof saleSchema>) => {
    if (items.some(item => !item.productName || !item.unitPrice)) {
      toast({
        title: "অসম্পূর্ণ তথ্য!",
        description: "সব পণ্যের তথ্য পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      customerId: selectedCustomerId || undefined,
      customerName: data.customerName,
      totalAmount: totalAmount.toString(),
      paidAmount: data.paidAmount,
      dueAmount: dueAmount.toString(),
      paymentMethod: data.paymentMethod,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice.toString(),
      })),
    };

    createSaleMutation.mutate(saleData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/sales">
              <button className="p-2">
                <i className="fas fa-arrow-left"></i>
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">নতুন বিক্রয়</h1>
              <p className="text-sm text-green-100">{getBengaliDate()}</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-user text-primary mr-2"></i>
              গ্রাহকের তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>বিদ্যমান গ্রাহক নির্বাচন করুন</Label>
              <Select onValueChange={selectCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="গ্রাহক নির্বাচন করুন (ঐচ্ছিক)" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                      {customer.phoneNumber && (
                        <span className="text-gray-500 ml-2">({customer.phoneNumber})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>গ্রাহকের নাম *</Label>
              <Input
                {...form.register('customerName')}
                placeholder="গ্রাহকের নাম লিখুন"
              />
              {form.formState.errors.customerName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-box text-primary mr-2"></i>
                পণ্যের তালিকা
              </div>
              <Button type="button" onClick={addItem} size="sm" className="bg-success">
                <i className="fas fa-plus mr-1"></i>
                যোগ করুন
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">পণ্য {toBengaliNumber(index + 1)}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  )}
                </div>

                {/* Product Selection */}
                <div>
                  <Label>পণ্য নির্বাচন করুন</Label>
                  <Select onValueChange={(productId) => selectProduct(index, productId)}>
                    <SelectTrigger>
                      <SelectValue placeholder="পণ্য নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product: any) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(parseFloat(product.sellingPrice))} টাকা
                          <span className="text-gray-500 ml-2">
                            (স্টক: {toBengaliNumber(product.currentStock)})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manual Product Entry */}
                <div>
                  <Label>অথবা পণ্যের নাম লিখুন</Label>
                  <Input
                    value={item.productName}
                    onChange={(e) => updateItem(index, 'productName', e.target.value)}
                    placeholder="পণ্যের নাম"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>পরিমাণ</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="number-font"
                    />
                  </div>
                  <div>
                    <Label>দাম (টাকা)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                      placeholder="০"
                      className="number-font"
                    />
                  </div>
                  <div>
                    <Label>মোট</Label>
                    <div className="p-2 bg-gray-100 rounded text-center number-font font-medium">
                      {formatCurrency(item.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-money-bill-wave text-primary mr-2"></i>
              পেমেন্ট তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>মোট পরিমাণ</Label>
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <span className="text-lg font-bold text-primary number-font">
                    {formatCurrency(totalAmount)} টাকা
                  </span>
                </div>
              </div>
              <div>
                <Label>পেমেন্ট পদ্ধতি *</Label>
                <Select 
                  value={form.watch('paymentMethod')} 
                  onValueChange={(value) => form.setValue('paymentMethod', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="নগদ">নগদ</SelectItem>
                    <SelectItem value="বাকি">বাকি</SelectItem>
                    <SelectItem value="মিশ্র">মিশ্র</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>পেমেন্ট পরিমাণ (টাকা) *</Label>
              <Input
                {...form.register('paidAmount')}
                type="number"
                step="0.01"
                placeholder="পেমেন্ট পরিমাণ"
                className="number-font"
              />
              {form.formState.errors.paidAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.paidAmount.message}
                </p>
              )}
            </div>

            {dueAmount > 0 && (
              <div className="p-3 bg-warning/10 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-warning">বাকি পরিমাণ:</span>
                  <span className="text-lg font-bold text-warning number-font">
                    {formatCurrency(dueAmount)} টাকা
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pb-20">
          <Link to="/sales" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              বাতিল
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1 bg-primary"
            disabled={createSaleMutation.isPending}
          >
            {createSaleMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                বিক্রয় সংরক্ষণ
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
