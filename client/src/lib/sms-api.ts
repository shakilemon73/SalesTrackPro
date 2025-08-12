/**
 * SMS Integration for Bangladesh Market
 * Payment reminders and transaction sharing via SMS
 * Competitive feature - all major apps have SMS functionality
 */

import { formatCurrency, toBengaliNumber, getBengaliDate } from './bengali-utils';
import { formatBangladeshPhone } from './whatsapp-business';

interface SMSMessage {
  to: string;
  message: string;
  type: 'due_reminder' | 'payment_confirmation' | 'transaction_receipt' | 'stock_alert';
}

interface SMSConfig {
  provider: 'bulk_sms_bd' | 'ssl_wireless' | 'banglalink' | 'custom';
  apiKey?: string;
  apiUrl?: string;
  senderId?: string;
}

class SMSManager {
  private config: SMSConfig = {
    provider: 'bulk_sms_bd',
    senderId: 'DokanHisab'
  };

  // Configure SMS provider
  setConfig(config: Partial<SMSConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('📱 SMS: Provider configured:', this.config.provider);
  }

  // Generate due reminder SMS in Bengali
  generateDueReminderSMS(customerName: string, dueAmount: number, shopName: string): string {
    return `প্রিয় ${customerName},
আপনার বাকি টাকার পরিমাণ: ${formatCurrency(dueAmount)}
দোকান: ${shopName}
দয়া করে যথাশীঘ্র পরিশোধ করুন।
ধন্যবাদ।

- দোকান হিসাব অ্যাপ`;
  }

  // Generate payment confirmation SMS
  generatePaymentConfirmationSMS(customerName: string, amount: number, method: string, shopName: string): string {
    const date = getBengaliDate();
    
    return `${customerName}, আপনার পেমেন্ট সফল হয়েছে!
পরিমাণ: ${formatCurrency(amount)}
পদ্ধতি: ${method}
তারিখ: ${date}
দোকান: ${shopName}

- দোকান হিসাব অ্যাপ`;
  }

  // Generate transaction receipt SMS
  generateTransactionReceiptSMS(details: {
    customerName: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
    paid: number;
    due: number;
    shopName: string;
  }): string {
    const date = getBengaliDate();
    let itemsList = '';
    
    details.items.slice(0, 3).forEach(item => {
      itemsList += `• ${item.name} x${toBengaliNumber(item.quantity)} = ${formatCurrency(item.price)}\n`;
    });
    
    if (details.items.length > 3) {
      itemsList += `এবং আরো ${toBengaliNumber(details.items.length - 3)}টি পণ্য...\n`;
    }

    return `বিক্রয় রশিদ - ${details.shopName}
তারিখ: ${date}
গ্রাহক: ${details.customerName}

${itemsList}
মোট: ${formatCurrency(details.total)}
পেইড: ${formatCurrency(details.paid)}
${details.due > 0 ? `বাকি: ${formatCurrency(details.due)}` : 'সম্পূর্ণ পরিশোধিত'}

ধন্যবাদ!`;
  }

  // Generate stock alert SMS
  generateStockAlertSMS(lowStockItems: { name: string; currentStock: number }[], shopOwner: string): string {
    let itemsList = '';
    lowStockItems.slice(0, 5).forEach(item => {
      itemsList += `• ${item.name}: ${toBengaliNumber(item.currentStock)}টি\n`;
    });

    return `স্টক সতর্কতা!
${shopOwner}, নিম্নলিখিত পণ্যের স্টক কম:

${itemsList}
দ্রুত স্টক পূরণ করুন।

- দোকান হিসাব অ্যাপ`;
  }

