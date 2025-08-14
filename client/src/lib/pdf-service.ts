import { 
  TransactionReportPDF, 
  InvoicePDF, 
  CustomerStatementPDF,
  generatePDF 
} from './react-pdf-generator';
import type { TransactionReportData, BusinessInfo, SaleData, CustomerData } from './latex-pdf-generator';

// Enhanced PDF Service using React-PDF with Bengali support
class PDFService {
  // Generate transaction report PDF
  async generateTransactionReport(data: {
    businessName: string;
    ownerName: string;
    totalSales: number;
    totalExpenses: number;
    totalCollections: number;
    netProfit: number;
    transactionCount: number;
    transactions?: any[];
    periodTitle?: string;
  }): Promise<void> {
    const reportData: TransactionReportData = {
      ...data,
      reportDate: new Date().toLocaleDateString('bn-BD'),
      periodTitle: data.periodTitle || 'সার্বিক প্রতিবেদন',
      transactions: data.transactions || []
    };

    const filename = `লেনদেন-প্রতিবেদন-${new Date().toISOString().split('T')[0]}.pdf`;
    
    await generatePDF(
      TransactionReportPDF({ data: reportData }),
      filename
    );
  }

  // Generate sales invoice PDF
  async generateInvoice(sale: SaleData, businessInfo: BusinessInfo): Promise<void> {
    const filename = `চালান-${sale.id?.slice(-8).toUpperCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    await generatePDF(
      InvoicePDF({ sale, businessInfo }),
      filename
    );
  }

  // Generate customer statement PDF
  async generateCustomerStatement(
    customer: CustomerData, 
    transactions: any[], 
    businessInfo: BusinessInfo
  ): Promise<void> {
    const filename = `গ্রাহক-বিবৃতি-${customer.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    await generatePDF(
      CustomerStatementPDF({ customer, transactions, businessInfo }),
      filename
    );
  }
}

export const pdfService = new PDFService();