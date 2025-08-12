/**
 * Customer Loyalty Program System
 * Advanced customer retention features beyond basic competitors
 * Points, rewards, tiers, and automated engagement
 */

import { supabaseService, CURRENT_USER_ID } from './supabase';
import { formatCurrency, toBengaliNumber, getBengaliDate } from './bengali-utils';

interface CustomerTier {
  id: string;
  name: string;
  nameLocal: string;
  minSpending: number;
  benefits: string[];
  discountPercentage: number;
  pointsMultiplier: number;
  color: string;
  icon: string;
}

interface LoyaltyPoints {
  customerId: string;
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  currentTier: string;
  nextTierPoints: number;
  lifetimeSpending: number;
}

interface PointTransaction {
  id: string;
  customerId: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  reason: string;
  saleId?: string;
  timestamp: string;
}

interface Reward {
  id: string;
  name: string;
  nameLocal: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'product' | 'cashback' | 'special_offer';
  value: number;
  isActive: boolean;
  eligibleTiers: string[];
  expiryDays: number;
}

interface LoyaltyAnalytics {
  totalMembers: number;
  activeMembers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  redemptionRate: number;
  averagePointsPerCustomer: number;
  tierDistribution: { [tier: string]: number };
  retentionRate: number;
}

class LoyaltyProgramManager {
  private tiers: CustomerTier[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      nameLocal: 'ব্রোঞ্জ',
      minSpending: 0,
      benefits: ['মৌলিক পয়েন্ট', 'বিশেষ অফারের নোটিফিকেশন'],
      discountPercentage: 2,
      pointsMultiplier: 1,
      color: '#CD7F32',
      icon: 'fas fa-medal'
    },
    {
      id: 'silver',
      name: 'Silver',
      nameLocal: 'রৌপ্য',
      minSpending: 10000,
      benefits: ['দ্বিগুণ পয়েন্ট', '৫% ছাড়', 'প্রাথমিক অ্যাক্সেস'],
      discountPercentage: 5,
      pointsMultiplier: 2,
      color: '#C0C0C0',
      icon: 'fas fa-medal'
    },
    {
      id: 'gold',
      name: 'Gold',
      nameLocal: 'স্বর্ণ',
      minSpending: 25000,
      benefits: ['তিনগুণ পয়েন্ট', '১০% ছাড়', 'বিনামূল্যে ডেলিভারি', 'জন্মদিনের উপহার'],
      discountPercentage: 10,
      pointsMultiplier: 3,
      color: '#FFD700',
      icon: 'fas fa-crown'
    },
    {
      id: 'platinum',
      name: 'Platinum',
      nameLocal: 'প্ল্যাটিনাম',
      minSpending: 50000,
      benefits: ['পাঁচগুণ পয়েন্ট', '১৫% ছাড়', 'VIP সাপোর্ট', 'একচেটিয়া পণ্য অ্যাক্সেস'],
      discountPercentage: 15,
      pointsMultiplier: 5,
      color: '#E5E4E2',
      icon: 'fas fa-gem'
    }
  ];

  private rewards: Reward[] = [
    {
      id: 'discount_5',
      name: '5% Discount',
      nameLocal: '৫% ছাড়',
      description: 'পরবর্তী কেনাকাটায় ৫% ছাড়',
      pointsCost: 100,
      type: 'discount',
      value: 5,
      isActive: true,
      eligibleTiers: ['bronze', 'silver', 'gold', 'platinum'],
      expiryDays: 30
    },
    {
      id: 'discount_10',
      name: '10% Discount',
      nameLocal: '১০% ছাড়',
      description: 'পরবর্তী কেনাকাটায় ১০% ছাড়',
      pointsCost: 200,
      type: 'discount',
      value: 10,
      isActive: true,
      eligibleTiers: ['silver', 'gold', 'platinum'],
      expiryDays: 30
    },
    {
      id: 'cashback_50',
      name: '৳50 Cashback',
      nameLocal: '৫০ টাকা ক্যাশব্যাক',
      description: '৫০ টাকা ক্যাশব্যাক পরবর্তী কেনাকাটায়',
      pointsCost: 250,
      type: 'cashback',
      value: 50,
      isActive: true,
      eligibleTiers: ['gold', 'platinum'],
      expiryDays: 60
    },
    {
      id: 'free_delivery',
      name: 'Free Delivery',
      nameLocal: 'ফ্রি ডেলিভারি',
      description: 'বিনামূল্যে হোম ডেলিভারি',
      pointsCost: 150,
      type: 'special_offer',
      value: 100,
      isActive: true,
      eligibleTiers: ['gold', 'platinum'],
      expiryDays: 45
    }
  ];

  // Calculate customer tier based on lifetime spending
  calculateCustomerTier(lifetimeSpending: number): CustomerTier {
    // Start from highest tier and work down
    for (let i = this.tiers.length - 1; i >= 0; i--) {
      if (lifetimeSpending >= this.tiers[i].minSpending) {
        return this.tiers[i];
      }
    }
    return this.tiers[0]; // Default to bronze
  }

  // Get customer loyalty points and status
  async getCustomerLoyaltyStatus(customerId: string): Promise<LoyaltyPoints | null> {
    try {
      console.log('🏆 LOYALTY: Getting loyalty status for customer:', customerId);
      
      // Get customer's sales history
      const sales = await supabaseService.getSales(CURRENT_USER_ID);
      const customerSales = sales.filter(sale => sale.customer_id === customerId);
      
      if (customerSales.length === 0) {
        return this.createNewLoyaltyStatus(customerId);
      }

      // Calculate lifetime spending
      const lifetimeSpending = customerSales.reduce((sum, sale) => sum + sale.total_amount, 0);
      
      // Determine current tier
      const currentTier = this.calculateCustomerTier(lifetimeSpending);
      
      // Calculate points earned (1 point per taka spent)
      const totalPointsFromSales = Math.floor(lifetimeSpending * currentTier.pointsMultiplier);
      
      // For demo, assume no redemptions yet (in production, track in separate table)
      const redeemedPoints = 0;
      const availablePoints = totalPointsFromSales - redeemedPoints;
      
      // Calculate points needed for next tier
      const nextTier = this.getNextTier(currentTier.id);
      const nextTierPoints = nextTier ? 
        Math.max(0, (nextTier.minSpending - lifetimeSpending) * nextTier.pointsMultiplier) : 0;

      console.log(`🏆 LOYALTY: Customer ${customerId} is ${currentTier.nameLocal} with ${availablePoints} points`);

      return {
        customerId,
        totalPoints: totalPointsFromSales,
        availablePoints,
        redeemedPoints,
        currentTier: currentTier.id,
        nextTierPoints,
        lifetimeSpending
      };

    } catch (error) {
      console.error('🏆 LOYALTY: Failed to get loyalty status:', error);
      return null;
    }
  }

  // Award points for a sale
  async awardPointsForSale(customerId: string, saleId: string, saleAmount: number): Promise<number> {
    try {
      console.log(`🏆 LOYALTY: Awarding points for sale ${saleId}, amount: ${saleAmount}`);
      
      const loyaltyStatus = await this.getCustomerLoyaltyStatus(customerId);
      if (!loyaltyStatus) return 0;

      const currentTier = this.tiers.find(t => t.id === loyaltyStatus.currentTier);
      if (!currentTier) return 0;

      // Calculate points to award (1 point per taka, multiplied by tier multiplier)
      const pointsToAward = Math.floor(saleAmount * currentTier.pointsMultiplier);
      
      // In production, save this to points_transactions table
      console.log(`🏆 LOYALTY: Awarded ${pointsToAward} points to customer ${customerId}`);
      
      return pointsToAward;

    } catch (error) {
      console.error('🏆 LOYALTY: Failed to award points:', error);
      return 0;
    }
  }

  // Redeem points for reward
  async redeemReward(customerId: string, rewardId: string): Promise<{
    success: boolean;
    message: string;
    couponCode?: string;
  }> {
    try {
      console.log(`🏆 LOYALTY: Redeeming reward ${rewardId} for customer ${customerId}`);
      
      const loyaltyStatus = await this.getCustomerLoyaltyStatus(customerId);
      const reward = this.rewards.find(r => r.id === rewardId);
      
      if (!loyaltyStatus || !reward) {
        return { success: false, message: 'Invalid customer or reward' };
      }

      // Check if customer has enough points
      if (loyaltyStatus.availablePoints < reward.pointsCost) {
        return { 
          success: false, 
          message: `অপর্যাপ্ত পয়েন্ট। প্রয়োজন: ${toBengaliNumber(reward.pointsCost)}, আছে: ${toBengaliNumber(loyaltyStatus.availablePoints)}` 
        };
      }

      // Check tier eligibility
      if (!reward.eligibleTiers.includes(loyaltyStatus.currentTier)) {
        return { 
          success: false, 
          message: 'আপনার টায়ারের জন্য এই রিওয়ার্ড উপলব্ধ নয়' 
        };
      }

      // Generate coupon code
      const couponCode = this.generateCouponCode(reward);
      
      // In production, update points balance and create redemption record
      console.log(`🏆 LOYALTY: Reward redeemed successfully. Coupon: ${couponCode}`);
      
      return {
        success: true,
        message: `রিওয়ার্ড সফলভাবে রিডিম হয়েছে! কুপন কোড: ${couponCode}`,
        couponCode
      };

    } catch (error) {
      console.error('🏆 LOYALTY: Reward redemption failed:', error);
      return { success: false, message: 'রিডিমে সমস্যা হয়েছে' };
    }
  }

  // Get available rewards for customer
  async getAvailableRewards(customerId: string): Promise<{
    reward: Reward;
    canRedeem: boolean;
    reasonIfCannot?: string;
  }[]> {
    try {
      const loyaltyStatus = await this.getCustomerLoyaltyStatus(customerId);
      if (!loyaltyStatus) return [];

      return this.rewards
        .filter(reward => reward.isActive)
        .map(reward => {
          let canRedeem = true;
          let reasonIfCannot = '';

          if (loyaltyStatus.availablePoints < reward.pointsCost) {
            canRedeem = false;
            reasonIfCannot = `আরো ${toBengaliNumber(reward.pointsCost - loyaltyStatus.availablePoints)} পয়েন্ট প্রয়োজন`;
          } else if (!reward.eligibleTiers.includes(loyaltyStatus.currentTier)) {
            canRedeem = false;
            reasonIfCannot = 'আপনার টায়ারের জন্য উপলব্ধ নয়';
          }

          return {
            reward,
            canRedeem,
            reasonIfCannot: canRedeem ? undefined : reasonIfCannot
          };
        });

    } catch (error) {
      console.error('🏆 LOYALTY: Failed to get available rewards:', error);
      return [];
    }
  }

  // Get loyalty program analytics
  async getLoyaltyAnalytics(): Promise<LoyaltyAnalytics> {
    try {
      console.log('🏆 LOYALTY: Calculating loyalty program analytics...');
      
      const customers = await supabaseService.getCustomers(CURRENT_USER_ID);
      const sales = await supabaseService.getSales(CURRENT_USER_ID);
      
      let totalMembers = 0;
      let activeMembers = 0; // customers with purchases in last 3 months
      let pointsIssued = 0;
      const tierDistribution: { [tier: string]: number } = {};
      
      // Initialize tier distribution
      this.tiers.forEach(tier => {
        tierDistribution[tier.nameLocal] = 0;
      });

      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      for (const customer of customers) {
        const customerSales = sales.filter(sale => sale.customer_id === customer.id);
        
        if (customerSales.length > 0) {
          totalMembers++;
          
          // Check if active (purchased in last 3 months)
          const recentSales = customerSales.filter(sale => 
            new Date(sale.sale_date || sale.created_at) > threeMonthsAgo
          );
          if (recentSales.length > 0) {
            activeMembers++;
          }

          // Calculate lifetime spending and tier
          const lifetimeSpending = customerSales.reduce((sum, sale) => sum + sale.total_amount, 0);
          const tier = this.calculateCustomerTier(lifetimeSpending);
          
          tierDistribution[tier.nameLocal]++;
          pointsIssued += Math.floor(lifetimeSpending * tier.pointsMultiplier);
        }
      }

      // For demo, assume 10% redemption rate
      const pointsRedeemed = Math.floor(pointsIssued * 0.1);
      const redemptionRate = pointsIssued > 0 ? (pointsRedeemed / pointsIssued) * 100 : 0;
      const averagePointsPerCustomer = totalMembers > 0 ? pointsIssued / totalMembers : 0;
      const retentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

      console.log(`🏆 LOYALTY: Analytics completed - ${totalMembers} members, ${activeMembers} active`);

      return {
        totalMembers,
        activeMembers,
        pointsIssued,
        pointsRedeemed,
        redemptionRate,
        averagePointsPerCustomer,
        tierDistribution,
        retentionRate
      };

    } catch (error) {
      console.error('🏆 LOYALTY: Analytics calculation failed:', error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        pointsIssued: 0,
        pointsRedeemed: 0,
        redemptionRate: 0,
        averagePointsPerCustomer: 0,
        tierDistribution: {},
        retentionRate: 0
      };
    }
  }

  // Get tier progression suggestions
  async getTierProgressionSuggestions(customerId: string): Promise<{
    currentTier: CustomerTier;
    nextTier?: CustomerTier;
    spendingNeeded: number;
    suggestions: string[];
  }> {
    try {
      const loyaltyStatus = await this.getCustomerLoyaltyStatus(customerId);
      if (!loyaltyStatus) {
        return {
          currentTier: this.tiers[0],
          spendingNeeded: 0,
          suggestions: ['লয়ালটি প্রোগ্রামে যোগ দিন']
        };
      }

      const currentTier = this.tiers.find(t => t.id === loyaltyStatus.currentTier) || this.tiers[0];
      const nextTier = this.getNextTier(currentTier.id);
      
      const spendingNeeded = nextTier ? 
        Math.max(0, nextTier.minSpending - loyaltyStatus.lifetimeSpending) : 0;

      const suggestions = this.generateProgressionSuggestions(currentTier, nextTier, spendingNeeded);

      return {
        currentTier,
        nextTier,
        spendingNeeded,
        suggestions
      };

    } catch (error) {
      console.error('🏆 LOYALTY: Tier progression calculation failed:', error);
      return {
        currentTier: this.tiers[0],
        spendingNeeded: 0,
        suggestions: []
      };
    }
  }

  // Helper methods
  private createNewLoyaltyStatus(customerId: string): LoyaltyPoints {
    return {
      customerId,
      totalPoints: 0,
      availablePoints: 0,
      redeemedPoints: 0,
      currentTier: 'bronze',
      nextTierPoints: this.tiers[1]?.minSpending || 0,
      lifetimeSpending: 0
    };
  }

  private getNextTier(currentTierId: string): CustomerTier | undefined {
    const currentIndex = this.tiers.findIndex(tier => tier.id === currentTierId);
    return currentIndex < this.tiers.length - 1 ? this.tiers[currentIndex + 1] : undefined;
  }

  private generateCouponCode(reward: Reward): string {
    const prefix = reward.type === 'discount' ? 'DISC' : 
                   reward.type === 'cashback' ? 'CASH' : 'GIFT';
    const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}${suffix}`;
  }

  private generateProgressionSuggestions(currentTier: CustomerTier, nextTier?: CustomerTier, spendingNeeded?: number): string[] {
    const suggestions = [];

    if (nextTier && spendingNeeded && spendingNeeded > 0) {
      suggestions.push(`${nextTier.nameLocal} টায়ারে পৌঁছতে আরো ${formatCurrency(spendingNeeded)} কেনাকাটা করুন`);
      
      if (spendingNeeded <= 5000) {
        suggestions.push('শীঘ্রই পরবর্তী টায়ারে পৌঁছাতে পারবেন!');
      }
      
      suggestions.push(`${nextTier.nameLocal} টায়ারে ${nextTier.discountPercentage}% ছাড় পাবেন`);
      suggestions.push(`${toBengaliNumber(nextTier.pointsMultiplier)}গুণ পয়েন্ট পাবেন`);
    } else {
      suggestions.push('আপনি সর্বোচ্চ টায়ারে পৌঁছেছেন!');
      suggestions.push('বিশেষ সুবিধা ও অফার উপভোগ করুন');
    }

    return suggestions;
  }

  // Get all tiers
  getTiers(): CustomerTier[] {
    return this.tiers;
  }

  // Get all active rewards
  getActiveRewards(): Reward[] {
    return this.rewards.filter(reward => reward.isActive);
  }
}

// Export singleton instance
export const loyaltyProgram = new LoyaltyProgramManager();