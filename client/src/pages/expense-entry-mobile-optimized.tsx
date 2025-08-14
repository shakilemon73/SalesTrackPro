import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { hybridAuth } from "@/lib/hybrid-auth";
import { useHybridCreateExpense } from "@/hooks/use-hybrid-data";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { formatCurrency, toBengaliNumber, getBangladeshTimeISO } from "@/lib/bengali-utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, TrendingDown, Receipt, Tag, 
  Calculator, AlertCircle, CheckCircle,
  Zap, Car, Users, Home, Store
} from "lucide-react";

const expenseSchema = z.object({
  category: z.string().min(1, "খরচের ধরন নির্বাচন করুন"),
  amount: z.string().min(1, "টাকার পরিমাণ লিখুন").refine((val) => parseFloat(val) > 0, "টাকার পরিমাণ শূন্যের চেয়ে বেশি হতে হবে"),
  description: z.string().min(1, "খরচের বিবরণ লিখুন"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const expenseCategories = [
  { value: "পণ্য ক্রয়", icon: Store, color: "text-blue-600" },
  { value: "কর্মচারী বেতন", icon: Users, color: "text-green-600" },
  { value: "দোকান ভাড়া", icon: Home, color: "text-purple-600" },
  { value: "বিদ্যুৎ বিল", icon: Zap, color: "text-yellow-600" },
  { value: "গ্যাস বিল", icon: Home, color: "text-orange-600" },
  { value: "পরিবহন", icon: Car, color: "text-indigo-600" },
  { value: "মেরামত", icon: Receipt, color: "text-red-600" },
  { value: "অন্যান্য", icon: Tag, color: "text-slate-600" },
];

export default function ExpenseEntryMobileOptimized() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const user = hybridAuth.getCurrentUser();
  const { isOnline } = useNetworkStatus();

  // For now, use empty array for today's expenses
  const todayExpenses: any[] = [];

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "",
      amount: "",
      description: "",
    },
  });

  const createExpenseMutation = useHybridCreateExpense();

  const onSubmit = (data: ExpenseFormData) => {
    const expenseData = {
      category: data.category,
      amount: parseFloat(data.amount),
      description: data.description,
      expense_date: getBangladeshTimeISO(),
    };
    
    createExpenseMutation.mutate(expenseData, {
      onSuccess: () => {
        toast({
          title: "সফল!",
          description: isOnline ? "খরচ সফলভাবে রেকর্ড করা হয়েছে এবং সিঙ্ক হয়েছে" : "খরচ স্থানীয়ভাবে সংরক্ষিত হয়েছে",
        });
        form.reset();
        setLocation("/");
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
  };

  const todayTotal = todayExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount.toString() || '0'), 0);

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
                  খরচ এন্ট্রি
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>ব্যবসার খরচ রেকর্ড</span>
                </div>
              </div>
            </div>
            
            {todayTotal > 0 && (
              <Badge variant="outline" className="text-xs">
                আজ: {formatCurrency(todayTotal)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-4">
        
        {/* Today's Expenses Summary */}
        {todayExpenses.length > 0 && (
          <Card className="border-0 shadow-md bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100 bengali-font mb-1">আজকের মোট খরচ</p>
                <p className="text-2xl font-bold number-font">
                  {formatCurrency(todayTotal)}
                </p>
              </div>
              <div className="text-center">
                <Receipt className="w-8 h-8 text-red-200 mx-auto mb-1" />
                <p className="text-xs text-red-200 bengali-font">
                  {toBengaliNumber(todayExpenses.length)} টি খরচ
                </p>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Category Selection */}
          <Card className="border-0 shadow-md p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                খরচের ধরন
              </h3>
            </div>

            <div className="grid-container">
              <div className="grid-row">
              {expenseCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = form.watch("category") === category.value;
                return (
                  <div key={category.value} className="col-6">
                    <Button
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`btn-touch-target w-full flex items-center space-x-2 ${
                        isSelected ? "bg-emerald-500 hover:bg-emerald-600" : ""
                      }`}
                      onClick={() => form.setValue("category", category.value)}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-white" : category.color}`} />
                      <span className="text-xs bengali-font">{category.value}</span>
                    </Button>
                  </div>
                );
              })}
              </div>
            </div>
            
            {form.formState.errors.category && (
              <div className="flex items-center space-x-1 text-red-500 mt-2">
                <AlertCircle className="w-3 h-3" />
                <p className="text-xs bengali-font">
                  {form.formState.errors.category.message}
                </p>
              </div>
            )}
          </Card>

          {/* Amount Input */}
          <Card className="border-0 shadow-md p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                খরচের পরিমাণ
              </h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs bengali-font">কত টাকা খরচ হয়েছে?</Label>
                <Input
                  {...form.register("amount")}
                  type="number"
                  placeholder="০"
                  className="h-12 text-lg text-center number-font"
                />
                {form.formState.errors.amount && (
                  <div className="flex items-center space-x-1 text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    <p className="text-xs bengali-font">
                      {form.formState.errors.amount.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid-container">
                <div className="grid-row">
                  {[50, 100, 500, 1000].map((amount) => (
                    <div key={amount} className="col-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="btn-touch-target w-full"
                        onClick={() => form.setValue("amount", amount.toString())}
                      >
                        {formatCurrency(amount)}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="border-0 shadow-md p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Receipt className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                খরচের বিবরণ
              </h3>
            </div>

            <div className="space-y-2">
              <Label className="text-xs bengali-font">কিসের জন্য খরচ হয়েছে?</Label>
              <Textarea
                {...form.register("description")}
                placeholder="উদাহরণ: দোকানের বিদ্যুৎ বিল পরিশোধ"
                className="min-h-[80px] text-sm bengali-font"
                rows={3}
              />
              {form.formState.errors.description && (
                <div className="flex items-center space-x-1 text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  <p className="text-xs bengali-font">
                    {form.formState.errors.description.message}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Preview Card */}
          {form.watch("category") && form.watch("amount") && (
            <Card className="border-0 shadow-md bg-slate-50 dark:bg-slate-800 p-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3">
                খরচের সারসংক্ষেপ
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 bengali-font">ধরন</span>
                  <span className="font-medium text-slate-900 dark:text-white bengali-font">
                    {form.watch("category")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 bengali-font">পরিমাণ</span>
                  <span className="font-bold text-red-600 number-font">
                    {formatCurrency(parseFloat(form.watch("amount")) || 0)}
                  </span>
                </div>
                {form.watch("description") && (
                  <div className="flex items-start justify-between">
                    <span className="text-slate-600 dark:text-slate-400 bengali-font">বিবরণ</span>
                    <span className="font-medium text-slate-900 dark:text-white bengali-font text-right text-xs max-w-[60%]">
                      {form.watch("description")}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Action Button */}
          <Button 
            type="submit"
            className="btn-touch-target w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
            disabled={createExpenseMutation.isPending}
          >
            {createExpenseMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="bengali-font">সেভ হচ্ছে...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="bengali-font">খরচ রেকর্ড করুন</span>
              </>
            )}
          </Button>

          {/* Cancel Button */}
          <Link to="/">
            <Button 
              type="button"
              variant="outline"
              className="w-full h-10 bengali-font"
            >
              বাতিল করুন
            </Button>
          </Link>
        </form>

        {/* Today's Recent Expenses */}
        {todayExpenses.length > 0 && (
          <Card className="border-0 shadow-md p-4 mt-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3">
              আজকের সাম্প্রতিক খরচ
            </h4>
            <div className="space-y-2">
              {todayExpenses.slice(0, 3).map((expense, index) => (
                <div key={expense.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white bengali-font">
                        {expense.category}
                      </p>
                      <p className="text-xs text-slate-500 truncate w-32">
                        {expense.description}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-red-600 number-font">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              ))}
              {todayExpenses.length > 3 && (
                <p className="text-xs text-center text-slate-500 bengali-font">
                  আরো {toBengaliNumber(todayExpenses.length - 3)}টি খরচ রয়েছে
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}