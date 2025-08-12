-- Enhanced Database Schema for Multi-tenant Dokan Hisab with Authentication
-- This SQL should be run in Supabase SQL Editor to set up the authentication-ready schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  business_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  address TEXT,
  business_type VARCHAR(50) DEFAULT 'retail',
  business_category VARCHAR(50),
  tax_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_name VARCHAR(50) NOT NULL,
  plan_name_local VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'pending', 'cancelled', 'expired', 'trial')),
  price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BDT',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_features table
CREATE TABLE IF NOT EXISTS public.subscription_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name VARCHAR(50) NOT NULL,
  feature_name VARCHAR(100) NOT NULL,
  feature_value TEXT,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert subscription features for different plans
INSERT INTO public.subscription_features (plan_name, feature_name, feature_value, is_enabled) VALUES
-- Free Trial Features
('free_trial', 'max_customers', '100', true),
('free_trial', 'max_products', '500', true),
('free_trial', 'basic_inventory', 'true', true),
('free_trial', 'basic_reports', 'true', true),
('free_trial', 'mobile_app', 'true', true),
('free_trial', 'data_backup', 'true', true),

-- Basic Plan Features
('basic', 'max_customers', '500', true),
('basic', 'max_products', '2000', true),
('basic', 'advanced_inventory', 'true', true),
('basic', 'sms_notifications', 'true', true),
('basic', 'thermal_printer', 'true', true),
('basic', 'customer_credit', 'true', true),
('basic', 'data_sync', 'true', true),

-- Professional Plan Features
('pro', 'max_customers', 'unlimited', true),
('pro', 'max_products', 'unlimited', true),
('pro', 'advanced_analytics', 'true', true),
('pro', 'whatsapp_integration', 'true', true),
('pro', 'qr_payments', 'true', true),
('pro', 'loyalty_program', 'true', true),
('pro', 'multi_location', 'true', true),
('pro', 'priority_support', 'true', true),

-- Enterprise Plan Features
('enterprise', 'max_customers', 'unlimited', true),
('enterprise', 'max_products', 'unlimited', true),
('enterprise', 'ai_insights', 'true', true),
('enterprise', 'custom_integrations', 'true', true),
('enterprise', 'dedicated_manager', 'true', true),
('enterprise', 'white_label', 'true', true),
('enterprise', 'phone_support', 'true', true),
('enterprise', 'custom_training', 'true', true);

-- Create user_sessions table for better session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing tables to ensure proper user_id references
-- (These ALTER statements will only work if the tables already exist)

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Business data policies (customers, products, sales, etc.)
CREATE POLICY "Users can manage own customers" ON public.customers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own products" ON public.products
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sales" ON public.sales
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own collections" ON public.collections
  FOR ALL USING (auth.uid() = user_id);

-- Advanced features policies
CREATE POLICY "Users can manage own loyalty points" ON public.loyalty_points
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own suppliers" ON public.suppliers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check subscription features
CREATE OR REPLACE FUNCTION public.check_user_feature(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_feature BOOLEAN := false;
  user_plan TEXT;
BEGIN
  -- Get user's current plan
  SELECT s.plan_name INTO user_plan
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Check if user has the feature
  SELECT sf.is_enabled INTO has_feature
  FROM public.subscription_features sf
  WHERE sf.plan_name = user_plan
    AND sf.feature_name = feature_name
  LIMIT 1;
  
  RETURN COALESCE(has_feature, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's subscription limits
CREATE OR REPLACE FUNCTION public.get_user_limit(user_uuid UUID, limit_name TEXT)
RETURNS TEXT AS $$
DECLARE
  limit_value TEXT;
  user_plan TEXT;
BEGIN
  -- Get user's current plan
  SELECT s.plan_name INTO user_plan
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Get the limit value
  SELECT sf.feature_value INTO limit_value
  FROM public.subscription_features sf
  WHERE sf.plan_name = user_plan
    AND sf.feature_name = limit_name
  LIMIT 1;
  
  RETURN COALESCE(limit_value, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;