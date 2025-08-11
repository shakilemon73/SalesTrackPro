import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
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
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
  });

  const { data: dueCustomers = [] } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID, 'due'],
    queryFn: async () => {
      const allCustomers = await supabaseService.getCustomers(CURRENT_USER_ID);
      return allCustomers.filter(customer => parseFloat(customer.total_credit) > 0);
    },
  });

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      customer_id: "",
      amount: "",
      payment_method: "",
      notes: "",
    },
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data: CollectionFormData) => {
      const collectionData = {
        customerId: data.customer_id,
        amount: data.amount,
      };

      // Create the collection record in database
      const result = await supabaseService.createCollection(CURRENT_USER_ID, collectionData);

      // Update customer's due amount
      const customer = customers.find(c => c.id === data.customer_id);
      if (customer) {
        const newCredit = Math.max(0, parseFloat(customer.total_credit) - parseFloat(data.amount));
        await supabaseService.updateCustomer(data.customer_id, {
          total_credit: newCredit.toString(),
        });
      }

      return result;
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "বাকি আদায় সফলভাবে সংরক্ষিত হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['customers', CURRENT_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', CURRENT_USER_ID] });
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

  const selectedCustomer = customers.find(c => c.id === form.watch("customer_id"));

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
              {dueCustomers.slice(0, 3).map((customer) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <span className="font-medium">{customer.name}</span>
                  <span className="text-error font-bold">
                    {formatCurrency(parseFloat(customer.total_credit))}
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
                    {dueCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {formatCurrency(parseFloat(customer.total_credit))} বাকি
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
                    বকেয়া: {formatCurrency(parseFloat(selectedCustomer.total_credit))}
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