// Quick test of Supabase connection
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lkhqdqlryjzalsemofdt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraHFkcWxyeWp6YWxzZW1vZmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjgzOTcsImV4cCI6MjA3MDQwNDM5N30.uyaSNaaUf_hEx6RSqND6a9Unb_IvHKmV6tOLsGFcITc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test customers table
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .limit(3);
    
    if (customerError) {
      console.error('Customers error:', customerError);
    } else {
      console.log('Customers found:', customers.length);
      console.log('Sample customer:', customers[0]);
    }
    
    // Test products table
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    
    if (productError) {
      console.error('Products error:', productError);
    } else {
      console.log('Products found:', products.length);
      console.log('Sample product:', products[0]);
    }
    
    // Test creating a new customer
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert({
        user_id: '11111111-1111-1111-1111-111111111111',
        name: 'টেস্ট গ্রাহক',
        phone_number: '01999999999',
        address: 'টেস্ট ঠিকানা',
        total_credit: 0
      })
      .select();
    
    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('New customer created:', newCustomer[0]);
      
      // Delete the test customer
      await supabase
        .from('customers')
        .delete()
        .eq('id', newCustomer[0].id);
      console.log('Test customer deleted');
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();