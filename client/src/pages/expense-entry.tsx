import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import { formatCurrency, toBengaliNumber, getBengaliDate, getBangladeshTime, getBangladeshTimeISO } from "@/lib/bengali-utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const expenseSchema = z.object({
  category: z.string().min(1, "খরচের ধরন নির্বাচন করুন"),
  amount: z.string().min(1, "টাকার পরিমাণ লিখুন").refine((val) => parseFloat(val) > 0, "টাকার পরিমাণ শূন্যের চেয়ে বেশি হতে হবে"),
  description: z.string().min(1, "খরচের বিবরণ লিখুন"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function ExpenseEntry() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get today's expenses
  const { data: todayExpenses = [] } = useQuery({
    queryKey: ['expenses', CURRENT_USER_ID, 'today'],
    queryFn: async () => {
      const expenses = await supabaseService.getExpenses(CURRENT_USER_ID);
      const today = new Date().toDateString();
      return expenses.filter(expense => 
        new Date(expense.expense_date || expense.created_at || new Date()).toDateString() === today
      );
    },
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "",
      amount: "",
      description: "",
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const expenseData = {
        category: data.category,
        amount: parseFloat(data.amount),
        description: data.description,
        expense_date: getBangladeshTimeISO(),
      };
      return await supabaseService.createExpense(CURRENT_USER_ID, expenseData);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "খরচ সফলভাবে রেকর্ড করা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      form.reset();
    },
    onError: (error) => {
      console.error('Expense creation error:', error);
      toast({
        title: "ত্রুটি!",
        description: "খরচ রেকর্ড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    createExpenseMutation.mutate(data);
  };

  // Calculate today's total expenses
  const todayTotal = todayExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  const expenseCategories = [
    "বিদ্যুৎ বিল",
    "পানির বিল", 
    "গ্যাস বিল",
    "ইন্টারনেট বিল",
    "ভাড়া",
    "কর্মচারী বেতন",
    "পরিবহন খরচ",
    "অফিস সরঞ্জাম",
    "মার্কেটিং খরচ",
    "রক্ষণাবেক্ষণ",
    "যোগাযোগ",
    "অন্যান্য"
  ];

  return (
    <div className="min-h-screen bg-background-app">
      {/* Premium Header */}
      <div className="header-bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard">
              <button className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20">
                <i className="fas fa-arrow-left text-white"></i>
              </button>
            </Link>
            <div>
              <h1 className="heading-2 text-white mb-0.5">নতুন খরচ</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-white/90 bengali-font">{getBengaliDate()}</p>
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-200 font-semibold">খরচ এন্ট্রি</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              form="expense-form"
              type="submit"
              disabled={createExpenseMutation.isPending}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              {createExpenseMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-receipt mr-2"></i>
              )}
              সংরক্ষণ
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 mobile-safe-area">
        <div className="space-y-6">
        {/* Today's Expense Summary */}
        <Card className="enhanced-card bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <i className="fas fa-chart-pie text-red-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="heading-3 text-red-900 bengali-font">আজকের মোট খরচ</h3>
                  <p className="caption text-red-600 bengali-font">
                    {toBengaliNumber(todayExpenses.length)} টি এন্ট্রি
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-red-900 number-font">
                  {formatCurrency(todayTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form id="expense-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Expense Information */}
          <Card className="enhanced-card">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center bengali-font">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-receipt text-red-600"></i>
                </div>
                খরচের তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="responsive-grid-2 gap-4">
                <div>
                  <Label className="bengali-font">খরচের ধরন *</Label>
                  <Select 
                    value={form.watch("category")} 
                    onValueChange={(value) => form.setValue("category", value)}
                  >
                    <SelectTrigger className="enhanced-select mt-1">
                      <SelectValue placeholder="খরচের ধরন নির্বাচন করুন..." />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          <span className="bengali-font">{category}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-600 mt-1 bengali-font">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="bengali-font">খরচের পরিমাণ (টাকা) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("amount")}
                    placeholder="০.০০"
                    className="enhanced-input mt-1"
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-red-600 mt-1 bengali-font">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="bengali-font">খরচের বিস্তারিত বিবরণ *</Label>
                <Textarea
                  {...form.register("description")}
                  placeholder="কি কিনেছেন বা কোন সেবার জন্য টাকা দিয়েছেন তার বিস্তারিত লিখুন..."
                  className="enhanced-input mt-1 min-h-[100px]"
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1 bengali-font">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Expense Templates */}
          <Card className="enhanced-card">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center bengali-font">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-lightning text-purple-600"></i>
                </div>
                দ্রুত খরচ টেমপ্লেট
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="responsive-grid-2 gap-3">
                {[
                  { category: "বিদ্যুৎ বিল", icon: "fas fa-bolt", color: "yellow" },
                  { category: "ইন্টারনেট বিল", icon: "fas fa-wifi", color: "blue" },
                  { category: "পরিবহন খরচ", icon: "fas fa-car", color: "green" },
                  { category: "অফিস সরঞ্জাম", icon: "fas fa-desktop", color: "purple" }
                ].map((template) => (
                  <button
                    key={template.category}
                    type="button"
                    onClick={() => form.setValue("category", template.category)}
                    className={`p-3 rounded-xl border transition-all duration-200 hover:scale-105 text-left
                      ${form.watch("category") === template.category 
                        ? 'bg-blue-50 border-blue-200 shadow-md' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                        ${template.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                          template.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          template.color === 'green' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                        <i className={`${template.icon} text-sm`}></i>
                      </div>
                      <span className="body-regular font-medium text-gray-900 bengali-font">
                        {template.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expense Preview */}
          {form.watch("amount") && form.watch("category") && (
            <Card className="enhanced-card bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-6">
                <h3 className="heading-3 text-orange-900 mb-4 bengali-font">খরচের সারাংশ</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="body-regular text-orange-700 bengali-font">খরচের ধরন:</span>
                    <span className="font-semibold text-orange-900 bengali-font">{form.watch("category")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="body-regular text-orange-700 bengali-font">পরিমাণ:</span>
                    <span className="currency-display text-xl font-bold text-orange-900">
                      {formatCurrency(parseFloat(form.watch("amount")) || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-orange-200 pt-3">
                    <span className="body-regular text-orange-700 bengali-font">আজকের নতুন মোট:</span>
                    <span className="currency-display text-lg font-bold text-red-700">
                      {formatCurrency(todayTotal + (parseFloat(form.watch("amount")) || 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Today's Expenses List */}
        {todayExpenses.length > 0 && (
          <Card className="enhanced-card">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center bengali-font">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-list text-gray-600"></i>
                </div>
                আজকের খরচের তালিকা
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-receipt text-red-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 bengali-font">{expense.category}</p>
                      <p className="text-sm text-gray-600 bengali-font truncate max-w-40">
                        {expense.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-700 number-font">{formatCurrency(expense.amount)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.expense_date || expense.created_at || new Date()).toLocaleTimeString('bn-BD', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {todayExpenses.length > 5 && (
                <p className="text-center text-gray-500 bengali-font text-sm">
                  আরো {toBengaliNumber(todayExpenses.length - 5)} টি খরচ আছে
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="responsive-grid-2 gap-4">
          <Link to="/reports">
            <Card className="enhanced-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-chart-bar text-blue-600 text-xl"></i>
                </div>
                <h3 className="body-large font-semibold text-gray-900 bengali-font">রিপোর্ট দেখুন</h3>
                <p className="caption text-gray-500 bengali-font">খরচের বিশ্লেষণ</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard">
            <Card className="enhanced-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-home text-green-600 text-xl"></i>
                </div>
                <h3 className="body-large font-semibold text-gray-900 bengali-font">ড্যাশবোর্ড</h3>
                <p className="caption text-gray-500 bengali-font">মূল পাতায় ফিরুন</p>
              </CardContent>
            </Card>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}