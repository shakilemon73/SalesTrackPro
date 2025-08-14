import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { getBengaliDate, formatCurrency, toBengaliNumber } from './bengali-utils';

// Register Bengali font (using a web font fallback)
Font.register({
  family: 'NotoSansBengali',
  src: 'https://fonts.gstatic.com/s/notosansbengali/v13/Cn-SJsCGWQxOjTbR24EMuSaqP77YHd4P9oPvdGLyPV0.woff2',
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'NotoSansBengali',
  },
  header: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  businessInfo: {
    fontSize: 12,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#f8fafc',
    border: '2pt solid #2563eb',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2563eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  profitContainer: {
    backgroundColor: '#f0fdf4',
    border: '1pt solid #22c55e',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  profitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profitAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
    color: '#374151',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    padding: 8,
    borderBottom: '1pt solid #9ca3af',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5pt solid #d1d5db',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    padding: 2,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    padding: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTop: '0.5pt solid #d1d5db',
    paddingTop: 10,
  },
  statisticsContainer: {
    backgroundColor: '#fef3c7',
    border: '1pt solid #f59e0b',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

// Transaction Report PDF Component
export const TransactionReportPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>লেনদেন প্রতিবেদন</Text>
        <Text style={styles.subtitle}>{data.businessName}</Text>
        <Text style={styles.businessInfo}>মালিক: {data.ownerName}</Text>
        <Text style={styles.businessInfo}>প্রতিবেদনের তারিখ: {data.reportDate}</Text>
      </View>

      {/* Financial Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>আর্থিক সারসংক্ষেপ</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>মোট বিক্রয়:</Text>
          <Text style={[styles.summaryValue, { color: '#22c55e' }]}>
            {formatCurrency(data.totalSales)} টাকা
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>মোট খরচ:</Text>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
            {formatCurrency(data.totalExpenses)} টাকা
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>মোট আদায়:</Text>
          <Text style={[styles.summaryValue, { color: '#3b82f6' }]}>
            {formatCurrency(data.totalCollections)} টাকা
          </Text>
        </View>

        <View style={styles.profitContainer}>
          <Text style={styles.profitTitle}>নিট লাভ/ক্ষতি</Text>
          <Text style={[
            styles.profitAmount, 
            { color: data.netProfit >= 0 ? '#22c55e' : '#ef4444' }
          ]}>
            {formatCurrency(Math.abs(data.netProfit))} টাকা
          </Text>
          <Text style={{ fontSize: 12 }}>
            {data.netProfit >= 0 ? '(লাভ)' : '(ক্ষতি)'}
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statisticsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>মোট লেনদেন:</Text>
          <Text style={styles.statValue}>{toBengaliNumber(data.transactionCount)}টি</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>গড় বিক্রয়:</Text>
          <Text style={styles.statValue}>
            {data.transactionCount > 0 
              ? formatCurrency(data.totalSales / data.transactionCount) 
              : '০'} টাকা
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>রিপোর্ট তৈরির সময়:</Text>
          <Text style={styles.statValue}>{new Date().toLocaleString('bn-BD')}</Text>
        </View>
      </View>

      {/* Transaction Table */}
      {data.transactions && data.transactions.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>বিস্তারিত লেনদেন তালিকা</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>তারিখ</Text>
              <Text style={styles.tableCellHeader}>ধরন</Text>
              <Text style={styles.tableCellHeader}>বিবরণ</Text>
              <Text style={styles.tableCellHeader}>পরিমাণ</Text>
            </View>
            
            {data.transactions.slice(0, 15).map((txn: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {new Date(txn.date).toLocaleDateString('bn-BD')}
                </Text>
                <Text style={styles.tableCell}>
                  {txn.type === 'sale' ? 'বিক্রয়' : 
                   txn.type === 'expense' ? 'খরচ' : 'আদায়'}
                </Text>
                <Text style={styles.tableCell}>
                  {txn.description || 'N/A'}
                </Text>
                <Text style={styles.tableCell}>
                  {formatCurrency(txn.amount)} টাকা
                </Text>
              </View>
            ))}
          </View>
          
          {data.transactions.length > 15 && (
            <Text style={{ fontSize: 10, fontStyle: 'italic', textAlign: 'center' }}>
              দ্রষ্টব্য: শুধুমাত্র সাম্প্রতিক ১৫টি লেনদেন দেখানো হয়েছে
            </Text>
          )}
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        {data.businessName} | মালিক: {data.ownerName} | 
        তৈরি: {new Date().toLocaleString('bn-BD')} | দোকান হিসাব অ্যাপ
      </Text>
    </Page>
  </Document>
);

// Sales Invoice PDF Component
export const InvoicePDF = ({ sale, businessInfo }: { sale: any; businessInfo: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>চালান</Text>
        <Text style={styles.subtitle}>{businessInfo.businessName}</Text>
        <Text style={styles.businessInfo}>মালিক: {businessInfo.ownerName}</Text>
      </View>

      {/* Invoice Info */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <View>
          <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
            চালান নম্বর: #{sale.id?.slice(-8).toUpperCase()}
          </Text>
          <Text style={{ fontSize: 11 }}>
            তারিখ: {new Date(sale.sale_date).toLocaleDateString('bn-BD')}
          </Text>
          <Text style={{ fontSize: 11 }}>
            সময়: {new Date(sale.sale_date).toLocaleTimeString('bn-BD')}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 12, fontWeight: 'bold' }}>গ্রাহকের তথ্য:</Text>
          <Text style={{ fontSize: 11 }}>নাম: {sale.customer_name}</Text>
          {sale.customer_phone && (
            <Text style={{ fontSize: 11 }}>ফোন: {sale.customer_phone}</Text>
          )}
        </View>
      </View>

      {/* Items Table */}
      <Text style={styles.sectionTitle}>পণ্যের বিবরণ</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCellHeader}>পণ্যের নাম</Text>
          <Text style={styles.tableCellHeader}>পরিমাণ</Text>
          <Text style={styles.tableCellHeader}>একক মূল্য</Text>
          <Text style={styles.tableCellHeader}>মোট মূল্য</Text>
        </View>
        
        {sale.items?.map((item: any, index: number) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.productName}</Text>
            <Text style={styles.tableCell}>{toBengaliNumber(item.quantity)}</Text>
            <Text style={styles.tableCell}>{formatCurrency(parseFloat(item.unitPrice))} টাকা</Text>
            <Text style={styles.tableCell}>{formatCurrency(item.totalPrice)} টাকা</Text>
          </View>
        )) || (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>কোন পণ্য নেই</Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={styles.tableCell}>-</Text>
          </View>
        )}
      </View>

      {/* Payment Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>পেমেন্ট সারসংক্ষেপ</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>মোট পরিমাণ:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(sale.total_amount)} টাকা</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>পরিশোধিত পরিমাণ:</Text>
          <Text style={[styles.summaryValue, { color: '#22c55e' }]}>
            {formatCurrency(sale.paid_amount || 0)} টাকা
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>বকেয়া পরিমাণ:</Text>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
            {formatCurrency(sale.due_amount || 0)} টাকা
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>পেমেন্ট পদ্ধতি:</Text>
          <Text style={styles.summaryValue}>{sale.payment_method || 'নগদ'}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        ধন্যবাদ আপনার ব্যবসার জন্য! | {businessInfo.businessName} | 
        মালিক: {businessInfo.ownerName} | তৈরি: {new Date().toLocaleString('bn-BD')}
      </Text>
    </Page>
  </Document>
);

// Customer Statement PDF Component  
export const CustomerStatementPDF = ({ customer, transactions, businessInfo }: { 
  customer: any; 
  transactions: any[]; 
  businessInfo: any; 
}) => {
  const totalSales = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.total_amount, 0);
    
  const totalPaid = transactions
    .filter(t => t.type === 'collection')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalDue = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + (t.due_amount || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>গ্রাহক বিবৃতি</Text>
          <Text style={styles.subtitle}>{businessInfo.businessName}</Text>
          <Text style={styles.businessInfo}>প্রতিবেদনের তারিখ: {getBengaliDate()}</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryTitle, { marginBottom: 10 }]}>{customer.name}</Text>
          {customer.phone_number && (
            <Text style={{ fontSize: 12, marginBottom: 5 }}>
              ফোন: {customer.phone_number}
            </Text>
          )}
          {customer.address && (
            <Text style={{ fontSize: 12, marginBottom: 5 }}>
              ঠিকানা: {customer.address}
            </Text>
          )}
          <Text style={{ fontSize: 11, color: '#6b7280' }}>
            গ্রাহক আইডি: {customer.id?.slice(-8).toUpperCase()}
          </Text>
        </View>

        {/* Account Summary */}
        <Text style={styles.sectionTitle}>হিসাব সারসংক্ষেপ</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>মোট কেনাকাটা</Text>
            <Text style={styles.tableCellHeader}>মোট পরিশোধ</Text>
            <Text style={styles.tableCellHeader}>বকেয়া পরিমাণ</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{formatCurrency(totalSales)} টাকা</Text>
            <Text style={[styles.tableCell, { color: '#22c55e' }]}>
              {formatCurrency(totalPaid)} টাকা
            </Text>
            <Text style={[styles.tableCell, { color: '#ef4444' }]}>
              {formatCurrency(totalDue)} টাকা
            </Text>
          </View>
        </View>

        {/* Transaction History */}
        <Text style={styles.sectionTitle}>লেনদেন ইতিহাস</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>তারিখ</Text>
            <Text style={styles.tableCellHeader}>ধরন</Text>
            <Text style={styles.tableCellHeader}>বিবরণ</Text>
            <Text style={styles.tableCellHeader}>পরিমাণ</Text>
            <Text style={styles.tableCellHeader}>অবস্থা</Text>
          </View>
          
          {transactions.slice(0, 20).map((txn: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {new Date(txn.date).toLocaleDateString('bn-BD')}
              </Text>
              <Text style={styles.tableCell}>
                {txn.type === 'sale' ? 'বিক্রয়' : 'আদায়'}
              </Text>
              <Text style={styles.tableCell}>{txn.description || 'N/A'}</Text>
              <Text style={styles.tableCell}>{formatCurrency(txn.amount)} টাকা</Text>
              <Text style={styles.tableCell}>
                {txn.type === 'sale' 
                  ? (txn.due_amount > 0 ? 'বকেয়া' : 'পরিশোধিত') 
                  : 'আদায়'}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {businessInfo.businessName} | মালিক: {businessInfo.ownerName} | 
          তৈরি: {new Date().toLocaleString('bn-BD')}
        </Text>
      </Page>
    </Document>
  );
};

// PDF Generation Functions
export const generatePDF = async (component: React.ReactElement, filename: string) => {
  try {
    const blob = await pdf(component).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};