import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { getBengaliDate, getBengaliTime, formatCurrency, toBengaliNumber, getBangladeshDateString, getBangladeshTime } from "@/lib/bengali-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";

export default function Transactions() {
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const { data: sales = [], isLoading: salesLoading, error: salesError } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID),
    staleTime: 0,
    gcTime: 0,
  });

  const { data: expenses = [], isLoading: expensesLoading, error: expensesError } = useQuery({
    queryKey: ['expenses', CURRENT_USER_ID],
    queryFn: () => supabaseService.getExpenses(CURRENT_USER_ID),
    staleTime: 0,
    gcTime: 0,
  });

  if (salesError) console.error('🔥 TRANSACTIONS Sales error:', salesError);
  if (expensesError) console.error('🔥 TRANSACTIONS Expenses error:', expensesError);

  // For collections, filter sales with negative amounts (collection records)
  const { data: collectionsData = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections', CURRENT_USER_ID],
    queryFn: async () => {
      const allSales = await supabaseService.getSales(CURRENT_USER_ID);
      // Filter for collection records (negative amounts) and regular collections
      return allSales.filter(sale => 
        parseFloat(sale.total_amount || '0') < 0 || // Collection records
        (parseFloat(sale.paid_amount || '0') > 0 && parseFloat(sale.due_amount || '0') === 0 && parseFloat(sale.total_amount || '0') > 0) // Full payments
      ).map(sale => ({
        ...sale,
        amount: Math.abs(parseFloat(sale.total_amount || '0') < 0 ? parseFloat(sale.total_amount || '0') : parseFloat(sale.paid_amount || '0')),
        collection_date: sale.created_at,
        customer_name: sale.customer_name
      }));
    },
    staleTime: 0,
    gcTime: 0,
  });

  const collections = collectionsData;



  // Combine all transactions with type indication
  const allTransactions = [
    ...sales.map((sale: any) => ({
      ...sale,
      type: 'sale',
      title: sale.customer_name || 'অজানা গ্রাহক',
      amount: parseFloat(sale.total_amount || 0),
      date: sale.sale_date || sale.created_at,
      icon: 'fas fa-shopping-cart',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    })),
    ...expenses.map((expense: any) => ({
      ...expense,
      type: 'expense',
      title: expense.description || 'খরচ',
      amount: -parseFloat(expense.amount || 0), // Negative for expenses
      date: expense.expense_date || expense.created_at,
      icon: 'fas fa-minus-circle',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    })),
    ...collections.map((collection: any) => ({
      ...collection,
      type: 'collection',
      title: collection.customer_name || 'সংগ্রহ',
      amount: parseFloat(collection.amount || 0),
      date: collection.collection_date || collection.created_at,
      icon: 'fas fa-hand-holding-usd',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Debug logging
  console.log('🔥 ALL TRANSACTIONS DATA:', {
    salesCount: sales.length,
    expensesCount: expenses.length,
    collectionsCount: collections.length,
    totalTransactions: allTransactions.length,
    sampleSaleDate: sales[0]?.sale_date || sales[0]?.created_at,
    currentDateFilter: dateFilter
  });

  // Filter transactions
  const getFilteredTransactions = () => {
    let filtered = allTransactions;

    // Filter by type
    if (activeTab !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter === "today") {
      // Use Bangladesh timezone for today's date
      const todayStr = getBangladeshDateString();
      
      console.log('🔥 FILTERING TODAY (Bangladesh time):', todayStr);
      console.log('🔥 SAMPLE TRANSACTION DATES:', allTransactions.slice(0, 3).map(t => ({ type: t.type, date: t.date ? t.date.split('T')[0] : 'no-date' })));
      
      filtered = filtered.filter(transaction => {
        const transactionDateStr = transaction.date ? transaction.date.split('T')[0] : '';
        const isTodayTransaction = transactionDateStr === todayStr;
        
        if (isTodayTransaction) {
          console.log('✅ MATCHED TODAY:', transaction.type, transaction.title, transactionDateStr);
        }
        
        return isTodayTransaction;
      });
      
      console.log('🔥 AFTER TODAY FILTER:', filtered.length, 'transactions');
      console.log('🔥 FILTERED SAMPLE:', filtered.slice(0, 2).map(t => ({ type: t.type, title: t.title, date: t.date ? t.date.split('T')[0] : 'no-date' })));
    } else if (dateFilter === "week") {
      const weekAgo = getBangladeshTime();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = getBangladeshDateString(weekAgo);
      
      filtered = filtered.filter(transaction => {
        const transactionDateStr = transaction.date ? transaction.date.split('T')[0] : '';
        return transactionDateStr >= weekAgoStr;
      });
    } else if (dateFilter === "month") {
      const monthAgo = getBangladeshTime();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthAgoStr = getBangladeshDateString(monthAgo);
      
      filtered = filtered.filter(transaction => {
        const transactionDateStr = transaction.date ? transaction.date.split('T')[0] : '';
        return transactionDateStr >= monthAgoStr;
      });
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate totals
  const totals = {
    sales: filteredTransactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0),
    expenses: Math.abs(filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)),
    collections: filteredTransactions.filter(t => t.type === 'collection').reduce((sum, t) => sum + t.amount, 0),
    net: filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Add UTF-8 support for Bengali text
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.text('Transaction Report - দোকান হিসাব', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${getBengaliDate()}`, 20, 45);
    doc.text(`Period: ${dateFilter === 'today' ? 'আজকের' : dateFilter === 'week' ? 'সাপ্তাহিক' : dateFilter === 'month' ? 'মাসিক' : 'সকল'} লেনদেন`, 20, 55);
    
    // Summary Box
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 70, 170, 40, 'F');
    
    doc.setFontSize(14);
    doc.text('Summary / সারসংক্ষেপ:', 25, 85);
    
    doc.setFontSize(10);
    doc.text(`Total Sales / মোট বিক্রয়: ${formatCurrency(totals.sales)}`, 25, 95);
    doc.text(`Total Expenses / মোট খরচ: ${formatCurrency(totals.expenses)}`, 25, 102);
    doc.text(`Total Collections / মোট সংগ্রহ: ${formatCurrency(totals.collections)}`, 100, 95);
    doc.text(`Net Amount / নিট পরিমাণ: ${formatCurrency(totals.net)}`, 100, 102);
    
    // Transaction Details
    let yPosition = 130;
    doc.setFontSize(12);
    doc.text('Transaction Details / লেনদেনের বিস্তারিত:', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(9);
    filteredTransactions.slice(0, 25).forEach((transaction, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }
      
      const typeText = transaction.type === 'sale' ? 'Sale/বিক্রয়' : 
                      transaction.type === 'expense' ? 'Expense/খরচ' : 'Collection/সংগ্রহ';
      
      doc.text(`${index + 1}. ${typeText}: ${transaction.title}`, 20, yPosition);
      doc.text(`Amount: ${formatCurrency(Math.abs(transaction.amount))}`, 120, yPosition);
      doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 20, yPosition + 7);
      
      yPosition += 20;
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount} - Generated by দোকান হিসাব`, 20, 285);
    }
    
    // Save the PDF
    doc.save(`transactions-report-${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}.pdf`);
    
    toast({
      title: "সফল",
      description: "রিপোর্ট PDF ডাউনলোড সম্পন্ন হয়েছে",
    });
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'sale': return 'বিক্রয়';
      case 'expense': return 'খরচ';
      case 'collection': return 'সংগ্রহ';
      default: return 'অজানা';
    }
  };

  return (
    <div className="page-layout">
      {/* Modern Header with Status */}
      <div className="page-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="w-10 h-10">
                  <i className="fas fa-arrow-left text-slate-600"></i>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-900 bengali-font">সকল লেনদেন</h1>
                <div className="text-sm text-slate-500 flex items-center space-x-2">
                  <span>{getBengaliDate()}</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">লাইভ</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={generatePDFReport} 
                variant="outline"
                size="sm"
              >
                <i className="fas fa-download mr-2"></i>
                PDF
              </Button>
              <Link to="/sales/new">
                <Button size="sm">
                  <i className="fas fa-plus mr-2"></i>
                  নতুন
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-content content-max-width">
        {/* Summary Cards */}
        <div className="section-spacing">
        <div className="responsive-grid-2">
          <div className="stats-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-chart-line text-green-600 text-lg"></i>
              </div>
              <div className="text-right">
                <div className="currency-display text-green-600">
                  {formatCurrency(totals.sales)}
                </div>
                <div className="caption bengali-font">মোট বিক্রয়</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <i className="fas fa-arrow-up mr-1"></i>
              <span className="bengali-font">আয়ের পরিমাণ</span>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-chart-line-down text-red-600 text-lg"></i>
              </div>
              <div className="text-right">
                <div className="currency-display text-red-600">
                  {formatCurrency(totals.expenses)}
                </div>
                <div className="caption bengali-font">মোট খরচ</div>
              </div>
            </div>
            <div className="flex items-center text-sm text-red-600">
              <i className="fas fa-arrow-down mr-1"></i>
              <span className="bengali-font">ব্যয়ের পরিমাণ</span>
            </div>
          </div>
        </div>

        {/* Net Amount Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <i className="fas fa-wallet text-blue-600 text-xl"></i>
                </div>
                <div>
                  <div className="heading-3 text-blue-900 bengali-font">নিট আয়</div>
                  <div className="caption text-blue-600">মোট লাভ/ক্ষতি</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold number-font ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.net)}
                </div>
                <div className="caption text-blue-600 bengali-font">
                  {totals.net >= 0 ? 'লাভ' : 'ক্ষতি'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <div className="px-4 pb-4 space-y-4">
        {/* Search Input */}
        <div className="search-input">
          <Input
            placeholder="লেনদেন খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="enhanced-input"
          />
        </div>
        
        {/* Filter Pills Row */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <button 
            onClick={() => setDateFilter("all")}
            className={`filter-pill ${dateFilter === "all" ? "active" : ""}`}
          >
            সব সময়
          </button>
          <button 
            onClick={() => setDateFilter("today")}
            className={`filter-pill ${dateFilter === "today" ? "active" : ""}`}
          >
            আজকের
          </button>
          <button 
            onClick={() => setDateFilter("week")}
            className={`filter-pill ${dateFilter === "week" ? "active" : ""}`}
          >
            সাপ্তাহিক
          </button>
          <button 
            onClick={() => setDateFilter("month")}
            className={`filter-pill ${dateFilter === "month" ? "active" : ""}`}
          >
            মাসিক
          </button>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="px-4 mb-4">
        <div className="enhanced-tabs">
          <div className="flex space-x-1">
            <button 
              onClick={() => setActiveTab("all")}
              className={`enhanced-tab ${activeTab === "all" ? "active" : ""}`}
              data-state={activeTab === "all" ? "active" : "inactive"}
            >
              <i className="fas fa-list mr-2"></i>
              সব ({toBengaliNumber(allTransactions.length)})
            </button>
            <button 
              onClick={() => setActiveTab("sale")}
              className={`enhanced-tab ${activeTab === "sale" ? "active" : ""}`}
              data-state={activeTab === "sale" ? "active" : "inactive"}
            >
              <i className="fas fa-shopping-cart mr-2"></i>
              বিক্রয় ({toBengaliNumber(sales.length)})
            </button>
            <button 
              onClick={() => setActiveTab("expense")}
              className={`enhanced-tab ${activeTab === "expense" ? "active" : ""}`}
              data-state={activeTab === "expense" ? "active" : "inactive"}
            >
              <i className="fas fa-minus-circle mr-2"></i>
              খরচ ({toBengaliNumber(expenses.length)})
            </button>
            <button 
              onClick={() => setActiveTab("collection")}
              className={`enhanced-tab ${activeTab === "collection" ? "active" : ""}`}
              data-state={activeTab === "collection" ? "active" : "inactive"}
            >
              <i className="fas fa-hand-holding-usd mr-2"></i>
              সংগ্রহ ({toBengaliNumber(collections.length)})
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Transaction List */}
      <div className="px-4 mobile-safe-area space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-receipt"></i>
            </div>
            <h3 className="heading-3 text-gray-900 mb-2 bengali-font">কোনো লেনদেন পাওয়া যায়নি</h3>
            <p className="body-regular text-gray-500 mb-6 bengali-font">
              {searchTerm 
                ? "আপনার খোঁজা লেনদেন খুঁজে পাওয়া যায়নি"
                : "এই সময়ে কোনো লেনদেন নেই"
              }
            </p>
            <Link to="/sales/new">
              <Button className="action-btn action-btn-primary">
                <i className="fas fa-plus mr-2"></i>
                নতুন বিক্রয় যোগ করুন
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {filteredTransactions.map((transaction, index) => (
              <div key={`${transaction.type}-${transaction.id || index}`} className="transaction-item slide-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.type === 'sale' ? 'bg-green-100' :
                      transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <i className={`${transaction.icon} ${
                        transaction.type === 'sale' ? 'text-green-600' :
                        transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                      } text-lg`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="body-large font-medium text-gray-900 bengali-font mb-1">
                        {transaction.title}
                      </h4>
                      <div className="flex items-center space-x-3">
                        <span className={`status-badge ${
                          transaction.type === 'sale' ? 'success' :
                          transaction.type === 'expense' ? 'error' : 'warning'
                        }`}>
                          {getTransactionTypeText(transaction.type)}
                        </span>
                        <span className="caption text-gray-500 bengali-font">
                          {getBengaliDate(new Date(transaction.date))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`currency-display ${
                      transaction.type === 'sale' ? 'text-green-600' :
                      transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <div className="caption text-gray-500">
                      {getBengaliTime(new Date(transaction.date))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Results Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="text-center">
                <div className="body-regular text-gray-600 mb-2 bengali-font">
                  {dateFilter === 'today' ? 'আজকের' : dateFilter === 'week' ? 'সাপ্তাহিক' : dateFilter === 'month' ? 'মাসিক' : 'সকল'} লেনদেনের সারাংশ
                </div>
                <div className="responsive-grid-2 gap-4">
                  <div>
                    <div className="number-display text-green-600 text-lg">
                      +{formatCurrency(totals.sales)}
                    </div>
                    <div className="caption text-gray-500 bengali-font">মোট আয়</div>
                  </div>
                  <div>
                    <div className="number-display text-red-600 text-lg">
                      -{formatCurrency(totals.expenses)}
                    </div>
                    <div className="caption text-gray-500 bengali-font">মোট খরচ</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className={`text-2xl font-bold number-font ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totals.net >= 0 ? '+' : ''}{formatCurrency(totals.net)}
                  </div>
                  <div className="caption text-gray-600 bengali-font">
                    নিট {totals.net >= 0 ? 'লাভ' : 'ক্ষতি'}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <Link to="/sales/new">
        <div className="fab">
          <i className="fas fa-plus text-xl"></i>
        </div>
      </Link>
    </div>
  );
}