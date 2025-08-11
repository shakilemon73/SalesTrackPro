import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { getBengaliDate, getBengaliTime, formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
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
  const [dateFilter, setDateFilter] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID),
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', CURRENT_USER_ID],
    queryFn: () => supabaseService.getExpenses(CURRENT_USER_ID),
  });

  // For collections, use sales data with paid amounts as a simple solution
  const { data: collectionsData = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections', CURRENT_USER_ID],
    queryFn: async () => {
      const allSales = await supabaseService.getSales(CURRENT_USER_ID);
      return allSales.filter(sale => parseFloat(sale.paid_amount || '0') > 0).map(sale => ({
        ...sale,
        amount: sale.paid_amount,
        collection_date: sale.created_at,
        customer_name: sale.customer_name
      }));
    },
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
      const today = new Date().toDateString();
      filtered = filtered.filter(transaction =>
        new Date(transaction.date).toDateString() === today
      );
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(transaction =>
        new Date(transaction.date) >= weekAgo
      );
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(transaction =>
        new Date(transaction.date) >= monthAgo
      );
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <button className="p-2">
                <i className="fas fa-arrow-left"></i>
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">সকল লেনদেন</h1>
              <p className="text-sm text-green-100">{getBengaliDate()}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={generatePDFReport} variant="outline" className="text-primary bg-white">
              <i className="fas fa-download mr-2"></i>
              PDF
            </Button>
            <Link to="/sales/new">
              <Button className="bg-accent hover:bg-accent/90">
                <i className="fas fa-plus mr-2"></i>
                নতুন
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 number-font">
                {formatCurrency(totals.sales)}
              </div>
              <div className="text-xs text-gray-600">মোট বিক্রয়</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600 number-font">
                {formatCurrency(totals.expenses)}
              </div>
              <div className="text-xs text-gray-600">মোট খরচ</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="px-4 pb-4 space-y-3">
        <Input
          placeholder="লেনদেন খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব সময়</SelectItem>
            <SelectItem value="today">আজকের</SelectItem>
            <SelectItem value="week">সাপ্তাহিক</SelectItem>
            <SelectItem value="month">মাসিক</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">সব ({toBengaliNumber(allTransactions.length)})</TabsTrigger>
          <TabsTrigger value="sale">বিক্রয় ({toBengaliNumber(sales.length)})</TabsTrigger>
          <TabsTrigger value="expense">খরচ ({toBengaliNumber(expenses.length)})</TabsTrigger>
          <TabsTrigger value="collection">সংগ্রহ ({toBengaliNumber(collections.length)})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <i className="fas fa-receipt text-4xl"></i>
                  </div>
                  <p className="text-gray-600">কোনো লেনদেন পাওয়া যায়নি</p>
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <Card key={`${transaction.type}-${transaction.id || index}`} className={transaction.bgColor}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${transaction.bgColor}`}>
                          <i className={`${transaction.icon} ${transaction.color}`}></i>
                        </div>
                        <div>
                          <p className="font-medium">{transaction.title}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={transaction.color}>
                              {getTransactionTypeText(transaction.type)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('bn-BD')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold number-font ${transaction.color}`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getBengaliTime(new Date(transaction.date))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Net Amount Summary */}
      <div className="p-4">
        <Card className={totals.net >= 0 ? 'bg-green-50' : 'bg-red-50'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">নিট পরিমাণ</p>
                <p className="text-sm text-gray-600">
                  {dateFilter === 'today' ? 'আজকের' : dateFilter === 'week' ? 'সাপ্তাহিক' : dateFilter === 'month' ? 'মাসিক' : 'সকল'} লেনদেনের সার
                </p>
              </div>
              <div className={`text-xl font-bold number-font ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totals.net >= 0 ? '+' : ''}{formatCurrency(totals.net)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}