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
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import { Search, Plus, Package, AlertTriangle, CheckCircle, XCircle, Filter } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "পণ্যের নাম আবশ্যক"),
  category: z.string().optional(),
  unit: z.string().min(1, "একক আবশ্যক"),
  buyingPrice: z.string().min(1, "ক্রয় মূল্য আবশ্যক"),
  sellingPrice: z.string().min(1, "বিক্রয় মূল্য আবশ্যক"),
  currentStock: z.string().refine((val) => parseInt(val) >= 0, "স্টক ০ বা তার চেয়ে বেশি হতে হবে"),
  minStockLevel: z.string().refine((val) => parseInt(val) >= 1, "সর্বনিম্ন স্টক আবশ্যক"),
});

export default function InventoryMobileOptimizedFixed() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter products based on search and tab
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "low") return matchesSearch && product.current_stock <= product.min_stock_level;
    if (activeTab === "out") return matchesSearch && product.current_stock === 0;
    return matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: products.length,
    lowStock: products.filter((p: any) => p.current_stock <= p.min_stock_level && p.current_stock > 0).length,
    outOfStock: products.filter((p: any) => p.current_stock === 0).length,
    totalValue: products.reduce((sum: number, p: any) => sum + (p.current_stock * p.buying_price), 0),
  };

  const onSubmit = (data: z.infer<typeof productSchema>) => {
    const productData = {
      name: data.name.trim(),
      category: data.category?.trim() || "অন্যান্য",
      unit: data.unit,
      buying_price: parseFloat(data.buyingPrice),
      selling_price: parseFloat(data.sellingPrice),
      current_stock: parseInt(data.currentStock),
      min_stock_level: parseInt(data.minStockLevel),
    };
    
    createProductMutation.mutate(productData);
  };

  const getStockBadge = (currentStock: number, minStock: number) => {
    if (currentStock === 0) {
      return <Badge variant="destructive" className="text-xs"><XCircle className="w-3 h-3 mr-1" />শেষ</Badge>;
    }
    if (currentStock <= minStock) {
      return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" />কম</Badge>;
    }
    return <Badge variant="default" className="text-xs bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />যথেষ্ট</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">পণ্য তালিকা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Mobile-First Header with Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="p-2">
                <i className="fas fa-arrow-left text-gray-600"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">স্টক ম্যানেজমেন্ট</h1>
            </div>
          </div>
          
          {/* Add Product Dialog */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                <Plus className="w-4 h-4 mr-1" />
                যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg text-center">নতুন পণ্য যোগ করুন</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">পণ্যের নাম *</Label>
                  <Input
                    {...form.register('name')}
                    placeholder="পণ্যের নাম লিখুন"
                    className="mt-1"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">একক *</Label>
                    <Select value={form.watch('unit')} onValueChange={(value) => form.setValue('unit', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="কেজি">কেজি</SelectItem>
                        <SelectItem value="লিটার">লিটার</SelectItem>
                        <SelectItem value="পিস">পিস</SelectItem>
                        <SelectItem value="প্যাকেট">প্যাকেট</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ক্যাটেগরি</Label>
                    <Input
                      {...form.register('category')}
                      placeholder="খাবার, পানীয়..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">ক্রয় মূল্য *</Label>
                    <Input
                      {...form.register('buyingPrice')}
                      type="number"
                      placeholder="০"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">বিক্রয় মূল্য *</Label>
                    <Input
                      {...form.register('sellingPrice')}
                      type="number"
                      placeholder="০"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">বর্তমান স্টক</Label>
                    <Input
                      {...form.register('currentStock')}
                      type="number"
                      placeholder="০"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">সর্বনিম্ন স্টক</Label>
                    <Input
                      {...form.register('minStockLevel')}
                      type="number"
                      placeholder="৫"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>
                    বাতিল
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? "যোগ করা হচ্ছে..." : "পণ্য যোগ করুন"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats Row - Visible without scrolling */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
            <div className="font-bold text-blue-800 text-sm">{toBengaliNumber(stats.total)}</div>
            <div className="text-xs text-blue-600">মোট পণ্য</div>
          </div>
          <div className="text-center p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
            <div className="font-bold text-green-800 text-sm">{formatCurrency(stats.totalValue)}</div>
            <div className="text-xs text-green-600">মোট মূল্য</div>
          </div>
          <div className="text-center p-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg">
            <div className="font-bold text-orange-800 text-sm">{toBengaliNumber(stats.lowStock)}</div>
            <div className="text-xs text-orange-600">কম স্টক</div>
          </div>
          <div className="text-center p-2 bg-gradient-to-r from-red-100 to-red-200 rounded-lg">
            <div className="font-bold text-red-800 text-sm">{toBengaliNumber(stats.outOfStock)}</div>
            <div className="text-xs text-red-600">স্টক নেই</div>
          </div>
        </div>

        {/* Smart Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="পণ্য খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-12 rounded-full border-gray-300"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Smart Tabs for Quick Filtering */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full h-9 bg-gray-100">
            <TabsTrigger value="all" className="text-sm py-1">
              সকল ({toBengaliNumber(stats.total)})
            </TabsTrigger>
            <TabsTrigger value="low" className="text-sm py-1 text-orange-700">
              কম স্টক ({toBengaliNumber(stats.lowStock)})
            </TabsTrigger>
            <TabsTrigger value="out" className="text-sm py-1 text-red-700">
              স্টক নেই ({toBengaliNumber(stats.outOfStock)})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Optimized Product Grid - 2 columns for better mobile usage */}
      <div className="p-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product: any) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow border border-gray-200 bg-white">
              <CardContent className="p-3">
                {/* Product Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  {getStockBadge(product.current_stock, product.min_stock_level)}
                </div>

                {/* Category */}
                <div className="text-xs text-gray-500 mb-2">
                  <Package className="w-3 h-3 inline mr-1" />
                  {product.category || "অন্যান্য"}
                </div>

                {/* Stock & Price Info */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">স্টক:</span>
                    <span className={`font-bold ${product.current_stock === 0 ? 'text-red-600' : 
                      product.current_stock <= product.min_stock_level ? 'text-orange-600' : 'text-green-600'}`}>
                      {toBengaliNumber(product.current_stock)} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">বিক্রয় মূল্য:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(product.selling_price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">মুনাফা:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(product.selling_price - product.buying_price)}
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex gap-1 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                    আপডেট
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                    বিক্রয়
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">কোন পণ্য পাওয়া যায়নি</h3>
            <p className="text-gray-500 mb-6">নতুন পণ্য যোগ করুন বা অন্য শব্দ দিয়ে খুঁজুন</p>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              প্রথম পণ্য যোগ করুন
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}