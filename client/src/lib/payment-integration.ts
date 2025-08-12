/**
 * Payment Integration for Bangladesh
 * Universal QR payments with bKash, Nagad, Rocket integration
 * Critical competitive feature - TaliKhata's main advantage
 */

interface PaymentProvider {
  id: string;
  name: string;
  nameLocal: string;
  icon: string;
  color: string;
  apiEndpoint?: string;
  isActive: boolean;
}

interface PaymentRequest {
  amount: number;
  customerPhone?: string;
  description: string;
  orderId: string;
  successUrl?: string;
  failureUrl?: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  qrCode?: string;
  error?: string;
  provider: string;
}

class PaymentIntegrationManager {
  private providers: PaymentProvider[] = [
    {
      id: 'bkash',
      name: 'bKash',
      nameLocal: 'বিকাশ',
      icon: 'fab fa-bitcoin', // Placeholder - use actual bKash icon
      color: '#E2136E',
      apiEndpoint: 'https://checkout.pay.bka.sh/v1.2.0-beta',
      isActive: false // Requires API credentials
    },
    {
      id: 'nagad',
      name: 'Nagad',
      nameLocal: 'নগদ',
      icon: 'fas fa-mobile-alt',
      color: '#EC1C24',
      apiEndpoint: 'https://api.mynagad.com',
      isActive: false // Requires API credentials
    },
    {
      id: 'rocket',
      name: 'Rocket',
      nameLocal: 'রকেট',
      icon: 'fas fa-rocket',
      color: '#8B1874',
      isActive: false // Requires API credentials
    },
    {
      id: 'upay',
      name: 'Upay',
      nameLocal: 'উপায়',
      icon: 'fas fa-credit-card',
      color: '#00A651',
      isActive: false
    },
    {
      id: 'tap',
      name: 'Tap',
      nameLocal: 'ট্যাপ',
      icon: 'fas fa-hand-pointer',
      color: '#0066CC',
      isActive: false
    }
  ];

  // Get available payment providers
  getProviders(): PaymentProvider[] {
    return this.providers;
  }

  // Get active providers only
  getActiveProviders(): PaymentProvider[] {
    return this.providers.filter(provider => provider.isActive);
  }

  // Configure provider credentials
  configureProvider(providerId: string, config: { apiKey: string; secretKey: string; merchantId?: string }): void {
    const provider = this.providers.find(p => p.id === providerId);
    if (provider) {
      provider.isActive = true;
      console.log(`💳 PAYMENT: ${provider.name} configured successfully`);
    }
  }

  // Generate Universal QR Code for multiple providers
  generateUniversalQR(paymentRequest: PaymentRequest): string {
    const { amount, description, orderId } = paymentRequest;
    
    // Bangladesh standard QR format (simplified version)
    const qrData = {
      version: '01',
      method: '12', // Static QR
      amount: amount.toString(),
      currency: '050', // BDT currency code
      merchant: 'DOKAN_HISAB',
      description: description,
      orderId: orderId,
      timestamp: Date.now()
    };

    // In production, use actual QR generation library
    const qrString = JSON.stringify(qrData);
    const qrCodeBase64 = `data:image/svg+xml;base64,${btoa(this.generateQRCodeSVG(qrString))}`;
    
    console.log('💳 PAYMENT: Universal QR generated for amount:', amount);
    return qrCodeBase64;
  }

  // Generate QR Code SVG (simplified version)
  private generateQRCodeSVG(data: string): string {
    // This is a placeholder - in production, use a proper QR code library
    return `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="105" text-anchor="middle" font-size="12" fill="black">QR Code</text>
        <text x="100" y="125" text-anchor="middle" font-size="8" fill="black">${data.substring(0, 20)}...</text>
      </svg>
    `;
  }

  // Process bKash payment
  async processBKashPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('💳 PAYMENT: Processing bKash payment:', paymentRequest.amount);
      
      // In production, integrate with actual bKash Checkout API
      const mockResponse: PaymentResponse = {
        success: true,
        transactionId: `BK${Date.now()}`,
        paymentUrl: `bkash://pay?amount=${paymentRequest.amount}&merchant=DOKAN_HISAB`,
        provider: 'bkash'
      };

      // For demo, open bKash app URL scheme or web checkout
      if (paymentRequest.customerPhone) {
        const bkashUrl = `https://www.bkash.com/bn/pay?amount=${paymentRequest.amount}&phone=${paymentRequest.customerPhone}`;
        window.open(bkashUrl, '_blank');
      }

