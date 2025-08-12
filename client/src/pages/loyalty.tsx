/**
 * Loyalty Program Page
 * Customer loyalty management with points, tiers, and rewards
 * Advanced retention features beyond basic competitors
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { loyaltyProgram } from '@/lib/loyalty-program';
import { supabaseService, CURRENT_USER_ID } from '@/lib/supabase';
import { formatCurrency, toBengaliNumber, getBengaliDate } from '@/lib/bengali-utils';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function Loyalty() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerLoyalty, setCustomerLoyalty] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load loyalty program data
  useEffect(() => {
    const loadLoyaltyData = async () => {
      setIsLoading(true);
      try {
        console.log('🏆 LOYALTY PAGE: Loading loyalty program data...');
        
        const [
          loyaltyAnalytics,
          customersData,
          availableRewards,
          tiersList
        ] = await Promise.all([
          loyaltyProgram.getLoyaltyAnalytics(),
          supabaseService.getCustomers(CURRENT_USER_ID),
          loyaltyProgram.getActiveRewards(),
          loyaltyProgram.getTiers()
        ]);

        setAnalytics(loyaltyAnalytics);
        setCustomers(customersData);
        setRewards(availableRewards);
        setTiers(tiersList);

        // Load individual customer loyalty status
        const loyaltyStatuses = [];
        for (const customer of customersData.slice(0, 10)) { // Limit to prevent API overload
          const status = await loyaltyProgram.getCustomerLoyaltyStatus(customer.id);
          if (status) {
            loyaltyStatuses.push({
              ...status,
              customerName: customer.name,
              customerPhone: customer.phone_number
            });
          }
        }
        setCustomerLoyalty(loyaltyStatuses);
        
        console.log('🏆 LOYALTY PAGE: All data loaded successfully');
      } catch (error) {
        console.error('🏆 LOYALTY PAGE: Failed to load data:', error);
        toast({
          title: "ত্রুটি",
          description: "লয়ালটি প্রোগ্রাম ডেটা লোড করতে সমস্যা হয়েছে",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLoyaltyData();
  }, []);

  const handleRedeemReward = async (customerId: string, rewardId: string) => {
    try {
      const result = await loyaltyProgram.redeemReward(customerId, rewardId);
      
      if (result.success) {
        toast({
          title: "রিওয়ার্ড রিডিম সফল!",
          description: result.message
        });
      } else {
        toast({
          title: "রিডিম ব্যর্থ",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "রিওয়ার্ড রিডিম করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const getTierBadgeColor = (tierId: string) => {
    switch (tierId) {
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'bronze': return 'fas fa-medal';
      case 'silver': return 'fas fa-medal';
      case 'gold': return 'fas fa-crown';
      case 'platinum': return 'fas fa-gem';
      default: return 'fas fa-star';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-app">
        <div className="text-center fade-in">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground mb-2 bengali-font">লয়ালটি প্রোগ্রাম লোড হচ্ছে...</h3>
          <p className="text-muted-foreground text-sm">গ্রাহক পুরস্কার তথ্য আনা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 bengali-font flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
                <i className="fas fa-star text-white text-xl"></i>
              </div>
              লয়ালটি প্রোগ্রাম
            </h1>
            <p className="text-muted-foreground bengali-font">গ্রাহক পুরস্কার ও পয়েন্ট ব্যবস্থাপনা</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <i className="fas fa-users mr-2"></i>
              {toBengaliNumber(analytics?.totalMembers || 0)} সদস্য
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              {toBengaliNumber(analytics?.activeMembers || 0)} সক্রিয়
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="bengali-font">সংক্ষিপ্ত</TabsTrigger>
          <TabsTrigger value="customers" className="bengali-font">গ্রাহক</TabsTrigger>
          <TabsTrigger value="rewards" className="bengali-font">পুরস্কার</TabsTrigger>
          <TabsTrigger value="tiers" className="bengali-font">টায়ার</TabsTrigger>
          <TabsTrigger value="analytics" className="bengali-font">অ্যানালিটিক্স</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground bengali-font">মোট সদস্য</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 number-font">
                    {toBengaliNumber(analytics.totalMembers)}
                  </div>
                  <p className="text-sm text-muted-foreground bengali-font mt-1">
                    {toBengaliNumber(analytics.activeMembers)} সক্রিয়
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground bengali-font">পয়েন্ট জারি</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 number-font">
                    {toBengaliNumber(analytics.pointsIssued)}
                  </div>
                  <p className="text-sm text-muted-foreground bengali-font mt-1">
                    {toBengaliNumber(analytics.pointsRedeemed)} রিডিম হয়েছে
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground bengali-font">রিডিম রেট</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 number-font">
                    {analytics.redemptionRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground bengali-font mt-1">
                    গত মাস
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground bengali-font">ধরে রাখার হার</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 number-font">
                    {analytics.retentionRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground bengali-font mt-1">
                    গ্রাহক ধরে রাখা
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tier Distribution */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="bengali-font">টায়ার বিতরণ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.tierDistribution).map(([tierName, count]: [string, any]) => (
                    <div key={tierName} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <i className="fas fa-star text-white text-sm"></i>
                        </div>
                        <span className="font-medium bengali-font">{tierName}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32">
                          <Progress 
                            value={analytics.totalMembers > 0 ? (count / analytics.totalMembers) * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                        <Badge variant="outline" className="min-w-[60px] justify-center">
                          {toBengaliNumber(count)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="bengali-font">গ্রাহক লয়ালটি স্ট্যাটাস</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerLoyalty.map((customer, index) => {
                  const currentTier = tiers.find(t => t.id === customer.currentTier);
                  const nextTier = tiers.find(t => t.minSpending > customer.lifetimeSpending);
                  
                  return (
                    <div key={customer.customerId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg bengali-font">{customer.customerName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {customer.customerPhone}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getTierBadgeColor(customer.currentTier)}>
                            <i className={`${getTierIcon(customer.currentTier)} mr-1`}></i>
                            {currentTier?.nameLocal || 'অজানা'}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {toBengaliNumber(customer.availablePoints)} পয়েন্ট
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">আজীবন কেনাকাটা</p>
                          <p className="font-semibold number-font">{formatCurrency(customer.lifetimeSpending)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">মোট পয়েন্ট</p>
                          <p className="font-semibold text-green-600 number-font">{toBengaliNumber(customer.totalPoints)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">ব্যবহৃত পয়েন্ট</p>
                          <p className="font-semibold text-red-600 number-font">{toBengaliNumber(customer.redeemedPoints)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground bengali-font">ক্রেডিট স্কোর</p>
                          <p className="font-semibold text-blue-600 number-font">{toBengaliNumber(85)}</p>
                        </div>
                      </div>

                      {nextTier && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium bengali-font">
                              {nextTier.nameLocal} টায়ারে উন্নতি
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(nextTier.minSpending - customer.lifetimeSpending)} আরো প্রয়োজন
                            </span>
                          </div>
                          <Progress 
                            value={(customer.lifetimeSpending / nextTier.minSpending) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-600 bengali-font">
                          {customer.availablePoints >= 100 ? 'পয়েন্ট রিডিমের জন্য প্রস্তুত' : 'আরো পয়েন্ট সংগ্রহ করুন'}
                        </p>
                        <Button 
                          size="sm" 
                          variant={customer.availablePoints >= 100 ? 'default' : 'outline'}
                          disabled={customer.availablePoints < 100}
                          className="bengali-font"
                        >
                          পুরস্কার দেখুন
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="bengali-font">উপলব্ধ পুরস্কার</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward, index) => (
                  <div key={reward.id} className="border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold bengali-font">{reward.nameLocal}</h3>
                        <p className="text-sm text-muted-foreground bengali-font">
                          {reward.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                          {toBengaliNumber(reward.pointsCost)} পয়েন্ট
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground bengali-font">মূল্য:</span>
                        <span className="font-semibold">
                          {reward.type === 'discount' ? `${reward.value}% ছাড়` :
                           reward.type === 'cashback' ? formatCurrency(reward.value) :
                           reward.type === 'special_offer' ? 'বিশেষ অফার' : 'উপহার'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-muted-foreground bengali-font">মেয়াদ:</span>
                        <span className="font-semibold">{toBengaliNumber(reward.expiryDays)} দিন</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground bengali-font mb-1">যোগ্য টায়ার:</p>
                      <div className="flex flex-wrap gap-1">
                        {reward.eligibleTiers.map((tierId: string) => {
                          const tier = tiers.find(t => t.id === tierId);
                          return (
                            <Badge key={tierId} variant="secondary" className="text-xs">
                              {tier?.nameLocal || tierId}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full bengali-font"
                      onClick={() => {
                        toast({
                          title: "পুরস্কার নির্বাচিত",
                          description: `${reward.nameLocal} রিডিমের জন্য গ্রাহক নির্বাচন করুন`
                        });
                      }}
                    >
                      রিডিম করুন
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="bengali-font">লয়ালটি টায়ার সিস্টেম</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tiers.map((tier, index) => (
                  <div 
                    key={tier.id} 
                    className={`border-2 rounded-xl p-6 ${
                      tier.id === 'platinum' ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100' :
                      tier.id === 'gold' ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100' :
                      tier.id === 'silver' ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100' :
                      'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div 
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            tier.id === 'platinum' ? 'bg-purple-500' :
                            tier.id === 'gold' ? 'bg-yellow-500' :
                            tier.id === 'silver' ? 'bg-gray-500' : 'bg-orange-500'
                          }`}
                        >
                          <i className={`${getTierIcon(tier.id)} text-white text-xl`}></i>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold bengali-font">{tier.nameLocal}</h3>
                          <p className="text-sm text-muted-foreground">
                            নূন্যতম কেনাকাটা: {formatCurrency(tier.minSpending)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getTierBadgeColor(tier.id)}>
                          {tier.discountPercentage}% ছাড়
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {toBengaliNumber(tier.pointsMultiplier)}x পয়েন্ট
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 bengali-font">সুবিধাসমূহ:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tier.benefits.map((benefit: string, benefitIndex: number) => (
                          <div key={benefitIndex} className="flex items-center space-x-2">
                            <i className="fas fa-check-circle text-green-500 text-sm"></i>
                            <span className="text-sm bengali-font">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {analytics && analytics.tierDistribution[tier.nameLocal] && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium bengali-font">বর্তমান সদস্য:</span>
                          <Badge variant="outline">
                            {toBengaliNumber(analytics.tierDistribution[tier.nameLocal])} জন
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="bengali-font">পয়েন্ট পারফরম্যান্স</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium bengali-font">মোট পয়েন্ট জারি</span>
                      <span className="text-lg font-bold text-green-600 number-font">
                        {toBengaliNumber(analytics.pointsIssued)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium bengali-font">পয়েন্ট রিডিম</span>
                      <span className="text-lg font-bold text-red-600 number-font">
                        {toBengaliNumber(analytics.pointsRedeemed)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium bengali-font">গড় পয়েন্ট প্রতি গ্রাহক</span>
                      <span className="text-lg font-bold text-blue-600 number-font">
                        {analytics.averagePointsPerCustomer.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium bengali-font">রিডিম রেট</span>
                      <span className="text-sm text-muted-foreground">
                        {analytics.redemptionRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={analytics.redemptionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="bengali-font">গ্রাহক ধরে রাখা</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-orange-600 number-font mb-2">
                      {analytics.retentionRate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground bengali-font">
                      গ্রাহক ধরে রাখার হার
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium bengali-font">সক্রিয় সদস্য</span>
                      <span className="font-bold text-blue-600 number-font">
                        {toBengaliNumber(analytics.activeMembers)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium bengali-font">মোট সদস্য</span>
                      <span className="font-bold text-gray-600 number-font">
                        {toBengaliNumber(analytics.totalMembers)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="mt-8 flex justify-center">
        <Link to="/dashboard">
          <Button variant="outline" className="bengali-font">
            <i className="fas fa-arrow-left mr-2"></i>
            ড্যাশবোর্ডে ফিরুন
          </Button>
        </Link>
      </div>
    </div>
  );
}