/**
 * WhatsApp Business integration for Bengali shopkeepers
 * Enables easy sharing of sales reports, customer dues, and business updates
 */

import { formatCurrency, toBengaliNumber, getBengaliDate } from './bengali-utils';

interface WhatsAppMessage {
  type: 'sales_report' | 'due_reminder' | 'stock_alert' | 'daily_summary';
  recipient?: string;
  content: string;
}

interface SalesReportData {
  todaySales: number;
  totalSales: number;
  profit: number;
  pendingCollection: number;
  salesCount: number;
}

interface DueReminderData {
  customerName: string;
  dueAmount: number;
  lastSaleDate: string;
  customerPhone?: string;
}

class WhatsAppBusinessManager {
  private baseWhatsAppUrl = 'https://wa.me/';
  
  // Generate sales report message in Bengali
  generateSalesReport(data: SalesReportData): WhatsAppMessage {
    const date = getBengaliDate();
    const content = `🏪 *দোকান হিসাব - বিক্রয় রিপোর্ট*
📅 তারিখ: ${date}

💰 *আজকের বিক্রয়:* ${formatCurrency(data.todaySales)}
📊 *মোট বিক্রয়:* ${formatCurrency(data.totalSales)}
💵 *লাভ:* ${formatCurrency(data.profit)}
⏳ *বাকি আদায়:* ${formatCurrency(data.pendingCollection)}
🛒 *মোট লেনদেন:* ${toBengaliNumber(data.salesCount)}টি

---
দোকান হিসাব অ্যাপ দিয়ে তৈরি 📱
আপনার ব্যবসার সম্পূর্ণ হিসাব রাখুন!`;

    return {
      type: 'sales_report',
      content
    };
  }

  // Generate due reminder message in Bengali
  generateDueReminder(data: DueReminderData): WhatsAppMessage {
    const content = `🔔 *বাকি টাকার রিমাইন্ডার*

প্রিয় ${data.customerName} ভাই/আপু,
আশা করি ভালো আছেন। 

💰 আপনার বাকি টাকার পরিমাণ: *${formatCurrency(data.dueAmount)}*
📅 শেষ কেনাকাটার তারিখ: ${data.lastSaleDate}

দয়া করে সুবিধা মতো টাকা পরিশোধ করবেন।
ধন্যবাদ! 🙏

---
দোকান হিসাব অ্যাপ থেকে পাঠানো`;

    return {
      type: 'due_reminder',
      recipient: data.customerPhone,
      content
    };
  }

  // Generate daily business summary
  generateDailySummary(data: SalesReportData & { expenses: number }): WhatsAppMessage {
    const date = getBengaliDate();
    const netProfit = data.profit - data.expenses;
    
    const content = `📈 *দৈনিক ব্যবসায়িক সারসংক্ষেপ*
📅 ${date}

💰 *আয়:* ${formatCurrency(data.todaySales)}
💸 *খরচ:* ${formatCurrency(data.expenses)}
💵 *নিট লাভ:* ${formatCurrency(netProfit)}
⏳ *বাকি:* ${formatCurrency(data.pendingCollection)}

${netProfit > 0 ? '✅ আজ লাভজনক দিন!' : '⚠️ আজ ক্ষতির দিকে!'} 

---
দোকান হিসাব অ্যাপ 📱`;

    return {
      type: 'daily_summary',
      content
    };
  }

  // Generate stock alert message
  generateStockAlert(lowStockItems: { name: string; currentStock: number; minStock: number }[]): WhatsAppMessage {
    let content = `⚠️ *স্টক সতর্কতা*\n\nনিম্নলিখিত পণ্যগুলোর স্টক কম:\n\n`;
    
    lowStockItems.forEach(item => {
      content += `• ${item.name}: ${toBengaliNumber(item.currentStock)} (সর্বনিম্ন: ${toBengaliNumber(item.minStock)})\n`;
    });
    
    content += `\n📦 দ্রুত স্টক পূরণ করুন!\n\n---\nদোকান হিসাব অ্যাপ থেকে সতর্কতা`;

    return {
      type: 'stock_alert',
      content
    };
  }

  // Open WhatsApp with message
  shareViaWhatsApp(message: WhatsAppMessage, phoneNumber?: string): void {
    const encodedMessage = encodeURIComponent(message.content);
    let whatsappUrl = `${this.baseWhatsAppUrl}`;
    
    if (phoneNumber || message.recipient) {
      const phone = (phoneNumber || message.recipient || '').replace(/[^\d]/g, '');
      whatsappUrl += `${phone}?text=${encodedMessage}`;
    } else {
      whatsappUrl += `?text=${encodedMessage}`;
    }
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    console.log(`📱 WHATSAPP: Opening message type ${message.type}`);
  }

  // Share sales report
  shareSalesReport(data: SalesReportData, phoneNumber?: string): void {
    const message = this.generateSalesReport(data);
    this.shareViaWhatsApp(message, phoneNumber);
  }

  // Send due reminder
  sendDueReminder(data: DueReminderData): void {
    const message = this.generateDueReminder(data);
    this.shareViaWhatsApp(message, data.customerPhone);
  }

  // Share daily summary
  shareDailySummary(data: SalesReportData & { expenses: number }, phoneNumber?: string): void {
    const message = this.generateDailySummary(data);
    this.shareViaWhatsApp(message, phoneNumber);
  }

  // Share stock alert
  shareStockAlert(lowStockItems: { name: string; currentStock: number; minStock: number }[], phoneNumber?: string): void {
    const message = this.generateStockAlert(lowStockItems);
    this.shareViaWhatsApp(message, phoneNumber);
  }
}

// Export singleton instance
export const whatsappManager = new WhatsAppBusinessManager();

// Helper function to format phone number for Bangladesh
export function formatBangladeshPhone(phone: string): string {
  // Remove all non-digits
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // If starts with 88, keep as is
  if (cleanPhone.startsWith('88')) {
    return cleanPhone;
  }
  
  // If starts with 0, replace with 88
  if (cleanPhone.startsWith('0')) {
    return '88' + cleanPhone;
  }
  
  // If starts with 1 (mobile number), add 880
  if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
    return '88' + cleanPhone;
  }
  
  return cleanPhone;
}