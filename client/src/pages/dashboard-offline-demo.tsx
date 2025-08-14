/**
 * Offline-First Dashboard Demo
 * Demonstrates full offline functionality for Bengali entrepreneurs
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, TrendingUp, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus, useCustomersOffline, useSalesOffline, useExpensesOffline, useCreateCustomerOffline, useCreateSaleOffline, useCreateExpenseOffline } from '@/hooks/use-offline-data';
import { useToast } from '@/hooks/use-toast';

export default function DashboardOfflineDemo() {
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();
  
  // Offline-first data hooks
  const { data: customers = [], isLoading: customersLoading } = useCustomersOffline();
  const { data: sales = [], isLoading: salesLoading } = useSalesOffline(5);
  const { data: expenses = [], isLoading: expensesLoading } = useExpensesOffline(5);
  
  // Offline-capable mutations
  const createCustomerMutation = useCreateCustomerOffline();
  const createSaleMutation = useCreateSaleOffline();
  const createExpenseMutation = useCreateExpenseOffline();

  // Demo states
  const [demoCustomerName, setDemoCustomerName] = useState('');
  const [demoSaleAmount, setDemoSaleAmount] = useState('');
  const [demoExpenseAmount, setDemoExpenseAmount] = useState('');

  // Calculate totals
  const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const profit = totalSales - totalExpenses;

  const handleCreateDemoCustomer = async () => {
    if (!demoCustomerName.trim()) {
      toast({
        title: "নাম প্রয়োজন",
        description: "গ্রাহকের নাম লিখুন",
        variant: "destructive"
      });
      return;
    }

    try {
      await createCustomerMutation.mutateAsync({
        name: demoCustomerName,
        phone_number: `0177${Math.floor(Math.random() * 10000000)}`,
        address: "ডেমো ঠিকানা"
      });

      setDemoCustomerName('');
      toast({
        title: isOnline ? "গ্রাহক যোগ হয়েছে" : "অফলাইনে সংরক্ষিত",
        description: isOnline ? "গ্রাহক সফলভাবে যোগ করা হয়েছে" : "ইন্টারনেট ফিরলে সিঙ্ক হবে",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "গ্রাহক যোগ করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const handleCreateDemoSale = async () => {
    const amount = parseInt(demoSaleAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "সঠিক পরিমাণ লিখুন",
        description: "বিক্রয়ের পরিমাণ ০ এর চেয়ে বেশি হতে হবে",
        variant: "destructive"
      });
      return;
    }

    try {
      await createSaleMutation.mutateAsync({
        customer_id: customers[0]?.id || null,
        customer_name: customers[0]?.name || 'ডেমো গ্রাহক',
        total_amount: amount,
        paid_amount: amount,
        due_amount: 0,
        payment_method: 'নগদ',
        items: [{
          productName: 'ডেমো পণ্য',
          quantity: 1,
          unitPrice: amount,
          totalPrice: amount
        }]
      });

      setDemoSaleAmount('');
      toast({
        title: isOnline ? "বিক্রয় যোগ হয়েছে" : "অফলাইনে সংরক্ষিত",
        description: isOnline ? "বিক্রয় সফলভাবে যোগ করা হয়েছে" : "ইন্টারনেট ফিরলে সিঙ্ক হবে",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "বিক্রয় যোগ করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const handleCreateDemoExpense = async () => {
    const amount = parseInt(demoExpenseAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "সঠিক পরিমাণ লিখুন",
        description: "খরচের পরিমাণ ০ এর চেয়ে বেশি হতে হবে",
        variant: "destructive"
      });
      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        description: 'ডেমো খরচ',
        amount: amount,
        category: 'অন্যান্য'
      });

      setDemoExpenseAmount('');
      toast({
        title: isOnline ? "খরচ যোগ হয়েছে" : "অফলাইনে সংরক্ষিত",
        description: isOnline ? "খরচ সফলভাবে যোগ করা হয়েছে" : "ইন্টারনেট ফিরলে সিঙ্ক হবে",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "খরচ যোগ করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 pb-20 max-w-lg mx-auto space-y-6">
      {/* Network Status Banner */}
      <Card className={`border-l-4 ${isOnline ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-800">অনলাইন মোড</h3>
                  <p className="text-sm text-green-600">সব ডাটা রিয়েল-টাইমে সিঙ্ক হচ্ছে</p>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-800">অফলাইন মোড</h3>
                  <p className="text-sm text-red-600">সব ফিচার কাজ করবে, পরে সিঙ্ক হবে</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{customers.length}</div>
            <div className="text-sm text-muted-foreground">গ্রাহক</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">৳{profit.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">লাভ</div>
          </CardContent>
        </Card>
      </div>

      {/* Offline Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            অফলাইন ডেমো
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Demo Customer Creation */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="গ্রাহকের নাম"
              value={demoCustomerName}
              onChange={(e) => setDemoCustomerName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              data-testid="input-demo-customer"
            />
            <Button 
              onClick={handleCreateDemoCustomer}
              disabled={createCustomerMutation.isPending}
              size="sm"
              data-testid="button-create-demo-customer"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Demo Sale Creation */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="বিক্রয় পরিমাণ (৳)"
              value={demoSaleAmount}
              onChange={(e) => setDemoSaleAmount(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              data-testid="input-demo-sale"
            />
            <Button 
              onClick={handleCreateDemoSale}
              disabled={createSaleMutation.isPending}
              size="sm"
              variant="outline"
              data-testid="button-create-demo-sale"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Demo Expense Creation */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="খরচ পরিমাণ (৳)"
              value={demoExpenseAmount}
              onChange={(e) => setDemoExpenseAmount(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              data-testid="input-demo-expense"
            />
            <Button 
              onClick={handleCreateDemoExpense}
              disabled={createExpenseMutation.isPending}
              size="sm"
              variant="outline"
              data-testid="button-create-demo-expense"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            ইন্টারনেট বন্ধ করে পরীক্ষা করুন - সব কাজ করবে!
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">সাম্প্রতিক কার্যক্রম</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {salesLoading ? (
            <div className="text-sm text-muted-foreground">লোড হচ্ছে...</div>
          ) : sales.length > 0 ? (
            sales.slice(0, 3).map((sale) => (
              <div key={sale.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <div className="font-medium text-sm">{sale.customer_name}</div>
                  <div className="text-xs text-muted-foreground">বিক্রয়</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">৳{sale.total_amount}</div>
                  <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
                    {isOnline ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                    {isOnline ? "সিঙ্ক" : "অপেক্ষমাণ"}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-sm">কোনো বিক্রয় নেই</div>
              <div className="text-xs">উপরের ডেমো ব্যবহার করুন</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2 text-blue-800">অফলাইন টেস্ট করার নিয়ম:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>ব্রাউজারের ডেভেলপার টুলস খুলুন (F12)</li>
            <li>Network ট্যাবে গিয়ে "Offline" চেক করুন</li>
            <li>উপরের বক্সে গ্রাহক/বিক্রয়/খরচ যোগ করুন</li>
            <li>সব কিছু স্বাভাবিকভাবে কাজ করবে</li>
            <li>অনলাইন করলে সব ডাটা সিঙ্ক হয়ে যাবে</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}