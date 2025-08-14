// Quick test function for PDF generation
import { pdfService } from './pdf-service';

export const testPDFGeneration = async () => {
  try {
    console.log('Testing PDF generation...');
    
    const testData = {
      businessName: 'দোকান হিসাব টেস্ট',
      ownerName: 'মোঃ রহিম',
      totalSales: 5000,
      totalExpenses: 2000,
      totalCollections: 3000,
      netProfit: 3000,
      transactionCount: 10,
      transactions: [
        {
          type: 'sale',
          date: new Date().toISOString(),
          amount: 1500,
          description: 'পণ্য বিক্রয়'
        },
        {
          type: 'expense',
          date: new Date().toISOString(),
          amount: 500,
          description: 'দোকান ভাড়া'
        }
      ],
      periodTitle: 'আজকের প্রতিবেদন'
    };

    await pdfService.generateTransactionReport(testData);
    console.log('PDF generation test successful!');
    return true;
  } catch (error) {
    console.error('PDF generation test failed:', error);
    return false;
  }
};

// Test invoice generation
export const testInvoiceGeneration = async () => {
  try {
    const saleData = {
      id: 'test-sale-123',
      customer_name: 'কামাল আহমেদ',
      customer_phone: '01712345678',
      total_amount: 1500,
      paid_amount: 1000,
      due_amount: 500,
      payment_method: 'নগদ',
      sale_date: new Date().toISOString(),
      items: [
        {
          productName: 'চাল',
          quantity: 5,
          unitPrice: '50',
          totalPrice: 250
        },
        {
          productName: 'ডাল',
          quantity: 2,
          unitPrice: '150',
          totalPrice: 300
        }
      ]
    };

    const businessInfo = {
      businessName: 'রহিমের দোকান',
      ownerName: 'মোঃ রহিম'
    };

    await pdfService.generateInvoice(saleData, businessInfo);
    console.log('Invoice generation test successful!');
    return true;
  } catch (error) {
    console.error('Invoice generation test failed:', error);
    return false;
  }
};