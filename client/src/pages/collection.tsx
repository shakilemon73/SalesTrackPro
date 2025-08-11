import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { supabaseService, CURRENT_USER_ID, supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency, toBengaliNumber, getBengaliDate, getBengaliTime } from "@/lib/bengali-utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const collectionSchema = z.object({
  customer_id: z.string().min(1, "গ্রাহক নির্বাচন করুন"),
  amount: z.string().min(1, "টাকার পরিমাণ লিখুন"),
  payment_method: z.string().min(1, "পেমেন্ট পদ্ধতি নির্বাচন করুন"),
  notes: z.string().optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function Collection() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get customer ID from URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const preSelectedCustomerId = urlParams.get('customer');

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
  });

  const { data: dueCustomers = [] } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID, 'due'],
    queryFn: async () => {
      try {
        // Get all customers and recent sales to calculate actual due amounts
        const [allCustomers, allSales] = await Promise.all([
          supabaseService.getCustomers(CURRENT_USER_ID),
          supabaseService.getSales(CURRENT_USER_ID, 100) // Get more sales to calculate due amounts
        ]);

        // Calculate due amounts from sales
        const customerDueMap = new Map();
        
        allSales.forEach((sale: any) => {
          if (sale.customer_id && sale.due_amount && parseFloat(sale.due_amount) > 0) {
            const currentDue = customerDueMap.get(sale.customer_id) || 0;
            customerDueMap.set(sale.customer_id, currentDue + parseFloat(sale.due_amount));
          }
        });

        // Filter customers with due amounts
        return allCustomers
          .map(customer => ({
            ...customer,
            calculated_due: customerDueMap.get(customer.id) || parseFloat(customer.total_credit || '0') || 0
          }))
          .filter(customer => customer.calculated_due > 0);
      } catch (error) {
        console.error('Error fetching due customers:', error);
        return [];
      }
    },
  });

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      customer_id: preSelectedCustomerId || "",
      amount: "",
      payment_method: "",
      notes: "",
    },
  });
  
  // Pre-select customer if provided in URL
  useEffect(() => {
    if (preSelectedCustomerId && form.watch("customer_id") !== preSelectedCustomerId) {
      form.setValue("customer_id", preSelectedCustomerId);
    }
  }, [preSelectedCustomerId, form]);

  const createCollectionMutation = useMutation({
    mutationFn: async (data: CollectionFormData) => {
      console.log('🔥 Creating collection:', data);
      
      // Since we don't have a collections table, we'll simulate by updating customer due amounts
      // and creating a sale record with negative amount for tracking purposes
      
      // Update customer's due amount
      const customer = customers.find(c => c.id === data.customer_id);
      if (!customer) {
        throw new Error('গ্রাহক পাওয়া যায়নি');
      }

      const newCredit = Math.max(0, parseFloat(customer.total_credit || '0') - parseFloat(data.amount));
      await supabaseService.updateCustomer(data.customer_id, {
        total_credit: newCredit.toString(),
      });

      // Create a collection record as a special sale with negative amount for tracking
      const collectionSale = {
        customer_id: data.customer_id,
        customer_name: customer.name,
        total_amount: (-parseFloat(data.amount)).toString(), // Negative to indicate collection
        paid_amount: parseFloat(data.amount).toString(),
        due_amount: '0',
        payment_method: data.payment_method || 'নগদ',
        items: [{
          quantity: 1,
          unitPrice: data.amount,
          totalPrice: data.amount,
          productName: `সংগ্রহ - ${customer.name}`
        }],
        sale_date: new Date().toISOString(),
      };

      const result = await supabaseService.createSale(CURRENT_USER_ID, collectionSale);
      console.log('✅ Collection created as sale:', result);
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "বাকি আদায় সফলভাবে সংরক্ষিত হয়েছে",
      });
      // Invalidate all related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      form.reset();
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "বাকি আদায় সংরক্ষণে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const selectedCustomer = dueCustomers.find((c: any) => c.id === form.watch("customer_id"));

  // Get today's collections
  const { data: todayCollections = [] } = useQuery({
    queryKey: ['collections', CURRENT_USER_ID, 'today'],
    queryFn: async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const { data, error } = await supabase
          .from('collections')
          .select(`
            *,
            customers(name)
          `)
          .eq('user_id', CURRENT_USER_ID)
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching today collections:', error);
        return [];
      }
    },
  });

  const onSubmit = (data: CollectionFormData) => {
    createCollectionMutation.mutate(data);
  };

  return (
    <>
      {/* Header */}
      <div className="header-bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <i className="fas fa-arrow-left text-white"></i>
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">বাকি আদায়</h1>
              <p className="text-sm text-green-100">{getBengaliDate()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-20 px-4 py-4">
        {/* Today's Collections Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-hand-holding-usd text-success mr-2"></i>
              আজকের আদায়
            </CardTitle>
            <CardDescription>
              আজ পর্যন্ত মোট {toBengaliNumber(todayCollections.length)} টি আদায়
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-success number-font">
                {formatCurrency(todayCollections.reduce((sum, collection: any) => sum + parseFloat(collection.amount), 0))}
              </p>
              <p className="text-sm text-gray-600">আজকের মোট আদায়</p>
            </div>
            {todayCollections.length > 0 && (
              <div className="mt-4 space-y-2">
                {todayCollections.slice(0, 3).map((collection: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{collection.customers?.name || 'গ্রাহক'}</span>
                    <span className="text-success font-medium">
                      {formatCurrency(parseFloat(collection.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Customers Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-clock text-warning mr-2"></i>
              বকেয়া গ্রাহকগণ
            </CardTitle>
            <CardDescription>
              মোট {toBengaliNumber(dueCustomers.length)} জন গ্রাহকের কাছ থেকে টাকা পাওনা
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dueCustomers.slice(0, 3).map((customer: any) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <span className="font-medium">{customer.name}</span>
                  <span className="text-error font-bold">
                    {formatCurrency(customer.calculated_due)}
                  </span>
                </div>
              ))}
              {dueCustomers.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  কোনো বকেয়া পাওনা নেই
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Collection Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-money-bill-wave text-success mr-2"></i>
              বাকি আদায় করুন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Customer Selection */}
              <div>
                <Label htmlFor="customer_id">গ্রাহক নির্বাচন করুন *</Label>
                <Select
                  value={form.watch("customer_id")}
                  onValueChange={(value) => form.setValue("customer_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="গ্রাহক নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {dueCustomers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {formatCurrency(customer.calculated_due)} বাকি
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.customer_id && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.customer_id.message}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">আদায়ের পরিমাণ *</Label>
                {selectedCustomer && (
                  <p className="text-sm text-gray-600 mb-2">
                    বকেয়া: {formatCurrency(selectedCustomer.calculated_due)}
                  </p>
                )}
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="০.০০"
                  {...form.register("amount")}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="payment_method">পেমেন্ট পদ্ধতি *</Label>
                <Select
                  value={form.watch("payment_method")}
                  onValueChange={(value) => form.setValue("payment_method", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="পেমেন্ট পদ্ধতি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="নগদ">নগদ</SelectItem>
                    <SelectItem value="বিকাশ">বিকাশ</SelectItem>
                    <SelectItem value="নগদ (Nagad)">নগদ (Nagad)</SelectItem>
                    <SelectItem value="রকেট">রকেট</SelectItem>
                    <SelectItem value="ব্যাংক">ব্যাংক</SelectItem>
                    <SelectItem value="চেক">চেক</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.payment_method && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.payment_method.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">মন্তব্য (ঐচ্ছিক)</Label>
                <Input
                  id="notes"
                  placeholder="অতিরিক্ত তথ্য..."
                  {...form.register("notes")}
                />
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-success text-white"
                disabled={createCollectionMutation.isPending}
              >
                {createCollectionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    আদায় করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    বাকি আদায় করুন
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}