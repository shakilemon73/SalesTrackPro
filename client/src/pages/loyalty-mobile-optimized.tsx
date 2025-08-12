import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabaseService, CURRENT_USER_ID } from '@/lib/supabase';
import { formatCurrency, toBengaliNumber, getBengaliDate } from '@/lib/bengali-utils';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, Star, Gift, Trophy, Users, Heart,
  ArrowLeft, Coins, Award, Target, Sparkles,
  TrendingUp, Calendar, Phone, ArrowRight
} from 'lucide-react';

export default function LoyaltyMobileOptimized() {
  const { toast } = useToast();

  // Real data from Supabase
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID, 100),
  });

  // Customer loyalty analysis based on real data
  const loyaltyAnalysis = {
    totalCustomers: customers.length,
    loyalCustomers: customers.filter((c: any) => {
      const customerSales = sales.filter((s: any) => s.customer_name === c.name);
      return customerSales.length >= 3;
    }),
    vipCustomers: customers.filter((c: any) => {
      const customerSales = sales.filter((s: any) => s.customer_name === c.name);
      const totalSpent = customerSales.reduce((sum: number, s: any) => sum + s.total_amount, 0);
      return totalSpent >= 1000;
    }),
    topSpenders: customers
      .map((c: any) => {
        const customerSales = sales.filter((s: any) => s.customer_name === c.name);
        const totalSpent = customerSales.reduce((sum: number, s: any) => sum + s.total_amount, 0);
        const totalOrders = customerSales.length;
        return {
          ...c,
          totalSpent,
          totalOrders,
          loyaltyPoints: Math.floor(totalSpent / 10), // 1 point per 10 taka
          tier: totalSpent >= 2000 ? 'VIP' : totalSpent >= 1000 ? 'Gold' : totalSpent >= 500 ? 'Silver' : 'Bronze'
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
  };

  // Loyalty tiers definition
  const loyaltyTiers = [
    { name: 'Bronze', min: 0, max: 499, color: 'bg-orange-100 text-orange-800', icon: Award },
    { name: 'Silver', min: 500, max: 999, color: 'bg-gray-100 text-gray-800', icon: Star },
    { name: 'Gold', min: 1000, max: 1999, color: 'bg-yellow-100 text-yellow-800', icon: Crown },
    { name: 'VIP', min: 2000, max: Infinity, color: 'bg-purple-100 text-purple-800', icon: Sparkles }
  ];

  const isLoading = customersLoading || salesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 bengali-font">লয়ালটি ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Link to="/customers">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 bengali-font">লয়ালটি প্রোগ্রাম</h1>
            <p className="text-sm text-gray-600 bengali-font">গ্রাহক আনুগত্য ব্যবস্থাপনা</p>
          </div>
          <Crown className="w-6 h-6 text-purple-600" />
        </div>
      </div>

      {/* Loyalty Overview */}
      <div className="p-4 pb-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <Heart className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">মোট গ্রাহক</p>
                <p className="text-xl font-bold">{toBengaliNumber(loyaltyAnalysis.totalCustomers)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">অনুগত গ্রাহক</p>
                <p className="text-xl font-bold">{toBengaliNumber(loyaltyAnalysis.loyalCustomers.length)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Crown className="w-8 h-8 opacity-80" />
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">VIP গ্রাহক</p>
                <p className="text-xl font-bold">{toBengaliNumber(loyaltyAnalysis.vipCustomers.length)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Coins className="w-8 h-8 opacity-80" />
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90 bengali-font">মোট পয়েন্ট</p>
                <p className="text-xl font-bold">
                  {toBengaliNumber(loyaltyAnalysis.topSpenders.reduce((sum, c) => sum + c.loyaltyPoints, 0))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loyalty Tiers Overview */}
        <Card className="bg-white mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg bengali-font flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-600" />
              লয়ালটি টায়ার সিস্টেম
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {loyaltyTiers.map((tier) => {
                const tierCustomers = loyaltyAnalysis.topSpenders.filter(c => c.tier === tier.name);
                const IconComponent = tier.icon;
                
                return (
                  <div key={tier.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${tier.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm bengali-font">{tier.name} টায়ার</p>
                        <p className="text-xs text-gray-600">
                          {formatCurrency(tier.min)} - {tier.max === Infinity ? 'উর্ধ্বে' : formatCurrency(tier.max)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {toBengaliNumber(tierCustomers.length)} জন
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mobile-Friendly Tabs */}
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="customers" className="text-sm bengali-font">গ্রাহক</TabsTrigger>
            <TabsTrigger value="rewards" className="text-sm bengali-font">পুরস্কার</TabsTrigger>
            <TabsTrigger value="programs" className="text-sm bengali-font">প্রোগ্রাম</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-4">
            {/* Top Loyal Customers */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg bengali-font flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                  শীর্ষ অনুগত গ্রাহকবৃন্দ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {loyaltyAnalysis.topSpenders.slice(0, 6).map((customer, index) => {
                    const tierInfo = loyaltyTiers.find(t => t.name === customer.tier);
                    const IconComponent = tierInfo?.icon || Award;
                    
                    return (
                      <div key={customer.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm bengali-font">{customer.name}</p>
                              <p className="text-xs text-gray-600 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {customer.phone}
                              </p>
                            </div>
                          </div>
                          <Badge className={tierInfo?.color || 'bg-gray-100 text-gray-800'}>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {customer.tier}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="text-center">
                            <p className="text-gray-600">মোট কেনাকাটা</p>
                            <p className="font-bold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600">অর্ডার সংখ্যা</p>
                            <p className="font-bold text-blue-600">{toBengaliNumber(customer.totalOrders)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600">পয়েন্ট</p>
                            <p className="font-bold text-purple-600">{toBengaliNumber(customer.loyaltyPoints)}</p>
                          </div>
                        </div>

                        {/* Progress to next tier */}
                        {customer.tier !== 'VIP' && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>পরবর্তী টায়ার</span>
                              <span>
                                {formatCurrency(customer.totalSpent)} / {formatCurrency(loyaltyTiers.find(t => t.name !== customer.tier && t.min > loyaltyTiers.find(ct => ct.name === customer.tier)?.min!)?.min || 2000)}
                              </span>
                            </div>
                            <Progress 
                              value={Math.min((customer.totalSpent / (loyaltyTiers.find(t => t.name !== customer.tier && t.min > loyaltyTiers.find(ct => ct.name === customer.tier)?.min!)?.min || 2000)) * 100, 100)}
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            {/* Available Rewards */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg bengali-font flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-pink-600" />
                  উপলব্ধ পুরস্কারসমূহ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {[
                    { name: '৫% ছাড়', points: 100, tier: 'Bronze', color: 'bg-orange-500' },
                    { name: '১০% ছাড়', points: 200, tier: 'Silver', color: 'bg-gray-500' },
                    { name: '১৫% ছাড় + ফ্রি ডেলিভারি', points: 500, tier: 'Gold', color: 'bg-yellow-500' },
                    { name: 'বিশেষ VIP ছাড় ২০%', points: 1000, tier: 'VIP', color: 'bg-purple-500' }
                  ].map((reward, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${reward.color}`}></div>
                          <p className="font-semibold text-sm bengali-font">{reward.name}</p>
                        </div>
                        <Badge variant="outline" className="bg-purple-50">
                          {reward.tier}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          প্রয়োজনীয় পয়েন্ট: {toBengaliNumber(reward.points)}
                        </span>
                        <Button size="sm" variant="outline" className="text-xs">
                          বিস্তারিত
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-4">
            {/* Loyalty Programs */}
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg bengali-font flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  লয়ালটি প্রোগ্রামসমূহ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm bengali-font">রেফারেল বোনাস</h3>
                      <Badge className="bg-green-100 text-green-800">সক্রিয়</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      নতুন গ্রাহক রেফার করুন এবং ১০০ পয়েন্ট পান!
                    </p>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      <Users className="w-4 h-4 mr-2" />
                      রেফার করুন
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm bengali-font">জন্মদিন অফার</h3>
                      <Badge className="bg-blue-100 text-blue-800">আসছে শীঘ্রই</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      জন্মদিনে পান বিশেষ ২৫% ছাড় এবং ১০০ বোনাস পয়েন্ট!
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      তারিখ সেট করুন
                    </Button>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm bengali-font">মাসিক চ্যালেঞ্জ</h3>
                      <Badge className="bg-purple-100 text-purple-800">নতুন</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      মাসে ৫টি অর্ডার দিন এবং পান ২০০ বোনাস পয়েন্ট!
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Trophy className="w-4 h-4 mr-2" />
                      চ্যালেঞ্জ দেখুন
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/customers">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 rounded-full">
              <Users className="w-4 h-4 mr-2" />
              গ্রাহক দেখুন
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full rounded-full"
            onClick={() => toast({
              title: "লয়ালটি রিপোর্ট!",
              description: "বিস্তারিত লয়ালটি বিশ্লেষণ প্রস্তুত।",
            })}
          >
            <Crown className="w-4 h-4 mr-2" />
            রিপোর্ট দেখুন
          </Button>
        </div>
      </div>

      {/* Bottom Spacing for Navigation */}
      <div className="h-24"></div>
    </div>
  );
}