import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getBengaliDate, formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";

const productSchema = z.object({
  name: z.string().min(1, "পণ্যের নাম আবশ্যক"),
  category: z.string().optional(),
  unit: z.string().min(1, "একক আবশ্যক"),
  buyingPrice: z.string().min(1, "ক্রয় মূল্য আবশ্যক"),
  sellingPrice: z.string().min(1, "বিক্রয় মূল্য আবশ্যক"),
  currentStock: z.string().min(0, "স্টক ০ বা তার চেয়ে বেশি হতে হবে"),
  minStockLevel: z.string().min(1, "সর্বনিম্ন স্টক আবশ্যক"),
});

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      unit: "কেজি",
      buyingPrice: "",
      sellingPrice: "",
      currentStock: "0",
      minStockLevel: "5",
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', CURRENT_USER_ID],
    queryFn: () => supabaseService.getProducts(CURRENT_USER_ID),
  });

  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['products', CURRENT_USER_ID, 'low-stock'],
    queryFn: () => supabaseService.getLowStockProducts(CURRENT_USER_ID),
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return await supabaseService.createProduct(CURRENT_USER_ID, productData);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "পণ্য সফলভাবে যোগ করা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      form.reset();
      setIsAddModalOpen(false);
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "পণ্য যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const categories = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)));
  
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock = stockFilter === "all" || 
      (stockFilter === "low" && product.currentStock <= product.minStockLevel) ||
      (stockFilter === "out" && product.currentStock === 0) ||
      (stockFilter === "available" && product.currentStock > product.minStockLevel);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const onSubmit = (data: z.infer<typeof productSchema>) => {
    const productData = {
      name: data.name.trim(),
      category: data.category?.trim() || undefined,
      unit: data.unit,
      buyingPrice: data.buyingPrice,
      sellingPrice: data.sellingPrice,
      currentStock: parseInt(data.currentStock),
      minStockLevel: parseInt(data.minStockLevel),
    };
    
    createProductMutation.mutate(productData);
  };

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { status: "শেষ", color: "error", icon: "fas fa-times-circle" };
    if (currentStock <= minStock) return { status: "কম", color: "warning", icon: "fas fa-exclamation-triangle" };
    return { status: "যথেষ্ট", color: "success", icon: "fas fa-check-circle" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <button className="p-2">
                <i className="fas fa-arrow-left"></i>
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">পণ্য ও স্টক</h1>
              <p className="text-sm text-green-100">
                মোট {toBengaliNumber(products.length)} টি পণ্য
              </p>
            </div>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <i className="fas fa-plus mr-2"></i>
                নতুন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>নতুন পণ্য যোগ করুন</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label>পণ্যের নাম *</Label>
                  <Input
                    {...form.register('name')}
                    placeholder="পণ্যের নাম"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label>ক্যাটেগরি</Label>
                  <Input
                    {...form.register('category')}
                    placeholder="যেমন: খাবার, পানীয়"
                  />
                </div>

                <div>
                  <Label>একক *</Label>
                  <Select value={form.watch('unit')} onValueChange={(value) => form.setValue('unit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="কেজি">কেজি</SelectItem>
                      <SelectItem value="গ্রাম">গ্রাম</SelectItem>
                      <SelectItem value="লিটার">লিটার</SelectItem>
                      <SelectItem value="মিলিলিটার">মিলিলিটার</SelectItem>
                      <SelectItem value="পিস">পিস</SelectItem>
                      <SelectItem value="প্যাকেট">প্যাকেট</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>ক্রয় মূল্য *</Label>
                    <Input
                      {...form.register('buyingPrice')}
                      type="number"
                      step="0.01"
                      placeholder="০"
                      className="number-font"
                    />
                  </div>
                  <div>
                    <Label>বিক্রয় মূল্য *</Label>
                    <Input
                      {...form.register('sellingPrice')}
                      type="number"
                      step="0.01"
                      placeholder="০"
                      className="number-font"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>বর্তমান স্টক *</Label>
                    <Input
                      {...form.register('currentStock')}
                      type="number"
                      min="0"
                      placeholder="০"
                      className="number-font"
                    />
                  </div>
                  <div>
                    <Label>সর্বনিম্ন স্টক *</Label>
                    <Input
                      {...form.register('minStockLevel')}
                      type="number"
                      min="1"
                      placeholder="৫"
                      className="number-font"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary"
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? "যোগ হচ্ছে..." : "পণ্য যোগ করুন"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border-b space-y-3">
        <Input
          placeholder="পণ্যের নাম খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্টক</SelectItem>
              <SelectItem value="available">যথেষ্ট স্টক</SelectItem>
              <SelectItem value="low">কম স্টক</SelectItem>
              <SelectItem value="out">স্টক শেষ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stock Alert */}
      {lowStockProducts.length > 0 && stockFilter === "all" && (
        <div className="p-4 bg-warning/10 border-b border-warning/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-exclamation-triangle text-warning"></i>
              <span className="font-medium text-warning">
                {toBengaliNumber(lowStockProducts.length)} টি পণ্যের স্টক কম
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-warning text-warning"
              onClick={() => setStockFilter("low")}
            >
              দেখুন
            </Button>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-box text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? "কোনো পণ্য পাওয়া যায়নি" : "কোনো পণ্য নেই"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? "আপনার খোঁজা পণ্য খুঁজে পাওয়া যায়নি"
                : "এখনো কোনো পণ্য যোগ করা হয়নি"
              }
            </p>
            <Button 
              className="bg-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fas fa-plus mr-2"></i>
              প্রথম পণ্য যোগ করুন
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product: any) => {
              const stockStatus = getStockStatus(product.currentStock, product.minStockLevel);
              const profit = parseFloat(product.sellingPrice) - parseFloat(product.buyingPrice);
              const profitPercentage = (profit / parseFloat(product.buyingPrice)) * 100;

              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <i className={`${stockStatus.icon} text-${stockStatus.color} text-sm`}></i>
                        </div>
                        
                        {product.category && (
                          <p className="text-sm text-gray-600 mb-1">
                            <i className="fas fa-tag mr-1"></i>
                            {product.category}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            <i className="fas fa-weight mr-1"></i>
                            {product.unit}
                          </span>
                          <span className={`font-medium text-${stockStatus.color}`}>
                            {toBengaliNumber(product.currentStock)} টি {stockStatus.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm mt-2">
                          <span>
                            ক্রয়: {formatCurrency(parseFloat(product.buyingPrice))} টাকা
                          </span>
                          <span>
                            বিক্রয়: {formatCurrency(parseFloat(product.sellingPrice))} টাকা
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">মোট মূল্য</p>
                          <p className="font-bold text-primary number-font">
                            {formatCurrency(product.currentStock * parseFloat(product.sellingPrice))} টাকা
                          </p>
                        </div>
                        
                        <div className="text-xs">
                          <span className={`px-2 py-1 rounded-full ${profit > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                            {profit > 0 ? '+' : ''}{formatCurrency(profit)} টাকা
                            ({profitPercentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for Stock Level */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>স্টক লেভেল</span>
                        <span>সর্বনিম্ন: {toBengaliNumber(product.minStockLevel)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-${stockStatus.color}`}
                          style={{ 
                            width: `${Math.min((product.currentStock / (product.minStockLevel * 2)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100">
                      <Button variant="outline" size="sm" className="flex-1">
                        <i className="fas fa-edit mr-1"></i>
                        সম্পাদনা
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <i className="fas fa-plus mr-1"></i>
                        স্টক যোগ
                      </Button>
                      <Button size="sm" className="bg-primary flex-1">
                        <i className="fas fa-shopping-cart mr-1"></i>
                        বিক্রয়
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="p-4 bg-white border-t sticky bottom-16">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">মোট পণ্য</p>
              <p className="text-lg font-bold text-primary number-font">
                {toBengaliNumber(filteredProducts.length)} টি
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">মোট স্টক মূল্য</p>
              <p className="text-lg font-bold text-success number-font">
                {formatCurrency(
                  filteredProducts.reduce((sum: number, product: any) => 
                    sum + (product.currentStock * parseFloat(product.sellingPrice)), 0
                  )
                )} টাকা
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">কম স্টক</p>
              <p className="text-lg font-bold text-warning number-font">
                {toBengaliNumber(
                  filteredProducts.filter((p: any) => p.currentStock <= p.minStockLevel).length
                )} টি
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
