/**
 * Advanced Analytics & AI Engine
 * Business intelligence beyond what TaliKhata, HishabPati, or Vyapar offer
 * Predictive analytics, customer behavior insights, profit optimization
 */

import { supabaseService, CURRENT_USER_ID } from './supabase';
import { formatCurrency, toBengaliNumber, getBangladeshDateRange } from './bengali-utils';

interface CustomerInsight {
  customerId: string;
  customerName: string;
  totalPurchases: number;
  averageOrderValue: number;
  purchaseFrequency: number; // purchases per month
  lastPurchaseDate: string;
  creditScore: number; // 0-100
  lifetimeValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedActions: string[];
}

interface SalesPattern {
  period: string;
  revenue: number;
  profit: number;
  transactions: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  customerRetention: number;
  averageBasketSize: number;
}

interface ProfitOptimization {
  currentMargin: number;
  optimizedMargin: number;
  potentialIncrease: number;
  recommendations: {
    productId: string;
    productName: string;
    currentPrice: number;
    suggestedPrice: number;
    expectedImpact: number;
    reasoning: string;
  }[];
}

interface BusinessForecast {
  period: 'week' | 'month' | 'quarter';
  predictedRevenue: number;
  predictedProfit: number;
  confidence: number;
  factors: string[];
  seasonalAdjustment: number;
  trendDirection: 'up' | 'down' | 'stable';
}

