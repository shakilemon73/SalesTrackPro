import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  username: string;
  business_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  plan_name_local: string;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  price?: number;
  trial_ends_at?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Load subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.warn('No subscription found for user:', user.id);
      }

      setProfile(profileData);
      setSubscription(subscriptionData);

    } catch (err: any) {
      console.error('Error loading user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>) => {
    if (!user || !profile) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };

    } catch (err: any) {
      console.error('Error updating profile:', err);
      return { data: null, error: err.message };
    }
  };

  const refreshData = () => {
    loadUserData();
  };

  // Helper functions
  const isTrialActive = (): boolean => {
    if (!subscription?.trial_ends_at) return false;
    return new Date(subscription.trial_ends_at) > new Date();
  };

  const getTrialDaysLeft = (): number => {
    if (!subscription?.trial_ends_at) return 0;
    const trialEnd = new Date(subscription.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const canAccessFeature = (featureName: string): boolean => {
    if (!subscription) return false;

    const planFeatures = {
      free_trial: ['basic_inventory', 'basic_sales', 'basic_customers', 'basic_reports'],
      basic: ['basic_inventory', 'basic_sales', 'basic_customers', 'basic_reports', 'sms_notifications', 'thermal_printer'],
      pro: ['all_features'],
      enterprise: ['all_features', 'advanced_ai', 'custom_integrations']
    };

    const userFeatures = planFeatures[subscription.plan_name as keyof typeof planFeatures] || [];
    return userFeatures.includes('all_features') || userFeatures.includes(featureName);
  };

  return {
    profile,
    subscription,
    loading,
    error,
    updateProfile,
    refreshData,
    isTrialActive,
    getTrialDaysLeft,
    canAccessFeature
  };
}