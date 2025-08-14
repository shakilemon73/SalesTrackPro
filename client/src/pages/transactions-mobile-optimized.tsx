import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { getBengaliDate, formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { 
  ArrowLeft, ArrowUpRight, ArrowDownRight, 
  Search, Filter, Download, Calendar,
  TrendingUp, Wallet, ShoppingCart,
  FileText, Eye, Clock, Edit3, Trash2,
  User, CreditCard, Hash, Copy, X, Package
} from "lucide-react";
import { pdfService } from '@/lib/pdf-service';

export default function TransactionsMobileOptimized() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditingInSheet, setIsEditingInSheet] = useState(false);
  const [editValues, setEditValues] = useState<any>({});
  const { toast } = useToast();
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales', userId],
    queryFn: () => userId ? supabaseService.getSales(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', userId],
    queryFn: () => userId ? supabaseService.getExpenses(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections', userId],
    queryFn: () => userId ? supabaseService.getCollections(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', userId],
    queryFn: () => userId ? supabaseService.getCustomers(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  const isLoading = salesLoading || expensesLoading || collectionsLoading;

  // Update mutation for editing transactions
  const updateMutation = useMutation({
    mutationFn: async ({ transaction, values }: { transaction: any; values: any }) => {
      if (!userId) throw new Error("User not authenticated");

      if (transaction.type === 'sale') {
        return supabaseService.updateSale(transaction.id, {
          customer_name: values.customer_name,
          total_amount: parseFloat(values.total_amount),
          payment_method: values.payment_method,
          paid_amount: parseFloat(values.total_amount), // For simplicity, assume full payment
          due_amount: 0,
        });
      } else if (transaction.type === 'expense') {
        return supabaseService.updateExpense(transaction.id, {
          description: values.customer_name,
          amount: parseFloat(values.total_amount),
          category: values.payment_method,
        });
      } else {
        throw new Error("Update not supported for this transaction type");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch all transaction-related queries
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      
      toast({
        title: "সংরক্ষিত! ✅",
        description: "লেনদেনের তথ্য সফলভাবে আপডেট হয়েছে"
      });
      
      setIsEditingInSheet(false);
    },
    onError: (error) => {
      toast({
        title: "ত্রুটি!",
        description: "তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
      console.error('Update failed:', error);
    }
  });

  // Combine all transactions
  const allTransactions = [
    ...sales.map(sale => ({
      ...sale,
      type: 'sale',
      date: sale.sale_date,
      amount: parseFloat(sale.total_amount.toString() || '0'),
      description: `বিক্রয় - ${sale.customer_name}`,
      method: sale.payment_method
    })),
    ...expenses.map(expense => ({
      ...expense,
      type: 'expense',
      date: expense.expense_date,
      amount: parseFloat(expense.amount.toString() || '0'),
      description: expense.description,
      method: 'নগদ' // Expenses don't have payment_method in schema
    })),
    ...collections.map(collection => {
      const customer = customers.find(c => c.id === collection.customer_id);
      const customerName = customer?.name || 'অজানা গ্রাহক';
      return {
        ...collection,
        type: 'collection',
        date: collection.collection_date,
        amount: parseFloat(collection.amount.toString() || '0'),
        description: `সংগ্রহ - ${customerName}`,
        method: 'নগদ' // Collections don't have payment_method in schema
      };
    })
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter transactions
  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate totals
  const totals = {
    sales: sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount.toString() || '0'), 0),
    expenses: expenses.reduce((sum, expense) => sum + parseFloat(expense.amount.toString() || '0'), 0),
    collections: collections.reduce((sum, collection) => sum + parseFloat(collection.amount.toString() || '0'), 0),
    get net() {
      return this.sales - this.expenses;
    }
  };

  const generatePDFReport = async () => {
    try {
      await pdfService.generateTransactionReport({
        businessName: 'দোকান হিসাব',
        ownerName: 'ব্যবসায়ী',
        totalSales: totals.sales,
        totalExpenses: totals.expenses,
        totalCollections: totals.collections,
        netProfit: totals.net,
        transactionCount: filteredTransactions.length,
        transactions: filteredTransactions.slice(0, 15), // Include first 15 transactions for details
        periodTitle: 'সার্বিক লেনদেন প্রতিবেদন'
      });
      toast({ title: "রিপোর্ট তৈরি সম্পন্ন", description: "PDF ডাউনলোড শুরু হয়েছে" });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: "ত্রুটি", description: "রিপোর্ট তৈরি করতে সমস্যা হয়েছে" });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'expense': return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      case 'collection': return <Wallet className="w-4 h-4 text-blue-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-green-600';
      case 'expense': return 'text-red-600';
      case 'collection': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsEditingInSheet(false);
    setEditValues({
      customer_name: transaction.customer_name || transaction.description,
      total_amount: transaction.amount || transaction.total_amount,
      payment_method: transaction.method || transaction.payment_method,
      description: transaction.description
    });
    setIsSheetOpen(true);
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (transaction: any) => {
      if (!userId || !transaction) throw new Error("Invalid transaction or user");
      
      switch (transaction.type) {
        case 'sale':
          return supabaseService.deleteSale(transaction.id);
        case 'expense':
          return supabaseService.deleteExpense(transaction.id);
        case 'collection':
          return supabaseService.deleteCollection(transaction.id);
        default:
          throw new Error("Delete not supported for this transaction type");
      }
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "লেনদেন মুছে ফেলা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি!",
        description: "লেনদেন মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });



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
                  লেনদেন সমূহ
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>মোট {toBengaliNumber(filteredTransactions.length)}টি</span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 text-xs"
              onClick={generatePDFReport}
            >
              <Download className="w-3 h-3 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-4 space-y-4">
        
        {/* Summary Cards - 3 Column Compact Grid */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3">
            <div className="text-center space-y-1">
              <TrendingUp className="w-4 h-4 mx-auto text-green-200" />
              <p className="text-xs text-green-100 bengali-font">বিক্রয়</p>
              <p className="text-sm font-bold number-font">
                {formatCurrency(totals.sales)}
              </p>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-red-500 to-rose-600 text-white p-3">
            <div className="text-center space-y-1">
              <ArrowDownRight className="w-4 h-4 mx-auto text-red-200" />
              <p className="text-xs text-red-100 bengali-font">খরচ</p>
              <p className="text-sm font-bold number-font">
                {formatCurrency(totals.expenses)}
              </p>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3">
            <div className="text-center space-y-1">
              <Wallet className="w-4 h-4 mx-auto text-blue-200" />
              <p className="text-xs text-blue-100 bengali-font">নিট</p>
              <p className="text-sm font-bold number-font">
                {formatCurrency(totals.net)}
              </p>
            </div>
          </Card>
        </div>

        {/* Search and Filter - Compact Row */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
              <Input
                placeholder="লেনদেন খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 text-sm pl-9"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-24 h-9 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব</SelectItem>
              <SelectItem value="sale">বিক্রয়</SelectItem>
              <SelectItem value="expense">খরচ</SelectItem>
              <SelectItem value="collection">আদায়</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List - Compact Cards */}
        <div className="space-y-2">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.slice(0, 50).map((transaction, index) => (
              <Card 
                key={`${transaction.type}-${transaction.id || index}`} 
                className="border-0 shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTransactionClick(transaction)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white bengali-font truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <span>{transaction.method}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString('bn-BD')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold number-font ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="text-xs h-4 px-1"
                    >
                      {transaction.type === 'sale' ? 'বিক্রয়' : 
                       transaction.type === 'expense' ? 'খরচ' : 'আদায়'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-sm p-6 text-center">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 bengali-font">কোনো লেনদেন পাওয়া যায়নি</p>
            </Card>
          )}
        </div>

        {/* Load More Button - If many transactions */}
        {filteredTransactions.length > 50 && (
          <Card className="border-0 shadow-sm p-3">
            <Button variant="outline" className="w-full text-sm" onClick={() => {}}>
              আরো {toBengaliNumber(filteredTransactions.length - 50)}টি লেনদেন দেখুন
            </Button>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border-0 shadow-md p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3">
            দ্রুত কাজ
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/sales/new">
              <Button variant="outline" size="sm" className="w-full h-10 flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-green-600" />
                <span className="text-xs bengali-font">নতুন বিক্রয়</span>
              </Button>
            </Link>
            
            <Link to="/expenses/new">
              <Button variant="outline" size="sm" className="w-full h-10 flex items-center space-x-2">
                <ArrowDownRight className="w-4 h-4 text-red-600" />
                <span className="text-xs bengali-font">খরচ এন্ট্রি</span>
              </Button>
            </Link>
          </div>
        </Card>
        
        {/* Professional bottom spacing for navigation */}
        <div className="h-24"></div>
      </div>

      {/* Compact Mobile Transaction Details */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0 border-t-0 rounded-t-2xl bg-white dark:bg-slate-900">
          <VisuallyHidden>
            <SheetTitle>
              {selectedTransaction?.type === 'sale' ? 'বিক্রয়ের তথ্য' : 
               selectedTransaction?.type === 'expense' ? 'খরচের তথ্য' : 'আদায়ের তথ্য'}
            </SheetTitle>
            <SheetDescription>
              লেনদেনের বিস্তারিত তথ্য এবং সম্পাদনা অপশন
            </SheetDescription>
          </VisuallyHidden>
          {selectedTransaction && (
            <div className="h-full flex flex-col">
              {/* Compact Header */}
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    {getTransactionIcon(selectedTransaction.type)}
                  </div>
                  <span className="text-sm font-medium bengali-font">
                    {selectedTransaction.type === 'sale' ? 'বিক্রয়ের তথ্য' : 
                     selectedTransaction.type === 'expense' ? 'খরচের তথ্য' : 'আদায়ের তথ্য'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsSheetOpen(false)} className="w-6 h-6 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content fits in one screen view */}
              <div className="flex-1 p-3 space-y-3">
                
                {/* Amount - Compact but prominent */}
                <div className="text-center py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">
                    {selectedTransaction.type === 'sale' ? 'বিক্রয় পরিমাণ' : 
                     selectedTransaction.type === 'expense' ? 'খরচ পরিমাণ' : 'আদায় পরিমাণ'}
                  </p>
                  <p className={`text-2xl font-bold number-font ${getTransactionColor(selectedTransaction.type)}`}>
                    {selectedTransaction.type === 'expense' ? '-' : '+'}৳{formatCurrency(selectedTransaction.amount)}
                  </p>
                  
                  {/* Due info - compact */}
                  {selectedTransaction.type === 'sale' && selectedTransaction.due_amount > 0 && (
                    <div className="flex justify-center space-x-3 text-xs mt-2">
                      <span className="text-green-600">পরিশোধিত: ৳{formatCurrency(selectedTransaction.paid_amount || 0)}</span>
                      <span className="text-red-600">বাকি: ৳{formatCurrency(selectedTransaction.due_amount || 0)}</span>
                    </div>
                  )}
                </div>

                {/* Details in compact grid */}
                <div className="grid grid-cols-1 gap-2">
                  
                  {/* Customer/Description */}
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <User className="w-4 h-4 text-slate-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">{selectedTransaction.type === 'sale' ? 'গ্রাহক' : 'বিবরণ'}</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white bengali-font truncate">
                        {selectedTransaction.type === 'sale' ? selectedTransaction.customer_name : 
                         selectedTransaction.description || 'বিবরণ নেই'}
                      </p>
                    </div>
                  </div>

                  {/* Payment & Date in two columns */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">পেমেন্ট</p>
                        <p className="text-xs font-medium text-slate-900 dark:text-white bengali-font truncate">
                          {selectedTransaction.method || 'নগদ'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">তারিখ</p>
                        <p className="text-xs font-medium text-slate-900 dark:text-white">
                          {new Date(selectedTransaction.date).toLocaleDateString('bn-BD', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction ID - compact */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-500 font-mono">
                        ID: {selectedTransaction.id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Edit Mode UI - Overlay above existing content when editing */}
                {isEditingInSheet && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Edit3 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 bengali-font">সম্পাদনা মোড</span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 bengali-font">গ্রাহক/বিবরণ</label>
                      <Input
                        value={editValues.customer_name || ''}
                        onChange={(e) => setEditValues({...editValues, customer_name: e.target.value})}
                        className="mt-1 h-9 text-sm"
                        placeholder="গ্রাহকের নাম বা বিবরণ"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 bengali-font">পরিমাণ (৳)</label>
                      <Input
                        type="number"
                        value={editValues.total_amount || ''}
                        onChange={(e) => setEditValues({...editValues, total_amount: e.target.value})}
                        className="mt-1 h-9 text-sm number-font"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 bengali-font">পেমেন্ট পদ্ধতি</label>
                      <Select value={editValues.payment_method} onValueChange={(value) => setEditValues({...editValues, payment_method: value})}>
                        <SelectTrigger className="mt-1 h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="নগদ">নগদ</SelectItem>
                          <SelectItem value="বাকি">বাকি</SelectItem>
                          <SelectItem value="কার্ড">কার্ড</SelectItem>
                          <SelectItem value="bKash">bKash</SelectItem>
                          <SelectItem value="Nagad">Nagad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          updateMutation.mutate({ 
                            transaction: selectedTransaction, 
                            values: editValues 
                          });
                        }}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? (
                          <>
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                            সংরক্ষণ হচ্ছে...
                          </>
                        ) : (
                          "সংরক্ষণ করুন"
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditingInSheet(false)}
                      >
                        বাতিল
                      </Button>
                    </div>
                  </div>
                )}

                {/* Products - Compact list if sale */}
                {selectedTransaction.type === 'sale' && selectedTransaction.items && selectedTransaction.items.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium bengali-font">পণ্য ({toBengaliNumber(selectedTransaction.items.length)}টি)</span>
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {selectedTransaction.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                          <span className="bengali-font truncate flex-1 mr-2">{item.productName}</span>
                          <span className="text-slate-500">{toBengaliNumber(item.quantity)}×</span>
                          <span className="font-medium ml-2">৳{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compact Action Buttons */}
                {(selectedTransaction.type === 'sale' || selectedTransaction.type === 'expense' || selectedTransaction.type === 'collection') && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 text-xs"
                      onClick={() => {
                        setIsEditingInSheet(!isEditingInSheet);
                      }}
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      {isEditingInSheet ? 'বাতিল' : 'সম্পাদনা'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 text-xs text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => deleteMutation.mutate(selectedTransaction)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Trash2 className="w-3 h-3 mr-1" />
                      )}
                      মুছুন
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}