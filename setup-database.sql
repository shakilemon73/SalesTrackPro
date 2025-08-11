-- Create all tables for the Bengali business management app
-- First, enable the uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "username" text UNIQUE NOT NULL,
    "password" text NOT NULL,
    "shop_name" text NOT NULL,
    "owner_name" text NOT NULL,
    "phone_number" text,
    "address" text,
    "created_at" timestamp DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS "customers" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "name" text NOT NULL,
    "phone_number" text,
    "address" text,
    "total_credit" numeric(12, 2) DEFAULT 0,
    "created_at" timestamp DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS "products" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "name" text NOT NULL,
    "category" text,
    "unit" text NOT NULL,
    "buying_price" numeric(12, 2) NOT NULL,
    "selling_price" numeric(12, 2) NOT NULL,
    "current_stock" integer DEFAULT 0,
    "min_stock_level" integer DEFAULT 5,
    "created_at" timestamp DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS "sales" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "customer_id" uuid REFERENCES "customers"("id"),
    "customer_name" text NOT NULL,
    "total_amount" numeric(12, 2) NOT NULL,
    "paid_amount" numeric(12, 2) NOT NULL,
    "due_amount" numeric(12, 2) NOT NULL,
    "payment_method" text NOT NULL,
    "items" jsonb NOT NULL,
    "sale_date" timestamp DEFAULT now(),
    "created_at" timestamp DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS "expenses" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "description" text NOT NULL,
    "amount" numeric(12, 2) NOT NULL,
    "category" text NOT NULL,
    "expense_date" timestamp DEFAULT now(),
    "created_at" timestamp DEFAULT now()
);

-- Collections table
CREATE TABLE IF NOT EXISTS "collections" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "customer_id" uuid NOT NULL REFERENCES "customers"("id"),
    "sale_id" uuid REFERENCES "sales"("id"),
    "amount" numeric(12, 2) NOT NULL,
    "collection_date" timestamp DEFAULT now(),
    "created_at" timestamp DEFAULT now()
);

-- Insert demo user for testing
INSERT INTO "users" (username, password, shop_name, owner_name, phone_number, address) 
VALUES ('demo', 'demo123', 'রহিমের দোকান', 'আব্দুল রহিম', '01711223344', 'ঢাকা, বাংলাদেশ')
ON CONFLICT (username) DO NOTHING;

-- Get the demo user ID for sample data
DO $$
DECLARE
    demo_user_id uuid;
    customer1_id uuid;
    customer2_id uuid;
    product1_id uuid;
    product2_id uuid;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE username = 'demo';
    
    -- Insert sample customers
    INSERT INTO customers (user_id, name, phone_number, address, total_credit) VALUES
    (demo_user_id, 'করিম সাহেব', '01711111111', 'গুলশান, ঢাকা', 1500.00),
    (demo_user_id, 'ফাতেমা খাতুন', '01722222222', 'ধানমন্ডি, ঢাকা', 800.00)
    RETURNING id INTO customer1_id;
    
    -- Insert sample products
    INSERT INTO products (user_id, name, category, unit, buying_price, selling_price, current_stock, min_stock_level) VALUES
    (demo_user_id, 'চাল (মিনিকেট)', 'খাদ্য', 'কেজি', 45.00, 50.00, 100, 20),
    (demo_user_id, 'ডাল (মসুর)', 'খাদ্য', 'কেজি', 80.00, 90.00, 50, 10),
    (demo_user_id, 'তেল (সোনালী)', 'খাদ্য', 'লিটার', 140.00, 150.00, 30, 5),
    (demo_user_id, 'চিনি', 'খাদ্য', 'কেজি', 55.00, 60.00, 75, 15)
    RETURNING id INTO product1_id;
    
    -- Insert sample sales
    INSERT INTO sales (user_id, customer_id, customer_name, total_amount, paid_amount, due_amount, payment_method, items) VALUES
    (demo_user_id, customer1_id, 'করিম সাহেব', 500.00, 300.00, 200.00, 'নগদ', '[{"name":"চাল (মিনিকেট)","quantity":10,"price":50.00,"total":500.00}]'::jsonb),
    (demo_user_id, customer2_id, 'ফাতেমা খাতুন', 270.00, 270.00, 0.00, 'নগদ', '[{"name":"ডাল (মসুর)","quantity":3,"price":90.00,"total":270.00}]'::jsonb);
    
    -- Insert sample expenses
    INSERT INTO expenses (user_id, description, amount, category) VALUES
    (demo_user_id, 'দোকান ভাড়া', 5000.00, 'ভাড়া'),
    (demo_user_id, 'বিদ্যুৎ বিল', 800.00, 'ইউটিলিটি'),
    (demo_user_id, 'পরিবহন খরচ', 300.00, 'পরিবহন');
    
END $$;