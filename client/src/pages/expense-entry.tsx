import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const expenseSchema = z.object({
  category: z.string().min(1, "খরচের ধরন নির্বাচন করুন"),
  amount: z.string().min(1, "টাকার পরিমাণ লিখুন"),
  description: z.string().min(1, "খরচের বিবরণ লিখুন"),
  payment_method: z.string().min(1, "পেমেন্ট পদ্ধতি নির্বাচন করুন"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function ExpenseEntry() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get today's expenses from Supabase
  const { data: todayExpenses = [] } = useQuery({
    queryKey: ['expenses', CURRENT_USER_ID, 'today'],
    queryFn: async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', CURRENT_USER_ID)
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching today expenses:', error);
        return [];
      }
    },
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "",
      amount: "",
      description: "",
      payment_method: "",
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const expenseData = {
        category: data.category,
        amount: data.amount,
        description: data.description,
        payment_method: data.payment_method,
        expense_date: new Date().toISOString(),
      };

      return await supabaseService.createExpense(CURRENT_USER_ID, expenseData);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "খরচ সফলভাবে সংরক্ষিত হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['expenses', CURRENT_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', CURRENT_USER_ID] });
      form.reset();
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "খরচ সংরক্ষণে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    createExpenseMutation.mutate(data);
  };

  // Calculate today's total expenses
  const todayTotal = todayExpenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount || '0'), 0);

  const expenseCategories = [
    "দোকান ভাড়া",
    "বিদ্যুৎ বিল",
    "পানির বিল", 
    "গ্যাস বিল",
    "ইন্টারনেট বিল",
    "পরিবহন খরচ",
    "কর্মচারী বেতন",
    "পণ্য ক্রয়",
    "মার্কেটিং",
    "মেরামত খরচ",
    "ব্যাংক চার্জ",
    "অন্যান্য"
  ];

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
              <h1 className="text-lg font-semibold text-white">খরচ এন্ট্রি</h1>
              <p className="text-sm text-green-100">{getBengaliDate()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-20 px-4 py-4">
        {/* Today's Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-line text-error mr-2"></i>
              আজকের খরচ
            </CardTitle>
            <CardDescription>
              আজ পর্যন্ত মোট {toBengaliNumber(todayExpenses.length)} টি খরচের এন্ট্রি
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-error number-font">
                {formatCurrency(todayTotal)}
              </p>
              <p className="text-sm text-gray-600">আজকের মোট খরচ</p>
            </div>
            {todayExpenses.length > 0 && (
              <div className="mt-4 space-y-2">
                {todayExpenses.slice(0, 3).map((expense: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{expense.category}</span>
                    <span className="text-error font-medium">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-minus-circle text-error mr-2"></i>
              নতুন খরচ এন্ট্রি
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Category */}
              <div>
                <Label htmlFor="category">খরচের ধরন *</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(value) => form.setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="খরচের ধরন নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">খরচের পরিমাণ *</Label>
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

              {/* Description */}
              <div>
                <Label htmlFor="description">খরচের বিবরণ *</Label>
                <Textarea
                  id="description"
                  placeholder="খরচের বিস্তারিত বিবরণ লিখুন..."
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.description.message}
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
                    <SelectValue placeholder="কিভাবে পেমেন্ট করেছেন?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="নগদ">নগদ</SelectItem>
                    <SelectItem value="বিকাশ">বিকাশ</SelectItem>
                    <SelectItem value="নগদ (Nagad)">নগদ (Nagad)</SelectItem>
                    <SelectItem value="রকেট">রকেট</SelectItem>
                    <SelectItem value="ব্যাংক">ব্যাংক</SelectItem>
                    <SelectItem value="চেক">চেক</SelectItem>
                    <SelectItem value="কার্ড">কার্ড</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.payment_method && (
                  <p className="text-sm text-error mt-1">
                    {form.formState.errors.payment_method.message}
                  </p>
                )}
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-error text-white"
                disabled={createExpenseMutation.isPending}
              >
                {createExpenseMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    সংরক্ষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    খরচ সংরক্ষণ করুন
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