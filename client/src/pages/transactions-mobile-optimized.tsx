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
  User, CreditCard, Hash, Copy, X
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

      {/* Transaction Details Bottom Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          {selectedTransaction && (
            <div className="space-y-6">
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      {getTransactionIcon(selectedTransaction.type)}
                    </div>
                    <div>
                      <SheetTitle className="text-lg bengali-font">
                        {selectedTransaction.type === 'sale' ? 'বিক্রয়ের তথ্য' : 
                         selectedTransaction.type === 'expense' ? 'খরচের তথ্য' : 'আদায়ের তথ্য'}
                      </SheetTitle>
                      <p className="text-sm text-slate-500">
                        {new Date(selectedTransaction.date).toLocaleDateString('bn-BD', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsSheetOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </SheetHeader>

              {/* Transaction ID */}
              <div className="flex items-center justify-center space-x-2 text-slate-500">
                <Hash className="w-4 h-4" />
                <span className="text-sm font-mono">
                  {selectedTransaction.id?.slice(-8).toUpperCase()}
                </span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>

              {/* Amount Display */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-slate-600 bengali-font mb-2">
                    {selectedTransaction.type === 'sale' ? 'বিক্রয়ের পরিমাণ' : 
                     selectedTransaction.type === 'expense' ? 'খরচের পরিমাণ' : 'আদায়ের পরিমাণ'}
                  </p>
                  <p className={`text-4xl font-black number-font ${getTransactionColor(selectedTransaction.type)}`}>
                    {selectedTransaction.type === 'expense' ? '-' : '+'}৳{formatCurrency(selectedTransaction.amount)}
                  </p>
                  
                  {selectedTransaction.type === 'sale' && selectedTransaction.due_amount > 0 && (
                    <div className="flex items-center justify-center space-x-4 text-sm mt-3">
                      <span className="text-green-600">
                        পরিশোধিত: ৳{formatCurrency(selectedTransaction.paid_amount || 0)}
                      </span>
                      <span className="text-red-600">
                        বাকি: ৳{formatCurrency(selectedTransaction.due_amount || 0)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transaction Details */}
              <div className="space-y-4">
                {/* Customer/Description */}
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                  <User className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 bengali-font">
                      {selectedTransaction.type === 'sale' ? 'গ্রাহক' : 'বিবরণ'}
                    </p>
                    <p className="text-base text-slate-900 bengali-font">
                      {selectedTransaction.type === 'sale' ? selectedTransaction.customer_name : 
                       selectedTransaction.description || 'বিবরণ নেই'}
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                  <CreditCard className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 bengali-font">পেমেন্ট পদ্ধতি</p>
                    <p className="text-base text-slate-900 bengali-font">
                      {selectedTransaction.method || 'নগদ'}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 bengali-font">তারিখ ও সময়</p>
                    <p className="text-base text-slate-900 bengali-font">
                      {getBengaliDate(new Date(selectedTransaction.date))}
                    </p>
                  </div>
                </div>

                {/* Products (for sales) */}
                {selectedTransaction.type === 'sale' && selectedTransaction.items && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 bengali-font">পণ্যের তালিকা</p>
                    <div className="space-y-2">
                      {selectedTransaction.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium bengali-font">{item.productName}</p>
                            <p className="text-xs text-slate-500">
                              পরিমাণ: {toBengaliNumber(item.quantity)} × ৳{formatCurrency(parseFloat(item.unitPrice))}
                            </p>
                          </div>
                          <p className="text-sm font-bold number-font">
                            ৳{formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {(selectedTransaction.type === 'sale' || selectedTransaction.type === 'expense') && (
                <div className="flex space-x-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12"
                    onClick={() => {
                      // Navigate to edit page
                      setIsSheetOpen(false);
                      window.location.href = `/transactions/${selectedTransaction.type}/${selectedTransaction.id}`;
                    }}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    সম্পাদনা
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 text-red-600 border-red-200 hover:bg-red-50"
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
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}