  // Send SMS using configured provider
  async sendSMS(smsData: SMSMessage): Promise<boolean> {
    const formattedPhone = formatBangladeshPhone(smsData.to);
    
    try {
      // For demo purposes, we'll simulate SMS sending
      // In production, integrate with actual SMS providers
      console.log('📱 SMS: Sending SMS to', formattedPhone);
      console.log('📱 SMS: Message type:', smsData.type);
      console.log('📱 SMS: Content:', smsData.message);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just open the default SMS app (mobile devices)
      if (typeof navigator !== 'undefined' && navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
        const smsUrl = `sms:${formattedPhone}?body=${encodeURIComponent(smsData.message)}`;
        window.open(smsUrl, '_self');
      } else {
        // For desktop, show the message content
        alert(`SMS would be sent to ${formattedPhone}:\n\n${smsData.message}`);
      }
      
      console.log('📱 SMS: Message sent successfully');
      return true;
      
    } catch (error) {
      console.error('📱 SMS: Failed to send message:', error);
      return false;
    }
  }

  // Send due reminder
  async sendDueReminder(customerName: string, phone: string, dueAmount: number, shopName: string): Promise<boolean> {
    const message = this.generateDueReminderSMS(customerName, dueAmount, shopName);
    
    return await this.sendSMS({
      to: phone,
      message,
      type: 'due_reminder'
    });
  }

  // Send payment confirmation
  async sendPaymentConfirmation(customerName: string, phone: string, amount: number, method: string, shopName: string): Promise<boolean> {
    const message = this.generatePaymentConfirmationSMS(customerName, amount, method, shopName);
    
    return await this.sendSMS({
      to: phone,
      message,
      type: 'payment_confirmation'
    });
  }

  // Send transaction receipt
  async sendTransactionReceipt(phone: string, transactionDetails: any): Promise<boolean> {
    const message = this.generateTransactionReceiptSMS(transactionDetails);
    
    return await this.sendSMS({
      to: phone,
      message,
      type: 'transaction_receipt'
    });
  }

  // Send stock alert
  async sendStockAlert(phone: string, lowStockItems: any[], shopOwner: string): Promise<boolean> {
    const message = this.generateStockAlertSMS(lowStockItems, shopOwner);
    
    return await this.sendSMS({
      to: phone,
      message,
      type: 'stock_alert'
    });
  }

  // Bulk SMS for multiple customers
  async sendBulkDueReminders(customers: { name: string; phone: string; dueAmount: number }[], shopName: string): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    
    console.log(`📱 SMS: Sending bulk due reminders to ${customers.length} customers`);
    
    for (const customer of customers) {
      try {
        const success = await this.sendDueReminder(customer.name, customer.phone, customer.dueAmount, shopName);
        if (success) {
          sent++;
        } else {
          failed++;
        }
        
        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`📱 SMS: Failed to send to ${customer.name}:`, error);
        failed++;
      }
    }
    
    console.log(`📱 SMS: Bulk send completed - Sent: ${sent}, Failed: ${failed}`);
    return { sent, failed };
  }

  // Check if SMS feature is available
  isAvailable(): boolean {
    return true; // SMS is always available as fallback to native SMS app
  }

  // Get SMS statistics
  getStats(): { provider: string; isConfigured: boolean } {
    return {
      provider: this.config.provider,
      isConfigured: !!(this.config.apiKey && this.config.apiUrl)
    };
  }
}

// Export singleton instance
export const smsManager = new SMSManager();

// Common SMS templates for Bangladesh market
export const smsTemplates = {
  dueReminder: (name: string, amount: number) => 
    `প্রিয় ${name}, আপনার বাকি ${formatCurrency(amount)}। দয়া করে পরিশোধ করুন। ধন্যবাদ।`,
  
  paymentThankYou: (name: string, amount: number) => 
    `${name}, ${formatCurrency(amount)} পেমেন্টের জন্য ধন্যবাদ। আবার আসবেন।`,
  
  stockAlert: (items: string) => 
    `স্টক সতর্কতা! ${items} এর স্টক কম। দ্রুত পূরণ করুন।`,
  
  promotion: (offer: string) => 
    `বিশেষ অফার! ${offer}। আজই আসুন। সীমিত সময়ের জন্য।`
};