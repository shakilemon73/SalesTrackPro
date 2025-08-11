// Seed data for the Bengali business management app
export const seedCustomers = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'করিম সাহেব',
    phone_number: '01711111111',
    address: 'গুলশান, ঢাকা',
    total_credit: '1500.00',
    created_at: new Date()
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'ফাতেমা খাতুন',
    phone_number: '01722222222',
    address: 'ধানমন্ডি, ঢাকা',
    total_credit: '800.00',
    created_at: new Date()
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'রহমান সাহেব',
    phone_number: '01733333333',
    address: 'উত্তরা, ঢাকা',
    total_credit: '0.00',
    created_at: new Date()
  }
];

export const seedProducts = [
  {
    id: '55555555-5555-5555-5555-555555555555',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'চাল (মিনিকেট)',
    category: 'খাদ্য',
    unit: 'কেজি',
    buying_price: '45.00',
    selling_price: '50.00',
    current_stock: 100,
    min_stock_level: 20,
    created_at: new Date()
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'ডাল (মসুর)',
    category: 'খাদ্য',
    unit: 'কেজি',
    buying_price: '80.00',
    selling_price: '90.00',
    current_stock: 50,
    min_stock_level: 10,
    created_at: new Date()
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'তেল (সোনালী)',
    category: 'খাদ্য',
    unit: 'লিটার',
    buying_price: '140.00',
    selling_price: '150.00',
    current_stock: 5, // Low stock for demo
    min_stock_level: 10,
    created_at: new Date()
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'চিনি',
    category: 'খাদ্য',
    unit: 'কেজি',
    buying_price: '55.00',
    selling_price: '60.00',
    current_stock: 75,
    min_stock_level: 15,
    created_at: new Date()
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    user_id: '11111111-1111-1111-1111-111111111111',
    name: 'পেঁয়াজ',
    category: 'সবজি',
    unit: 'কেজি',
    buying_price: '25.00',
    selling_price: '30.00',
    current_stock: 3, // Low stock for demo
    min_stock_level: 20,
    created_at: new Date()
  }
];

export const seedSales = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    user_id: '11111111-1111-1111-1111-111111111111',
    customer_id: '22222222-2222-2222-2222-222222222222',
    customer_name: 'করিম সাহেব',
    total_amount: '500.00',
    paid_amount: '300.00',
    due_amount: '200.00',
    payment_method: 'নগদ',
    items: [
      {
        name: 'চাল (মিনিকেট)',
        quantity: 10,
        price: 50.00,
        total: 500.00
      }
    ],
    sale_date: new Date(),
    created_at: new Date()
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    user_id: '11111111-1111-1111-1111-111111111111',
    customer_id: '33333333-3333-3333-3333-333333333333',
    customer_name: 'ফাতেমা খাতুন',
    total_amount: '270.00',
    paid_amount: '270.00',
    due_amount: '0.00',
    payment_method: 'নগদ',
    items: [
      {
        name: 'ডাল (মসুর)',
        quantity: 3,
        price: 90.00,
        total: 270.00
      }
    ],
    sale_date: new Date(),
    created_at: new Date()
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    user_id: '11111111-1111-1111-1111-111111111111',
    customer_id: '44444444-4444-4444-4444-444444444444',
    customer_name: 'রহমান সাহেব',
    total_amount: '450.00',
    paid_amount: '450.00',
    due_amount: '0.00',
    payment_method: 'বিকাশ',
    items: [
      {
        name: 'তেল (সোনালী)',
        quantity: 3,
        price: 150.00,
        total: 450.00
      }
    ],
    sale_date: new Date(),
    created_at: new Date()
  }
];

export const seedExpenses = [
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    user_id: '11111111-1111-1111-1111-111111111111',
    description: 'দোকান ভাড়া',
    amount: '5000.00',
    category: 'ভাড়া',
    expense_date: new Date(),
    created_at: new Date()
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    user_id: '11111111-1111-1111-1111-111111111111',
    description: 'বিদ্যুৎ বিল',
    amount: '800.00',
    category: 'ইউটিলিটি',
    expense_date: new Date(),
    created_at: new Date()
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    user_id: '11111111-1111-1111-1111-111111111111',
    description: 'পরিবহন খরচ',
    amount: '300.00',
    category: 'পরিবহন',
    expense_date: new Date(),
    created_at: new Date()
  },
  {
    id: 'gggggggg-gggg-gggg-gggg-gggggggggggg',
    user_id: '11111111-1111-1111-1111-111111111111',
    description: 'মোবাইল রিচার্জ',
    amount: '200.00',
    category: 'যোগাযোগ',
    expense_date: new Date(),
    created_at: new Date()
  }
];