class AdvancedAnalyticsEngine {
  private analysisCache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  // Analyze customer behavior and generate insights
  async analyzeCustomerBehavior(): Promise<CustomerInsight[]> {
    console.log('🧠 ANALYTICS: Analyzing customer behavior patterns...');
    
    try {
      const customers = await supabaseService.getCustomers(CURRENT_USER_ID);
      const sales = await supabaseService.getSales(CURRENT_USER_ID);
      
      const insights: CustomerInsight[] = [];
      
      for (const customer of customers) {
        const customerSales = sales.filter(sale => sale.customer_id === customer.id);
        
        if (customerSales.length === 0) {
          insights.push(this.createBasicCustomerInsight(customer));
          continue;
        }

        const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.total_amount, 0);
        const averageOrderValue = totalPurchases / customerSales.length;
        
        // Calculate purchase frequency (purchases per month)
        const firstPurchase = new Date(Math.min(...customerSales.map(s => new Date(s.sale_date || s.created_at).getTime())));
        const monthsSinceFirst = Math.max(1, this.getMonthsDifference(firstPurchase, new Date()));
        const purchaseFrequency = customerSales.length / monthsSinceFirst;
        
        const lastPurchaseDate = new Date(Math.max(...customerSales.map(s => new Date(s.sale_date || s.created_at).getTime())));
        
        // Calculate credit score based on payment behavior
        const creditScore = this.calculateCreditScore(customer, customerSales);
        
        // Estimate lifetime value
        const lifetimeValue = this.estimateLifetimeValue(averageOrderValue, purchaseFrequency, creditScore);
        
        // Assess risk level
        const riskLevel = this.assessCustomerRisk(customer, customerSales, creditScore);
        
        // Generate recommended actions
        const recommendedActions = this.generateCustomerRecommendations(customer, {
          totalPurchases,
          averageOrderValue,
          purchaseFrequency,
          creditScore,
          riskLevel,
          daysSinceLastPurchase: Math.floor((Date.now() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
        });

        insights.push({
          customerId: customer.id,
          customerName: customer.name,
          totalPurchases,
          averageOrderValue,
          purchaseFrequency,
          lastPurchaseDate: lastPurchaseDate.toISOString(),
          creditScore,
          lifetimeValue,
          riskLevel,
          recommendedActions
        });
      }
      
      // Sort by lifetime value (highest first)
      insights.sort((a, b) => b.lifetimeValue - a.lifetimeValue);
      
      console.log(`🧠 ANALYTICS: Generated insights for ${insights.length} customers`);
      return insights;
      
    } catch (error) {
      console.error('🧠 ANALYTICS: Customer behavior analysis failed:', error);
      return [];
    }
  }

  // Analyze sales patterns over time
  async analyzeSalesPatterns(periods: number = 12): Promise<SalesPattern[]> {
    console.log(`🧠 ANALYTICS: Analyzing sales patterns for ${periods} periods...`);
    
    try {
      const sales = await supabaseService.getSales(CURRENT_USER_ID);
      const customers = await supabaseService.getCustomers(CURRENT_USER_ID);
      
      const patterns: SalesPattern[] = [];
      const now = new Date();
      
      for (let i = 0; i < periods; i++) {
        const periodStart = new Date(now);
        periodStart.setMonth(periodStart.getMonth() - i - 1);
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(0);
        periodEnd.setHours(23, 59, 59, 999);
        
        const periodSales = sales.filter(sale => {
          const saleDate = new Date(sale.sale_date || sale.created_at);
          return saleDate >= periodStart && saleDate <= periodEnd;
        });
        
        const revenue = periodSales.reduce((sum, sale) => sum + sale.total_amount, 0);
        const profit = this.calculatePeriodProfit(periodSales);
        const transactions = periodSales.length;
        
        const topProducts = this.getTopProducts(periodSales);
        const customerRetention = this.calculateCustomerRetention(periodSales, customers);
        const averageBasketSize = transactions > 0 ? revenue / transactions : 0;
        
        patterns.push({
          period: `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`,
          revenue,
          profit,
          transactions,
          topProducts,
          customerRetention,
          averageBasketSize
        });
      }
      
      patterns.reverse(); // Oldest first
      console.log(`🧠 ANALYTICS: Analyzed ${patterns.length} sales periods`);
      return patterns;
      
    } catch (error) {
      console.error('🧠 ANALYTICS: Sales pattern analysis failed:', error);
      return [];
    }
  }

  // Generate profit optimization recommendations
  async optimizeProfitMargins(): Promise<ProfitOptimization> {
    console.log('🧠 ANALYTICS: Optimizing profit margins...');
    
    try {
      const products = await supabaseService.getProducts(CURRENT_USER_ID);
      const sales = await supabaseService.getSales(CURRENT_USER_ID);
      
      let totalRevenue = 0;
      let totalCost = 0;
      const recommendations = [];
      
      for (const product of products) {
        const productSales = this.getProductSales(sales, product.id);
        const totalSold = productSales.reduce((sum, sale) => sum + this.getProductQuantityFromSale(sale, product.id), 0);
        
        if (totalSold === 0) continue;
        
        const revenue = totalSold * product.selling_price;
        const cost = totalSold * product.purchase_price;
        
        totalRevenue += revenue;
        totalCost += cost;
        
        // Analyze demand elasticity and suggest optimal pricing
        const currentMargin = ((product.selling_price - product.purchase_price) / product.selling_price) * 100;
        const suggestedPrice = this.calculateOptimalPrice(product, productSales);
        const expectedImpact = this.estimatePriceImpact(product, suggestedPrice, totalSold);
        
        if (Math.abs(suggestedPrice - product.selling_price) > 1) {
          recommendations.push({
            productId: product.id,
            productName: product.name,
            currentPrice: product.selling_price,
            suggestedPrice,
            expectedImpact,
            reasoning: this.getPricingReasoning(product, suggestedPrice, currentMargin)
          });
        }
      }
      
      const currentMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
      const optimizedRevenue = totalRevenue + recommendations.reduce((sum, rec) => sum + rec.expectedImpact, 0);
      const optimizedMargin = optimizedRevenue > 0 ? ((optimizedRevenue - totalCost) / optimizedRevenue) * 100 : 0;
      const potentialIncrease = optimizedRevenue - totalRevenue;
      
      console.log(`🧠 ANALYTICS: Generated ${recommendations.length} pricing recommendations`);
      
      return {
        currentMargin,
        optimizedMargin,
        potentialIncrease,
        recommendations
      };
      
    } catch (error) {
      console.error('🧠 ANALYTICS: Profit optimization failed:', error);
      return {
        currentMargin: 0,
        optimizedMargin: 0,
        potentialIncrease: 0,
        recommendations: []
      };
    }
  }

  // Generate business forecasts
  async generateBusinessForecast(period: 'week' | 'month' | 'quarter'): Promise<BusinessForecast> {
    console.log(`🧠 ANALYTICS: Generating ${period} business forecast...`);
    
    try {
      const salesPatterns = await this.analyzeSalesPatterns(period === 'week' ? 12 : period === 'month' ? 12 : 4);
      
      if (salesPatterns.length === 0) {
        return this.createDefaultForecast(period);
      }
      
      // Simple linear regression for trend analysis
      const revenueData = salesPatterns.map((pattern, index) => ({ x: index, y: pattern.revenue }));
      const profitData = salesPatterns.map((pattern, index) => ({ x: index, y: pattern.profit }));
      
      const revenueTrend = this.calculateLinearTrend(revenueData);
      const profitTrend = this.calculateLinearTrend(profitData);
      
      // Predict next period
      const nextPeriodIndex = salesPatterns.length;
      const predictedRevenue = Math.max(0, revenueTrend.slope * nextPeriodIndex + revenueTrend.intercept);
      const predictedProfit = Math.max(0, profitTrend.slope * nextPeriodIndex + profitTrend.intercept);
      
      // Calculate confidence based on trend consistency
      const confidence = this.calculateForecastConfidence(salesPatterns);
      
      // Generate contributing factors
      const factors = this.identifyForecastFactors(salesPatterns);
      
      // Seasonal adjustment (simplified)
      const seasonalAdjustment = this.calculateSeasonalAdjustment(period);
      
      // Determine trend direction
      const trendDirection = revenueTrend.slope > 5 ? 'up' : revenueTrend.slope < -5 ? 'down' : 'stable';
      
      console.log(`🧠 ANALYTICS: ${period} forecast completed with ${confidence}% confidence`);
      
      return {
        period,
        predictedRevenue: predictedRevenue * seasonalAdjustment,
        predictedProfit: predictedProfit * seasonalAdjustment,
        confidence,
        factors,
        seasonalAdjustment,
        trendDirection
      };
      
    } catch (error) {
      console.error('🧠 ANALYTICS: Business forecast failed:', error);
      return this.createDefaultForecast(period);
    }
  }

  // Generate comprehensive business report
  async generateBusinessIntelligenceReport(): Promise<{
    summary: {
      totalCustomers: number;
      highValueCustomers: number;
      atRiskCustomers: number;
      monthlyGrowthRate: number;
      profitOptimizationPotential: number;
    };
    topInsights: string[];
    recommendations: string[];
    alerts: string[];
  }> {
    console.log('🧠 ANALYTICS: Generating comprehensive BI report...');
    
    try {
      const [customerInsights, salesPatterns, profitOptimization] = await Promise.all([
        this.analyzeCustomerBehavior(),
        this.analyzeSalesPatterns(6),
        this.optimizeProfitMargins()
      ]);
      
      // Calculate summary metrics
      const totalCustomers = customerInsights.length;
      const highValueCustomers = customerInsights.filter(c => c.lifetimeValue > 10000).length;
      const atRiskCustomers = customerInsights.filter(c => c.riskLevel === 'high').length;
      
      const monthlyGrowthRate = this.calculateGrowthRate(salesPatterns);
      const profitOptimizationPotential = profitOptimization.potentialIncrease;
      
      // Generate insights
      const topInsights = this.generateTopInsights(customerInsights, salesPatterns, profitOptimization);
      
      // Generate recommendations
      const recommendations = this.generateBusinessRecommendations(customerInsights, salesPatterns, profitOptimization);
      
      // Generate alerts
      const alerts = this.generateBusinessAlerts(customerInsights, salesPatterns);
      
      console.log('🧠 ANALYTICS: BI report generated successfully');
      
      return {
        summary: {
          totalCustomers,
          highValueCustomers,
          atRiskCustomers,
          monthlyGrowthRate,
          profitOptimizationPotential
        },
        topInsights,
        recommendations,
        alerts
      };
      
    } catch (error) {
      console.error('🧠 ANALYTICS: BI report generation failed:', error);
      return {
        summary: {
          totalCustomers: 0,
          highValueCustomers: 0,
          atRiskCustomers: 0,
          monthlyGrowthRate: 0,
          profitOptimizationPotential: 0
        },
        topInsights: [],
        recommendations: [],
        alerts: []
      };
    }
  }

  // Helper methods
  private createBasicCustomerInsight(customer: any): CustomerInsight {
    return {
      customerId: customer.id,
      customerName: customer.name,
      totalPurchases: 0,
      averageOrderValue: 0,
      purchaseFrequency: 0,
      lastPurchaseDate: '',
      creditScore: 50, // neutral
      lifetimeValue: 0,
      riskLevel: 'medium',
      recommendedActions: ['প্রথম কেনাকাটার জন্য উৎসাহিত করুন']
    };
  }

  private getMonthsDifference(date1: Date, date2: Date): number {
    return (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
  }

  private calculateCreditScore(customer: any, sales: any[]): number {
    let score = 50; // Base score
    
    // Payment history
    const totalDue = sales.reduce((sum, sale) => sum + (sale.due_amount || 0), 0);
    const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    
    if (totalSales > 0) {
      const paymentRatio = (totalSales - totalDue) / totalSales;
      score += paymentRatio * 30; // Up to 30 points for good payment
    }
    
    // Customer credit
    if (customer.total_credit && parseFloat(customer.total_credit) > 0) {
      score -= 20; // Penalty for existing credit
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private estimateLifetimeValue(averageOrderValue: number, purchaseFrequency: number, creditScore: number): number {
    // Simplified CLV calculation: AOV * frequency * months * reliability factor
    const monthlyValue = averageOrderValue * purchaseFrequency;
    const estimatedLifespan = 24; // months
    const reliabilityFactor = creditScore / 100;
    
    return monthlyValue * estimatedLifespan * reliabilityFactor;
  }

  private assessCustomerRisk(customer: any, sales: any[], creditScore: number): 'low' | 'medium' | 'high' {
    if (creditScore >= 70) return 'low';
    if (creditScore >= 40) return 'medium';
    return 'high';
  }

  private generateCustomerRecommendations(customer: any, metrics: any): string[] {
    const recommendations = [];
    
    if (metrics.daysSinceLastPurchase > 30) {
      recommendations.push('দীর্ঘদিনের গ্রাহক - বিশেষ অফার দিন');
    }
    
    if (metrics.creditScore < 40) {
      recommendations.push('ঝুঁকিপূর্ণ গ্রাহক - নগদ পেমেন্ট উৎসাহিত করুন');
    }
    
    if (metrics.averageOrderValue > 1000) {
      recommendations.push('উচ্চ মূল্যের গ্রাহক - প্রিমিয়াম পণ্য অফার করুন');
    }
    
    if (metrics.purchaseFrequency > 2) {
      recommendations.push('নিয়মিত গ্রাহক - লয়ালটি প্রোগ্রামে যুক্ত করুন');
    }
    
    return recommendations.length > 0 ? recommendations : ['নিয়মিত ফলোআপ করুন'];
  }

  private calculatePeriodProfit(sales: any[]): number {
    // Simplified profit calculation
    return sales.reduce((sum, sale) => {
      const revenue = sale.total_amount;
      const estimatedCost = revenue * 0.7; // Assume 30% margin
      return sum + (revenue - estimatedCost);
    }, 0);
  }

  private getTopProducts(sales: any[]): { name: string; quantity: number; revenue: number }[] {
    const productStats = new Map<string, { quantity: number; revenue: number }>();
    
    sales.forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((item: any) => {
          const name = item.productName || 'Unknown Product';
          const quantity = item.quantity || 1;
          const revenue = parseFloat(item.totalPrice || item.unitPrice || '0');
          
          const existing = productStats.get(name) || { quantity: 0, revenue: 0 };
          productStats.set(name, {
            quantity: existing.quantity + quantity,
            revenue: existing.revenue + revenue
          });
        });
      }
    });
    
    return Array.from(productStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private calculateCustomerRetention(sales: any[], customers: any[]): number {
    // Simplified retention calculation
    const uniqueCustomers = new Set(sales.map(sale => sale.customer_id));
    return customers.length > 0 ? (uniqueCustomers.size / customers.length) * 100 : 0;
  }

  private calculateLinearTrend(data: { x: number; y: number }[]): { slope: number; intercept: number } {
    if (data.length < 2) return { slope: 0, intercept: 0 };
    
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  private calculateForecastConfidence(patterns: SalesPattern[]): number {
    if (patterns.length < 3) return 50;
    
    // Calculate variance in growth rates
    const growthRates = [];
    for (let i = 1; i < patterns.length; i++) {
      const rate = patterns[i].revenue > 0 ? 
        ((patterns[i].revenue - patterns[i-1].revenue) / patterns[i-1].revenue) * 100 : 0;
      growthRates.push(rate);
    }
    
    const variance = this.calculateVariance(growthRates);
    const confidence = Math.max(30, Math.min(95, 80 - variance));
    
    return Math.round(confidence);
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  private identifyForecastFactors(patterns: SalesPattern[]): string[] {
    const factors = [];
    
    if (patterns.length >= 3) {
      const recent = patterns.slice(-3);
      const avgRevenue = recent.reduce((sum, p) => sum + p.revenue, 0) / recent.length;
      
      if (avgRevenue > 10000) factors.push('উচ্চ বিক্রয় ভলিউম');
      if (recent.every(p => p.transactions > 0)) factors.push('ধারাবাহিক লেনদেন');
      if (recent.some(p => p.customerRetention > 80)) factors.push('গ্রাহক ধরে রাখার হার ভালো');
    }
    
    return factors.length > 0 ? factors : ['সীমিত ডেটা উপলব্ধ'];
  }

  private calculateSeasonalAdjustment(period: 'week' | 'month' | 'quarter'): number {
    // Simplified seasonal adjustment for Bangladesh market
    const month = new Date().getMonth();
    
    // Higher sales during festivals and shopping seasons
    if (month === 3 || month === 9) return 1.2; // Eid seasons
    if (month === 11) return 1.1; // Winter shopping
    if (month === 6 || month === 7) return 0.9; // Monsoon season
    
    return 1.0;
  }

  private createDefaultForecast(period: 'week' | 'month' | 'quarter'): BusinessForecast {
    return {
      period,
      predictedRevenue: 0,
      predictedProfit: 0,
      confidence: 30,
      factors: ['পর্যাপ্ত ঐতিহাসিক ডেটা নেই'],
      seasonalAdjustment: 1.0,
      trendDirection: 'stable'
    };
  }

  private getProductSales(sales: any[], productId: string): any[] {
    return sales.filter(sale => 
      sale.items && sale.items.some((item: any) => item.productId === productId)
    );
  }

  private getProductQuantityFromSale(sale: any, productId: string): number {
    if (!sale.items) return 0;
    const item = sale.items.find((item: any) => item.productId === productId);
    return item ? item.quantity || 1 : 0;
  }

  private calculateOptimalPrice(product: any, sales: any[]): number {
    // Simplified optimal pricing - in production, use demand elasticity analysis
    const currentMargin = ((product.selling_price - product.purchase_price) / product.selling_price) * 100;
    
    if (currentMargin < 20) {
      return product.selling_price * 1.1; // Increase price
    } else if (currentMargin > 50) {
      return product.selling_price * 0.95; // Decrease price to increase volume
    }
    
    return product.selling_price; // Keep current price
  }

  private estimatePriceImpact(product: any, newPrice: number, historicalVolume: number): number {
    const priceChange = (newPrice - product.selling_price) / product.selling_price;
    const estimatedVolumeChange = -priceChange * 0.5; // Simple elasticity
    const newVolume = historicalVolume * (1 + estimatedVolumeChange);
    
    return (newPrice * newVolume) - (product.selling_price * historicalVolume);
  }

  private getPricingReasoning(product: any, suggestedPrice: number, currentMargin: number): string {
    if (suggestedPrice > product.selling_price) {
      return 'মার্জিন বৃদ্ধির জন্য দাম বাড়ান';
    } else {
      return 'বিক্রয় বৃদ্ধির জন্য দাম কমান';
    }
  }

  private calculateGrowthRate(patterns: SalesPattern[]): number {
    if (patterns.length < 2) return 0;
    
    const recent = patterns.slice(-2);
    if (recent[0].revenue === 0) return 0;
    
    return ((recent[1].revenue - recent[0].revenue) / recent[0].revenue) * 100;
  }

  private generateTopInsights(customerInsights: CustomerInsight[], salesPatterns: SalesPattern[], profitOpt: ProfitOptimization): string[] {
    const insights = [];
    
    const highValueCustomers = customerInsights.filter(c => c.lifetimeValue > 5000).length;
    if (highValueCustomers > 0) {
      insights.push(`${toBengaliNumber(highValueCustomers)}টি উচ্চ মূল্যের গ্রাহক রয়েছে`);
    }
    
    if (profitOpt.potentialIncrease > 1000) {
      insights.push(`মূল্য অপ্টিমাইজেশনে ${formatCurrency(profitOpt.potentialIncrease)} অতিরিক্ত আয় সম্ভব`);
    }
    
    if (salesPatterns.length > 1) {
      const trend = salesPatterns[salesPatterns.length - 1].revenue > salesPatterns[salesPatterns.length - 2].revenue;
      insights.push(trend ? 'বিক্রয় বৃদ্ধি পাচ্ছে' : 'বিক্রয় হ্রাস পাচ্ছে');
    }
    
    return insights.slice(0, 5);
  }

  private generateBusinessRecommendations(customerInsights: CustomerInsight[], salesPatterns: SalesPattern[], profitOpt: ProfitOptimization): string[] {
    const recommendations = [];
    
    const atRiskCustomers = customerInsights.filter(c => c.riskLevel === 'high').length;
    if (atRiskCustomers > 0) {
      recommendations.push(`${toBengaliNumber(atRiskCustomers)}টি ঝুঁকিপূর্ণ গ্রাহকের সাথে যোগাযোগ করুন`);
    }
    
    if (profitOpt.recommendations.length > 0) {
      recommendations.push('প্রোডাক্টের দাম অপ্টিমাইজেশন করুন');
    }
    
    const avgBasket = salesPatterns.length > 0 ? 
      salesPatterns[salesPatterns.length - 1].averageBasketSize : 0;
    if (avgBasket < 500) {
      recommendations.push('গড় কেনাকাটার পরিমাণ বাড়ানোর কৌশল প্রয়োগ করুন');
    }
    
    return recommendations.slice(0, 5);
  }

  private generateBusinessAlerts(customerInsights: CustomerInsight[], salesPatterns: SalesPattern[]): string[] {
    const alerts = [];
    
    const inactiveCustomers = customerInsights.filter(c => {
      const daysSinceLastPurchase = c.lastPurchaseDate ? 
        Math.floor((Date.now() - new Date(c.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)) : 999;
      return daysSinceLastPurchase > 60;
    }).length;
    
    if (inactiveCustomers > 0) {
      alerts.push(`${toBengaliNumber(inactiveCustomers)}টি গ্রাহক দীর্ঘদিন ধরে নিষ্ক্রিয়`);
    }
    
    if (salesPatterns.length >= 2) {
      const recentSales = salesPatterns.slice(-2);
      const decline = recentSales[1].revenue < recentSales[0].revenue * 0.8;
      if (decline) {
        alerts.push('বিক্রয়ে উল্লেখযোগ্য হ্রাস পেয়েছে');
      }
    }
    
    return alerts;
  }
}

// Export singleton instance
export const analyticsEngine = new AdvancedAnalyticsEngine();