/**
 * Smart Inventory Management System
 * AI-powered stock predictions and automated reorder suggestions
 * Advanced feature beyond TaliKhata's basic inventory tracking
 */

import { supabaseService, CURRENT_USER_ID } from './supabase';
import { cacheManager, createCacheKey } from './cache-manager';

interface Product {
  id: string;
  name: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  purchase_price: number;
  selling_price: number;
  category: string;
  supplier?: string;
  last_restocked?: string;
  created_at: string;
}

interface SalesVelocity {
  productId: string;
  productName: string;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: number;
}

interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  recommendedStock: number;
  daysUntilStockout: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: 'reorder_now' | 'reorder_soon' | 'monitor' | 'reduce_orders';
}

interface ReorderSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  suggestedOrderQuantity: number;
  estimatedCost: number;
  reasonCode: string;
  confidenceScore: number;
  expectedDeliveryDays: number;
}

class SmartInventoryManager {
  private salesHistory: any[] = [];
  private products: Product[] = [];
  private lastAnalysisTime: number = 0;

  // Analyze sales velocity for products
  async analyzeSalesVelocity(days: number = 30): Promise<SalesVelocity[]> {
    console.log('📦 INVENTORY: Analyzing sales velocity...');
    
    try {
      // Get sales data for analysis
      const sales = await supabaseService.getSales(CURRENT_USER_ID);
      const products = await supabaseService.getProducts(CURRENT_USER_ID);
      
      const velocities: SalesVelocity[] = [];
      
      for (const product of products) {
        const productSales = this.extractProductSales(sales, product.id);
        const velocity = this.calculateVelocity(productSales, days);
        
        velocities.push({
          productId: product.id,
          productName: product.name,
          dailyAverage: velocity.daily,
          weeklyAverage: velocity.weekly,
          monthlyAverage: velocity.monthly,
          trend: velocity.trend,
          seasonality: velocity.seasonality
        });
      }
      
      console.log(`📦 INVENTORY: Analyzed velocity for ${velocities.length} products`);
      return velocities;
      
    } catch (error) {
      console.error('📦 INVENTORY: Velocity analysis failed:', error);
      return [];
    }
  }

