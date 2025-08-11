import { supabase } from './supabase';

// Function to initialize the database with sample data
export async function initializeDatabase() {
  console.log('Initializing database with sample data...');
  
  try {
    // Check if demo user exists
    let { data: demoUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'demo')
      .single();

    // If demo user doesn't exist, create it
    if (!demoUser) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          username: 'demo',
          password: 'demo123',
          shop_name: 'রহিমের দোকান',
          owner_name: 'আব্দুল রহিম',
          phone_number: '01711223344',
          address: 'ঢাকা, বাংলাদেশ'
        })
        .select()
        .single();

      if (userError || !newUser) {
        console.error('Error creating demo user:', userError);
        return;
      }
      
      demoUser = newUser;
      console.log('Demo user created successfully');
    }

    if (!demoUser) {
      console.error('Demo user not found');
      return;
    }

    const userId = demoUser.id;

    // Check if sample data already exists
    const { data: existingCustomers } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingCustomers && existingCustomers.length > 0) {
      console.log('Sample data already exists, skipping initialization');
      return;
    }

    // Create sample customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .insert([
        {
          user_id: userId,
          name: 'করিম সাহেব',
          phone_number: '01711111111',
          address: 'গুলশান, ঢাকা',
          total_credit: 1500.00
        },
        {
          user_id: userId,
          name: 'ফাতেমা খাতুন',
          phone_number: '01722222222',
          address: 'ধানমন্ডি, ঢাকা',
          total_credit: 800.00
        },
        {
          user_id: userId,
          name: 'রহমান সাহেব',
          phone_number: '01733333333',
          address: 'উত্তরা, ঢাকা',
          total_credit: 0.00
        }
      ])
      .select();

    if (customersError) {
      console.error('Error creating customers:', customersError);
      return;
    }

    // Create sample products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert([
        {
          user_id: userId,
          name: 'চাল (মিনিকেট)',
          category: 'খাদ্য',
          unit: 'কেজি',
          buying_price: 45.00,
          selling_price: 50.00,
          current_stock: 100,
          min_stock_level: 20
        },
        {
          user_id: userId,
          name: 'ডাল (মসুর)',
          category: 'খাদ্য',
          unit: 'কেজি',
          buying_price: 80.00,
          selling_price: 90.00,
          current_stock: 50,
          min_stock_level: 10
        },
        {
          user_id: userId,
          name: 'তেল (সোনালী)',
          category: 'খাদ্য',
          unit: 'লিটার',
          buying_price: 140.00,
          selling_price: 150.00,
          current_stock: 5, // Low stock for demo
          min_stock_level: 10
        },
        {
          user_id: userId,
          name: 'চিনি',
          category: 'খাদ্য',
          unit: 'কেজি',
          buying_price: 55.00,
          selling_price: 60.00,
          current_stock: 75,
          min_stock_level: 15
        },
        {
          user_id: userId,
          name: 'পেঁয়াজ',
          category: 'সবজি',
          unit: 'কেজি',
          buying_price: 25.00,
          selling_price: 30.00,
          current_stock: 3, // Low stock for demo
          min_stock_level: 20
        }
      ])
      .select();

    if (productsError) {
      console.error('Error creating products:', productsError);
      return;
    }

    // Create sample sales
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .insert([
        {
          user_id: userId,
          customer_id: customers?.[0]?.id,
          customer_name: 'করিম সাহেব',
          total_amount: 500.00,
          paid_amount: 300.00,
          due_amount: 200.00,
          payment_method: 'নগদ',
          items: [
            {
              name: 'চাল (মিনিকেট)',
              quantity: 10,
              price: 50.00,
              total: 500.00
            }
          ]
        },
        {
          user_id: userId,
          customer_id: customers?.[1]?.id,
          customer_name: 'ফাতেমা খাতুন',
          total_amount: 270.00,
          paid_amount: 270.00,
          due_amount: 0.00,
          payment_method: 'নগদ',
          items: [
            {
              name: 'ডাল (মসুর)',
              quantity: 3,
              price: 90.00,
              total: 270.00
            }
          ]
        },
        {
          user_id: userId,
          customer_id: customers?.[2]?.id,
          customer_name: 'রহমান সাহেব',
          total_amount: 450.00,
          paid_amount: 450.00,
          due_amount: 0.00,
          payment_method: 'বিকাশ',
          items: [
            {
              name: 'তেল (সোনালী)',
              quantity: 3,
              price: 150.00,
              total: 450.00
            }
          ]
        }
      ])
      .select();

    if (salesError) {
      console.error('Error creating sales:', salesError);
      return;
    }

    // Create sample expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: userId,
          description: 'দোকান ভাড়া',
          amount: 5000.00,
          category: 'ভাড়া'
        },
        {
          user_id: userId,
          description: 'বিদ্যুৎ বিল',
          amount: 800.00,
          category: 'ইউটিলিটি'
        },
        {
          user_id: userId,
          description: 'পরিবহন খরচ',
          amount: 300.00,
          category: 'পরিবহন'
        },
        {
          user_id: userId,
          description: 'মোবাইল রিচার্জ',
          amount: 200.00,
          category: 'যোগাযোগ'
        }
      ]);

    if (expensesError) {
      console.error('Error creating expenses:', expensesError);
      return;
    }

    console.log('Database initialized successfully with sample data!');
    
    return {
      user: demoUser,
      customers: customers?.length || 0,
      products: products?.length || 0,
      sales: sales?.length || 0,
      expenses: expenses?.length || 0
    };

  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Function to check if tables exist and are accessible
export async function checkDatabaseStatus() {
  try {
    // Try to query each table to check if they exist and are accessible
    const checks = await Promise.allSettled([
      supabase.from('users').select('id').limit(1),
      supabase.from('customers').select('id').limit(1),
      supabase.from('products').select('id').limit(1),
      supabase.from('sales').select('id').limit(1),
      supabase.from('expenses').select('id').limit(1),
      supabase.from('collections').select('id').limit(1)
    ]);

    const tableStatus = {
      users: checks[0].status === 'fulfilled',
      customers: checks[1].status === 'fulfilled',
      products: checks[2].status === 'fulfilled',
      sales: checks[3].status === 'fulfilled',
      expenses: checks[4].status === 'fulfilled',
      collections: checks[5].status === 'fulfilled'
    };

    console.log('Database table status:', tableStatus);
    return tableStatus;
  } catch (error) {
    console.error('Error checking database status:', error);
    return null;
  }
}