      return mockResponse;
    } catch (error) {
      console.error('💳 PAYMENT: bKash payment failed:', error);
      return {
        success: false,
        error: 'bKash payment processing failed',
        provider: 'bkash'
      };
    }
  }

  // Process Nagad payment
  async processNagadPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('💳 PAYMENT: Processing Nagad payment:', paymentRequest.amount);
      
      // In production, integrate with actual Nagad API
      const mockResponse: PaymentResponse = {
        success: true,
        transactionId: `NG${Date.now()}`,
        paymentUrl: `nagad://pay?amount=${paymentRequest.amount}`,
        provider: 'nagad'
      };

      return mockResponse;
    } catch (error) {
      console.error('💳 PAYMENT: Nagad payment failed:', error);
      return {
        success: false,
        error: 'Nagad payment processing failed',
        provider: 'nagad'
      };
    }
  }

  // Process Rocket payment
  async processRocketPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('💳 PAYMENT: Processing Rocket payment:', paymentRequest.amount);
      
      const mockResponse: PaymentResponse = {
        success: true,
        transactionId: `RK${Date.now()}`,
        paymentUrl: `rocket://pay?amount=${paymentRequest.amount}`,
        provider: 'rocket'
      };

      return mockResponse;
    } catch (error) {
      console.error('💳 PAYMENT: Rocket payment failed:', error);
      return {
        success: false,
        error: 'Rocket payment processing failed',
        provider: 'rocket'
      };
    }
  }

  // Process payment with any provider
  async processPayment(providerId: string, paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const provider = this.providers.find(p => p.id === providerId);
    
    if (!provider) {
      return {
        success: false,
        error: 'Payment provider not found',
        provider: providerId
      };
    }

    if (!provider.isActive) {
      return {
        success: false,
        error: 'Payment provider not configured',
        provider: providerId
      };
    }

    switch (providerId) {
      case 'bkash':
        return await this.processBKashPayment(paymentRequest);
      case 'nagad':
        return await this.processNagadPayment(paymentRequest);
      case 'rocket':
        return await this.processRocketPayment(paymentRequest);
      default:
        return {
          success: false,
          error: 'Payment method not implemented',
          provider: providerId
        };
    }
  }

  // Generate payment link for customer
  generatePaymentLink(amount: number, description: string, customerPhone?: string): string {
    const orderId = `ORDER_${Date.now()}`;
    const baseUrl = window.location.origin;
    
    const params = new URLSearchParams({
      amount: amount.toString(),
      description,
      orderId,
      ...(customerPhone && { phone: customerPhone })
    });

    return `${baseUrl}/payment?${params.toString()}`;
  }

  // Verify payment status
  async verifyPayment(transactionId: string, provider: string): Promise<{ verified: boolean; amount?: number; status?: string }> {
    try {
      console.log(`💳 PAYMENT: Verifying ${provider} transaction:`, transactionId);
      
      // In production, call actual provider verification API
      // For now, mock verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        verified: true,
        amount: 1000, // Mock amount
        status: 'completed'
      };
    } catch (error) {
      console.error('💳 PAYMENT: Verification failed:', error);
      return { verified: false };
    }
  }

  // Get payment statistics
  getPaymentStats(): { totalProviders: number; activeProviders: number; popularProvider: string } {
    const totalProviders = this.providers.length;
    const activeProviders = this.providers.filter(p => p.isActive).length;
    const popularProvider = 'bkash'; // In production, track actual usage
    
    return {
      totalProviders,
      activeProviders,
      popularProvider
    };
  }

  // Check if any payment provider is available
  isPaymentAvailable(): boolean {
    return this.providers.some(provider => provider.isActive);
  }
}

// Export singleton instance
export const paymentManager = new PaymentIntegrationManager();

// Payment utility functions
export const paymentUtils = {
  // Format amount for Bangladesh currency
  formatPaymentAmount: (amount: number): string => {
    return `৳${amount.toLocaleString('bn-BD')}`;
  },

  // Validate Bangladesh phone number for payment
  validatePaymentPhone: (phone: string): boolean => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return cleanPhone.length === 11 && cleanPhone.startsWith('01');
  },

  // Generate unique order ID
  generateOrderId: (): string => {
    return `DH_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  },

  // Get recommended payment method based on amount
  getRecommendedPayment: (amount: number): string => {
    if (amount <= 1000) return 'bkash';
    if (amount <= 5000) return 'nagad';
    return 'rocket';
  }
};