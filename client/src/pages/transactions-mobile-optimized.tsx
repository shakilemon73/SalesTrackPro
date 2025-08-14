import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { getBengaliDate, formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
import jsPDF from 'jspdf';

export default function TransactionsMobileOptimized() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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

  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('লেনদেন রিপোর্ট - দোকান হিসাব', 20, 30);
      doc.setFontSize(10);
      doc.text(`তৈরি হয়েছেঃ ${getBengaliDate()}`, 20, 45);
      doc.text(`মোট বিক্রয়ঃ ${formatCurrency(totals.sales)}`, 20, 60);
      doc.text(`মোট খরচঃ ${formatCurrency(totals.expenses)}`, 20, 70);
      doc.text(`নিট লাভঃ ${formatCurrency(totals.net)}`, 20, 80);
      doc.save('transactions-report.pdf');
      toast({ title: "রিপোর্ট তৈরি", description: "PDF ডাউনলোড শুরু হয়েছে" });
    } catch (error) {
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

      {/* Modern Transaction Details Bottom Sheet - Mobile Banking Style */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[92vh] p-0 border-t-0 rounded-t-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          {selectedTransaction && (
            <div className="h-full flex flex-col">
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
              </div>

              {/* Hero Section - Modern Banking Style */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>
                <div className="relative px-4 py-6 text-center">
                  {/* Close Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full bg-white/80 hover:bg-white/90 shadow-sm"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  {/* Transaction Type Badge */}
                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      {getTransactionIcon(selectedTransaction.type)}
                    </div>
                    <span className="text-sm font-medium bengali-font">
                      {selectedTransaction.type === 'sale' ? 'বিক্রয়' : 
                       selectedTransaction.type === 'expense' ? 'খরচ' : 'আদায়'}
                    </span>
                  </div>

                  {/* Amount Display - Banking Style */}
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 bengali-font">
                      {selectedTransaction.type === 'sale' ? 'মোট বিক্রয়' : 
                       selectedTransaction.type === 'expense' ? 'মোট খরচ' : 'মোট আদায়'}
                    </p>
                    <p className={`text-5xl font-black tracking-tight number-font ${getTransactionColor(selectedTransaction.type)}`}>
                      {selectedTransaction.type === 'expense' ? '-' : '+'}৳{formatCurrency(selectedTransaction.amount)}
                    </p>
                    
                    {/* Due Amount Banner for Sales */}
                    {selectedTransaction.type === 'sale' && selectedTransaction.due_amount > 0 && (
                      <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-red-50 border border-red-100 mt-3">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-green-700">
                            ৳{formatCurrency(selectedTransaction.paid_amount || 0)} পরিশোধিত
                          </span>
                        </div>
                        <div className="w-px h-4 bg-slate-300"></div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs font-medium text-red-700">
                            ৳{formatCurrency(selectedTransaction.due_amount || 0)} বাকি
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transaction ID - Subtle */}
                  <div className="flex items-center justify-center space-x-2 text-slate-400 mt-4">
                    <Hash className="w-3 h-3" />
                    <span className="text-xs font-mono">
                      ID: {selectedTransaction.id?.slice(-8).toUpperCase()}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/50">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 pb-6">
                <div className="space-y-4">
                  
                  {/* Main Details Card - Modern Style */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-100">
                        
                        {/* Customer/Description */}
                        <div className="flex items-center space-x-4 p-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 flex items-center justify-center">
                            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                              {selectedTransaction.type === 'sale' ? 'গ্রাহক' : 'বিবরণ'}
                            </p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white bengali-font truncate">
                              {selectedTransaction.type === 'sale' ? selectedTransaction.customer_name : 
                               selectedTransaction.description || 'বিবরণ নেই'}
                            </p>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="flex items-center space-x-4 p-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                              পেমেন্ট পদ্ধতি
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-base font-semibold text-slate-900 dark:text-white bengali-font">
                                {selectedTransaction.method || 'নগদ'}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {selectedTransaction.type === 'sale' && selectedTransaction.due_amount > 0 ? 'আংশিক' : 'সম্পূর্ণ'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-center space-x-4 p-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                              তারিখ ও সময়
                            </p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white bengali-font">
                              {getBengaliDate(new Date(selectedTransaction.date))}
                            </p>
                            <p className="text-sm text-slate-500">
                              {new Date(selectedTransaction.date).toLocaleTimeString('bn-BD', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Products List for Sales - Modern Design */}
                  {selectedTransaction.type === 'sale' && selectedTransaction.items && selectedTransaction.items.length > 0 && (
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Package className="w-5 h-5 text-slate-600" />
                          <h3 className="text-base font-semibold bengali-font">পণ্যের তালিকা</h3>
                          <Badge variant="secondary" className="text-xs">
                            {toBengaliNumber(selectedTransaction.items.length)}টি পণ্য
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {selectedTransaction.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white bengali-font">
                                  {item.productName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {toBengaliNumber(item.quantity)} × ৳{formatCurrency(parseFloat(item.unitPrice))}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-slate-900 dark:text-white number-font">
                                  ৳{formatCurrency(item.totalPrice)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons - Banking Style */}
                  {(selectedTransaction.type === 'sale' || selectedTransaction.type === 'expense') && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button 
                        variant="outline" 
                        className="h-12 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => {
                          setIsSheetOpen(false);
                          window.location.href = `/transactions/${selectedTransaction.type}/${selectedTransaction.id}`;
                        }}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        সম্পাদনা
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-12 border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                        onClick={() => deleteMutation.mutate(selectedTransaction)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        মুছুন
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}