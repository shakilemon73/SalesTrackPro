import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Rocket, Star } from 'lucide-react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  nameLocal: string;
  price: number;
  priceLocal: string;
  duration: string;
  durationLocal: string;
  description: string;
  descriptionLocal: string;
  features: string[];
  featuresLocal: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
  trialDays?: number;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'free_trial',
    name: 'Free Trial',
    nameLocal: 'ফ্রি ট্রায়াল',
    price: 0,
    priceLocal: 'বিনামূল্যে',
    duration: '30 days',
    durationLocal: '৩০ দিন',
    description: 'Perfect to get started',
    descriptionLocal: 'শুরু করার জন্য উপযুক্ত',
    features: [
      'Up to 100 customers',
      'Basic inventory management',
      'Sales & expense tracking',
      'Basic reports',
      'Mobile app access'
    ],
    featuresLocal: [
      '১০০টি পর্যন্ত কাস্টমার',
      'বেসিক স্টক ব্যবস্থাপনা',
      'বিক্রয় ও খরচের হিসাব',
      'সাধারণ রিপোর্ট',
      'মোবাইল অ্যাপ ব্যবহার'
    ],
    icon: <Zap className="w-5 h-5" />,
    color: 'text-primary',
    trialDays: 30
  },
  {
    id: 'basic',
    name: 'Basic',
    nameLocal: 'বেসিক',
    price: 299,
    priceLocal: '২৯৯ টাকা',
    duration: 'per month',
    durationLocal: 'প্রতি মাসে',
    description: 'For small businesses',
    descriptionLocal: 'ছোট ব্যবসার জন্য',
    features: [
      'Up to 500 customers',
      'Advanced inventory',
      'Customer credit tracking',
      'SMS notifications',
      'Thermal printer support',
      'Data backup & sync'
    ],
    featuresLocal: [
      '৫০০টি পর্যন্ত কাস্টমার',
      'উন্নত স্টক ব্যবস্থাপনা',
      'কাস্টমার ক্রেডিট ট্র্যাকিং',
      'SMS নোটিফিকেশন',
      'থার্মাল প্রিন্টার সাপোর্ট',
      'ডেটা ব্যাকআপ ও সিংক'
    ],
    icon: <Star className="w-5 h-5" />,
    color: 'text-success'
  },
  {
    id: 'pro',
    name: 'Professional',
    nameLocal: 'প্রফেশনাল',
    price: 599,
    priceLocal: '৫৯৯ টাকা',
    duration: 'per month',
    durationLocal: 'প্রতি মাসে',
    description: 'Most popular choice',
    descriptionLocal: 'সবচেয়ে জনপ্রিয়',
    features: [
      'Unlimited customers',
      'Advanced analytics',
      'WhatsApp integration',
      'QR code payments',
      'Loyalty program',
      'Multi-location support',
      'Priority support'
    ],
    featuresLocal: [
      'সীমাহীন কাস্টমার',
      'উন্নত বিশ্লেষণ',
      'হোয়াটসঅ্যাপ ইন্টিগ্রেশন',
      'QR কোড পেমেন্ট',
      'লয়ালটি প্রোগ্রাম',
      'একাধিক দোকান সাপোর্ট',
      'অগ্রাধিকার সাপোর্ট'
    ],
    icon: <Crown className="w-5 h-5" />,
    color: 'text-warning',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameLocal: 'এন্টারপ্রাইজ',
    price: 1199,
    priceLocal: '১১৯৯ টাকা',
    duration: 'per month',
    durationLocal: 'প্রতি মাসে',
    description: 'For large businesses',
    descriptionLocal: 'বড় ব্যবসার জন্য',
    features: [
      'Everything in Professional',
      'Advanced AI insights',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
      '24/7 phone support',
      'Custom training'
    ],
    featuresLocal: [
      'প্রফেশনালের সব ফিচার',
      'উন্নত AI ইনসাইট',
      'কাস্টম ইন্টিগ্রেশন',
      'ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার',
      'হোয়াইট-লেবেল অপশন',
      '২৪/৭ ফোন সাপোর্ট',
      'কাস্টম ট্রেনিং'
    ],
    icon: <Rocket className="w-5 h-5" />,
    color: 'text-purple-500'
  }
];

export default function SubscriptionSelectMobile() {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleSelectPlan = async (planId: string) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      // For free trial, activate immediately
      if (planId === 'free_trial') {
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            plan_name: plan.name,
            plan_name_local: plan.nameLocal,
            status: 'active',
            trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating subscription:', error);
          return;
        }

        // Redirect to dashboard
        setLocation('/');
        return;
      }

      // For paid plans, create pending subscription and redirect to payment
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_name: plan.name,
          plan_name_local: plan.nameLocal,
          status: 'pending',
          price: plan.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating subscription:', error);
        return;
      }

      // TODO: Implement payment gateway integration
      // For now, redirect to dashboard with trial
      setLocation('/');

    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-md mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-foreground">
            আপনার প্ল্যান নির্বাচন করুন
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            আপনার ব্যবসার প্রয়োজন অনুযায়ী সবচেয়ে ভালো প্ল্যান বেছে নিন।
            যেকোনো সময় পরিবর্তন করতে পারবেন।
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 cursor-pointer border-2 ${
                selectedPlan === plan.id 
                  ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'border-border hover:border-primary/40'
              } ${plan.popular ? 'ring-2 ring-warning/20' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
              data-testid={`plan-${plan.id}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-warning text-warning-foreground text-xs font-medium px-3 py-1">
                  জনপ্রিয়
                </Badge>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${plan.color} bg-current/10 p-2 rounded-lg`}>
                      {plan.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plan.nameLocal}</CardTitle>
                      <CardDescription className="text-xs">
                        {plan.descriptionLocal}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {plan.price === 0 ? (
                        <span className="text-success">ফ্রি</span>
                      ) : (
                        <span>৳{plan.price}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {plan.durationLocal}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2">
                  {plan.featuresLocal.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.featuresLocal.length > 4 && (
                    <div className="text-xs text-muted-foreground pt-1">
                      +{plan.featuresLocal.length - 4} আরো ফিচার
                    </div>
                  )}
                </div>

                {plan.trialDays && (
                  <div className="mt-3 p-2 bg-success/10 rounded-lg">
                    <p className="text-xs text-success font-medium text-center">
                      {plan.trialDays} দিন ফ্রি ট্রায়াল
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => handleSelectPlan(selectedPlan)}
            disabled={loading}
            className="w-full h-12 text-base font-medium"
            data-testid="button-select-plan"
          >
            {loading ? 'প্রক্রিয়া করা হচ্ছে...' : (
              selectedPlan === 'free_trial' ? 'ফ্রি ট্রায়াল শুরু করুন' : 'এই প্ল্যান নিন'
            )}
          </Button>

          {selectedPlan !== 'free_trial' && (
            <Button
              variant="outline"
              onClick={() => handleSelectPlan('free_trial')}
              className="w-full h-10 text-sm"
              data-testid="button-start-trial"
            >
              আগে ফ্রি ট্রায়াল করে দেখুন
            </Button>
          )}
        </div>

        {/* Features Comparison Link */}
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
            onClick={() => setLocation('/pricing')}
          >
            সব ফিচার তুলনা করে দেখুন
          </Button>
        </div>

        {/* Support */}
        <div className="text-center text-xs text-muted-foreground border-t border-border/50 pt-4">
          কোনো প্রশ্ন থাকলে যোগাযোগ করুন:{' '}
          <span className="text-primary font-medium">01700000000</span>
        </div>
      </div>
    </div>
  );
}