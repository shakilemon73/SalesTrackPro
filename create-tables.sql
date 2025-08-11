-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    shop_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone_number TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT,
    address TEXT,
    total_credit NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT NOT NULL,
    buying_price NUMERIC(12, 2) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    current_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL,
    due_amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    items JSONB NOT NULL,
    sale_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT NOT NULL,
    expense_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create collections table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    collection_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert demo user
INSERT INTO users (id, username, password, shop_name, owner_name, phone_number, address) 
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'demo', 
    'demo123', 
    'রহিমের দোকান', 
    'আব্দুল রহিম', 
    '01711223344', 
    'ঢাকা, বাংলাদেশ'
);

-- Insert sample customers
INSERT INTO customers (id, user_id, name, phone_number, address, total_credit) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'করিম সাহেব', '01711111111', 'গুলশান, ঢাকা', 1500.00),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'ফাতেমা খাতুন', '01722222222', 'ধানমন্ডি, ঢাকা', 800.00),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'রহমান সাহেব', '01733333333', 'উত্তরা, ঢাকা', 0.00);

-- Insert sample products
INSERT INTO products (id, user_id, name, category, unit, buying_price, selling_price, current_stock, min_stock_level) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'চাল (মিনিকেট)', 'খাদ্য', 'কেজি', 45.00, 50.00, 100, 20),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'ডাল (মসুর)', 'খাদ্য', 'কেজি', 80.00, 90.00, 50, 10),
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'তেল (সোনালী)', 'খাদ্য', 'লিটার', 140.00, 150.00, 5, 10),
('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'চিনি', 'খাদ্য', 'কেজি', 55.00, 60.00, 75, 15),
('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'পেঁয়াজ', 'সবজি', 'কেজি', 25.00, 30.00, 3, 20);

-- Insert sample sales
INSERT INTO sales (id, user_id, customer_id, customer_name, total_amount, paid_amount, due_amount, payment_method, items) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'করিম সাহেব', 500.00, 300.00, 200.00, 'নগদ', '[{"name":"চাল (মিনিকেট)","quantity":10,"price":50.00,"total":500.00}]'::jsonb),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'ফাতেমা খাতুন', 270.00, 270.00, 0.00, 'নগদ', '[{"name":"ডাল (মসুর)","quantity":3,"price":90.00,"total":270.00}]'::jsonb),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'রহমান সাহেব', 450.00, 450.00, 0.00, 'বিকাশ', '[{"name":"তেল (সোনালী)","quantity":3,"price":150.00,"total":450.00}]'::jsonb);

-- Insert sample expenses
INSERT INTO expenses (id, user_id, description, amount, category) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'দোকান ভাড়া', 5000.00, 'ভাড়া'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'বিদ্যুৎ বিল', 800.00, 'ইউটিলিটি'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'পরিবহন খরচ', 300.00, 'পরিবহন'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', '11111111-1111-1111-1111-111111111111', 'মোবাইল রিচার্জ', 200.00, 'যোগাযোগ');

-- Enable Row Level Security (optional, for future authentication)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

SELECT 'Database setup complete!' as status;