  // Extract product sales from sales data
  private extractProductSales(sales: any[], productId: string): any[] {
    const productSales: any[] = [];
    
    for (const sale of sales) {
      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          if (item.productId === productId) {
            productSales.push({
              date: sale.sale_date || sale.created_at,
              quantity: item.quantity || 1,
              price: parseFloat(item.unitPrice || '0')
            });
          }
        }
      }
    }
    
    return productSales;
  }

  // Calculate sales velocity metrics
  private calculateVelocity(productSales: any[], days: number): {
    daily: number;
    weekly: number;
    monthly: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    seasonality: number;
  } {
    if (productSales.length === 0) {
      return {
        daily: 0,
        weekly: 0,
        monthly: 0,
        trend: 'stable',
        seasonality: 1
      };
    }

    // Calculate totals
    const totalQuantity = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const daily = totalQuantity / Math.max(days, 1);
    const weekly = daily * 7;
    const monthly = daily * 30;

    // Simple trend analysis (compare first half vs second half)
    const midPoint = Math.floor(productSales.length / 2);
    const firstHalf = productSales.slice(0, midPoint);
    const secondHalf = productSales.slice(midPoint);
    
    const firstHalfAvg = firstHalf.length > 0 ? 
      firstHalf.reduce((sum, sale) => sum + sale.quantity, 0) / firstHalf.length : 0;
    const secondHalfAvg = secondHalf.length > 0 ? 
      secondHalf.reduce((sum, sale) => sum + sale.quantity, 0) / secondHalf.length : 0;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondHalfAvg > firstHalfAvg * 1.2) trend = 'increasing';
    else if (secondHalfAvg < firstHalfAvg * 0.8) trend = 'decreasing';

    return {
      daily,
      weekly,
      monthly,
      trend,
      seasonality: 1 // Simplified - in production, analyze seasonal patterns
    };
  }

  // Generate stock alerts based on intelligent analysis
  async generateStockAlerts(): Promise<StockAlert[]> {
    console.log('📦 INVENTORY: Generating smart stock alerts...');
    
    try {
      const products = await supabaseService.getProducts(CURRENT_USER_ID);
      const velocities = await this.analyzeSalesVelocity();
      const alerts: StockAlert[] = [];

      for (const product of products) {
        const velocity = velocities.find(v => v.productId === product.id);
        if (!velocity) continue;

        const daysUntilStockout = velocity.dailyAverage > 0 ? 
          product.current_stock / velocity.dailyAverage : 999;

        let priority: StockAlert['priority'] = 'low';
        let action: StockAlert['action'] = 'monitor';

        if (daysUntilStockout <= 3) {
          priority = 'critical';
          action = 'reorder_now';
        } else if (daysUntilStockout <= 7) {
          priority = 'high';
          action = 'reorder_soon';
        } else if (daysUntilStockout <= 14) {
          priority = 'medium';
          action = 'monitor';
        }

        // Adjust based on trend
        if (velocity.trend === 'increasing' && priority !== 'critical') {
          priority = priority === 'low' ? 'medium' : 'high';
        }

        const recommendedStock = Math.ceil(velocity.dailyAverage * 14); // 2 weeks buffer

        alerts.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.current_stock,
          recommendedStock,
          daysUntilStockout: Math.floor(daysUntilStockout),
          priority,
          action
        });
      }

      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      console.log(`📦 INVENTORY: Generated ${alerts.length} stock alerts`);
      return alerts;

    } catch (error) {
      console.error('📦 INVENTORY: Alert generation failed:', error);
      return [];
    }
  }

  // Generate intelligent reorder suggestions
  async generateReorderSuggestions(): Promise<ReorderSuggestion[]> {
    console.log('📦 INVENTORY: Generating reorder suggestions...');
    
    try {
      const alerts = await this.generateStockAlerts();
      const suggestions: ReorderSuggestion[] = [];

      for (const alert of alerts) {
        if (alert.action === 'reorder_now' || alert.action === 'reorder_soon') {
          const product = await this.getProductById(alert.productId);
          if (!product) continue;

          const suggestedQuantity = this.calculateOptimalOrderQuantity(alert, product);
          const estimatedCost = suggestedQuantity * product.purchase_price;
          
          suggestions.push({
            productId: alert.productId,
            productName: alert.productName,
            currentStock: alert.currentStock,
            suggestedOrderQuantity: suggestedQuantity,
            estimatedCost,
            reasonCode: this.getReasonCode(alert),
            confidenceScore: this.calculateConfidenceScore(alert),
            expectedDeliveryDays: this.estimateDeliveryDays(product)
          });
        }
      }

      console.log(`📦 INVENTORY: Generated ${suggestions.length} reorder suggestions`);
      return suggestions;

    } catch (error) {
      console.error('📦 INVENTORY: Reorder suggestion failed:', error);
      return [];
    }
  }

  // Calculate optimal order quantity
  private calculateOptimalOrderQuantity(alert: StockAlert, product: Product): number {
    // Economic Order Quantity (EOQ) simplified
    const dailyDemand = alert.recommendedStock / 14; // Based on recommended stock
    const leadTimeDays = this.estimateDeliveryDays(product);
    const safetyStock = Math.ceil(dailyDemand * 3); // 3 days safety buffer
    
    const reorderPoint = (dailyDemand * leadTimeDays) + safetyStock;
    const orderQuantity = Math.max(
      reorderPoint - alert.currentStock,
      product.min_stock_level || 10
    );

    return Math.ceil(orderQuantity);
  }

  // Get reason code for reorder
  private getReasonCode(alert: StockAlert): string {
    switch (alert.priority) {
      case 'critical':
        return 'STOCKOUT_IMMINENT';
      case 'high':
        return 'LOW_STOCK_WARNING';
      case 'medium':
        return 'PREVENTIVE_REORDER';
      default:
        return 'ROUTINE_RESTOCK';
    }
  }

  // Calculate confidence score for suggestion
  private calculateConfidenceScore(alert: StockAlert): number {
    let score = 0.5; // Base confidence

    // Adjust based on priority
    switch (alert.priority) {
      case 'critical':
        score += 0.4;
        break;
      case 'high':
        score += 0.3;
        break;
      case 'medium':
        score += 0.2;
        break;
    }

    // Adjust based on data availability (simplified)
    if (alert.daysUntilStockout > 0 && alert.daysUntilStockout < 999) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  // Estimate delivery days
  private estimateDeliveryDays(product: Product): number {
    // Simplified delivery estimation
    switch (product.category?.toLowerCase()) {
      case 'electronics':
        return 5;
      case 'clothing':
        return 3;
      case 'food':
        return 1;
      default:
        return 3;
    }
  }

  // Get product by ID
  private async getProductById(productId: string): Promise<Product | null> {
    try {
      // Use cache if available
      const cacheKey = createCacheKey('product', CURRENT_USER_ID, productId);
      const cached = cacheManager.get<Product>(cacheKey);
      if (cached) return cached;

      // Fetch from products list
      const products = await supabaseService.getProducts(CURRENT_USER_ID);
      const product = products.find(p => p.id === productId);
      
      if (product) {
        cacheManager.set(cacheKey, product, 5 * 60 * 1000); // 5 minutes
      }
      
      return product || null;
    } catch (error) {
      console.error('📦 INVENTORY: Failed to get product:', error);
      return null;
    }
  }

  // Get inventory performance metrics
  async getInventoryMetrics(): Promise<{
    totalProducts: number;
    lowStockCount: number;
    overstockCount: number;
    fastMovingCount: number;
    slowMovingCount: number;
    inventoryValue: number;
    turnoverRate: number;
  }> {
    try {
      const products = await supabaseService.getProducts(CURRENT_USER_ID);
      const velocities = await this.analyzeSalesVelocity();
      
      const totalProducts = products.length;
      let lowStockCount = 0;
      let overstockCount = 0;
      let fastMovingCount = 0;
      let slowMovingCount = 0;
      let inventoryValue = 0;

      for (const product of products) {
        // Calculate inventory value
        inventoryValue += product.current_stock * product.purchase_price;
        
        // Check stock levels
        if (product.current_stock <= product.min_stock_level) {
          lowStockCount++;
        }
        if (product.current_stock >= product.max_stock_level) {
          overstockCount++;
        }

        // Check velocity
        const velocity = velocities.find(v => v.productId === product.id);
        if (velocity) {
          if (velocity.dailyAverage >= 2) {
            fastMovingCount++;
          } else if (velocity.dailyAverage < 0.1) {
            slowMovingCount++;
          }
        }
      }

      // Calculate turnover rate (simplified)
      const turnoverRate = velocities.length > 0 ? 
        velocities.reduce((sum, v) => sum + v.monthlyAverage, 0) / velocities.length : 0;

      return {
        totalProducts,
        lowStockCount,
        overstockCount,
        fastMovingCount,
        slowMovingCount,
        inventoryValue,
        turnoverRate
      };

    } catch (error) {
      console.error('📦 INVENTORY: Metrics calculation failed:', error);
      return {
        totalProducts: 0,
        lowStockCount: 0,
        overstockCount: 0,
        fastMovingCount: 0,
        slowMovingCount: 0,
        inventoryValue: 0,
        turnoverRate: 0
      };
    }
  }

  // Predict future stock needs
  async predictStockNeeds(daysAhead: number = 30): Promise<{
    productId: string;
    productName: string;
    currentStock: number;
    predictedStock: number;
    recommendedAction: string;
  }[]> {
    console.log(`📦 INVENTORY: Predicting stock needs for ${daysAhead} days ahead`);
    
    try {
      const products = await supabaseService.getProducts(CURRENT_USER_ID);
      const velocities = await this.analyzeSalesVelocity();
      const predictions = [];

      for (const product of products) {
        const velocity = velocities.find(v => v.productId === product.id);
        if (!velocity) continue;

        const predictedUsage = velocity.dailyAverage * daysAhead;
        const predictedStock = Math.max(0, product.current_stock - predictedUsage);
        
        let recommendedAction = 'Monitor';
        if (predictedStock <= 0) {
          recommendedAction = 'Critical - Reorder immediately';
        } else if (predictedStock <= product.min_stock_level) {
          recommendedAction = 'Reorder soon';
        } else if (velocity.trend === 'increasing') {
          recommendedAction = 'Consider increasing stock levels';
        }

        predictions.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.current_stock,
          predictedStock: Math.floor(predictedStock),
          recommendedAction
        });
      }

      return predictions;

    } catch (error) {
      console.error('📦 INVENTORY: Stock prediction failed:', error);
      return [];
    }
  }
}

// Export singleton instance
export const smartInventory = new SmartInventoryManager();