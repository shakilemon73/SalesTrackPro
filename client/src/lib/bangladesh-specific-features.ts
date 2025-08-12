// Bangladesh-specific business features and helpers

export interface BangladeshBusinessCategory {
  id: string;
  name: string;
  nameBengali: string;
  description: string;
  icon: string;
  popular: boolean;
}

// Common business categories in Bangladesh
export const BANGLADESH_BUSINESS_CATEGORIES: BangladeshBusinessCategory[] = [
  {
    id: 'grocery',
    name: 'Grocery Store',
    nameBengali: 'মুদি দোকান',
    description: 'Daily necessities and food items',
    icon: '🛒',
    popular: true
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    nameBengali: 'ফার্মেসি',
    description: 'Medicine and healthcare products',
    icon: '💊',
    popular: true
  },
  {
    id: 'clothing',
    name: 'Clothing Store',
    nameBengali: 'কাপড়ের দোকান',
    description: 'Clothing and fashion items',
    icon: '👕',
    popular: true
  },
  {
    id: 'electronics',
    name: 'Electronics',
    nameBengali: 'ইলেকট্রনিক্স',
    description: 'Electronic devices and accessories',
    icon: '📱',
    popular: true
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    nameBengali: 'রেস্তোরাঁ',
    description: 'Food and beverage service',
    icon: '🍽️',
    popular: true
  },
  {
    id: 'stationery',
    name: 'Stationery',
    nameBengali: 'স্টেশনারি',
    description: 'Books, paper, and office supplies',
    icon: '📚',
    popular: false
  },
  {
    id: 'cosmetics',
    name: 'Cosmetics',
    nameBengali: 'প্রসাধনী',
    description: 'Beauty and personal care products',
    icon: '💄',
    popular: false
  },
  {
    id: 'hardware',
    name: 'Hardware Store',
    nameBengali: 'হার্ডওয়্যার',
    description: 'Tools, construction materials',
    icon: '🔧',
    popular: false
  },
  {
    id: 'mobile_shop',
    name: 'Mobile Shop',
    nameBengali: 'মোবাইল দোকান',
    description: 'Mobile phones and accessories',
    icon: '📞',
    popular: true
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    nameBengali: 'গহনার দোকান',
    description: 'Gold, silver, and fashion jewelry',
    icon: '💍',
    popular: false
  }
];

// Bangladesh currency formatting
export const formatBDT = (amount: number): string => {
  // Format in Bangladeshi Taka with Bengali numerals
  const formatted = new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
  
  return formatted;
};

// Convert numbers to Bengali numerals
export const toBengaliCurrency = (amount: number): string => {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const formatted = amount.toLocaleString('en-IN'); // Indian number system (lakhs, crores)
  
  return formatted.replace(/[0-9]/g, (digit) => bengaliNumerals[parseInt(digit)]) + ' টাকা';
};

// Bangladesh business hours helper
export const getDefaultBusinessHours = () => {
  return {
    saturday: { open: '09:00', close: '22:00', isOpen: true },
    sunday: { open: '09:00', close: '22:00', isOpen: true },
    monday: { open: '09:00', close: '22:00', isOpen: true },
    tuesday: { open: '09:00', close: '22:00', isOpen: true },
    wednesday: { open: '09:00', close: '22:00', isOpen: true },
    thursday: { open: '09:00', close: '22:00', isOpen: true },
    friday: { open: '09:00', close: '22:00', isOpen: true }
  };
};

// Bangladesh national holidays (simplified - major ones)
export const BANGLADESH_HOLIDAYS_2025 = [
  { date: '2025-02-21', name: 'International Mother Language Day', nameBengali: 'আন্তর্জাতিক মাতৃভাষা দিবস' },
  { date: '2025-03-17', name: 'Sheikh Mujibur Rahman\'s Birthday', nameBengali: 'জাতির পিতার জন্মদিন' },
  { date: '2025-03-26', name: 'Independence Day', nameBengali: 'স্বাধীনতা দিবস' },
  { date: '2025-04-14', name: 'Bengali New Year', nameBengali: 'পহেলা বৈশাখ' },
  { date: '2025-05-01', name: 'Labour Day', nameBengali: 'মে দিবস' },
  { date: '2025-08-15', name: 'National Mourning Day', nameBengali: 'জাতীয় শোক দিবস' },
  { date: '2025-12-16', name: 'Victory Day', nameBengali: 'বিজয় দিবস' }
];

// Check if date is a Bangladesh holiday
export const isBangladeshHoliday = (date: Date): boolean => {
  const dateString = date.toISOString().split('T')[0];
  return BANGLADESH_HOLIDAYS_2025.some(holiday => holiday.date === dateString);
};

// Common Bangladesh business terms
export const BUSINESS_TERMS_BENGALI = {
  // Sales terms
  sale: 'বিক্রয়',
  purchase: 'ক্রয়',
  profit: 'লাভ',
  loss: 'ক্ষতি',
  customer: 'ক্রেতা',
  supplier: 'সরবরাহকারী',
  
  // Payment terms
  cash: 'নগদ',
  credit: 'বাকি',
  advance: 'অগ্রিম',
  due: 'বকেয়া',
  discount: 'ছাড়',
  
  // Product terms
  product: 'পণ্য',
  stock: 'স্টক',
  quantity: 'পরিমাণ',
  price: 'দাম',
  cost: 'খরচ',
  
  // Business terms
  business: 'ব্যবসা',
  shop: 'দোকান',
  store: 'স্টোর',
  market: 'বাজার',
  warehouse: 'গুদাম'
};

// Bangladesh mobile banking providers
export const BANGLADESH_MOBILE_BANKING = [
  {
    name: 'bKash',
    nameBengali: 'বিকাশ',
    code: 'bkash',
    color: '#E2136E',
    icon: '💰',
    marketShare: 65,
    supported: true
  },
  {
    name: 'Nagad',
    nameBengali: 'নগদ',
    code: 'nagad',
    color: '#F47C00',
    icon: '💳',
    marketShare: 25,
    supported: true
  },
  {
    name: 'Rocket',
    nameBengali: 'রকেট',
    code: 'rocket',
    color: '#8A2BE2',
    icon: '🚀',
    marketShare: 8,
    supported: true
  },
  {
    name: 'Upay',
    nameBengali: 'উপায়',
    code: 'upay',
    color: '#FF6B35',
    icon: '📱',
    marketShare: 2,
    supported: false
  }
];

// Get popular mobile banking options
export const getPopularPaymentMethods = () => {
  return BANGLADESH_MOBILE_BANKING
    .filter(provider => provider.supported)
    .sort((a, b) => b.marketShare - a.marketShare);
};

// Format phone number for different payment providers
export const formatForPaymentProvider = (phone: string, provider: string): string => {
  // Remove +88 country code for local payment systems
  const localNumber = phone.replace('+88', '');
  
  switch (provider) {
    case 'bkash':
    case 'nagad':
    case 'rocket':
      return localNumber; // Most accept 01XXXXXXXXX format
    default:
      return phone; // Return with country code
  }
};

// Common product units used in Bangladesh
export const BANGLADESH_PRODUCT_UNITS = [
  { value: 'piece', label: 'পিস', labelEn: 'Piece' },
  { value: 'kg', label: 'কেজি', labelEn: 'Kilogram' },
  { value: 'gram', label: 'গ্রাম', labelEn: 'Gram' },
  { value: 'liter', label: 'লিটার', labelEn: 'Liter' },
  { value: 'meter', label: 'মিটার', labelEn: 'Meter' },
  { value: 'box', label: 'বক্স', labelEn: 'Box' },
  { value: 'packet', label: 'প্যাকেট', labelEn: 'Packet' },
  { value: 'bottle', label: 'বোতল', labelEn: 'Bottle' },
  { value: 'pair', label: 'জোড়া', labelEn: 'Pair' },
  { value: 'dozen', label: 'ডজন', labelEn: 'Dozen' }
];

// Get appropriate unit suggestions based on business category
export const getUnitSuggestions = (category: string): typeof BANGLADESH_PRODUCT_UNITS => {
  const unitsByCategory: Record<string, string[]> = {
    grocery: ['piece', 'kg', 'gram', 'liter', 'packet'],
    pharmacy: ['piece', 'bottle', 'box', 'packet'],
    clothing: ['piece', 'pair', 'meter'],
    electronics: ['piece', 'box'],
    restaurant: ['piece', 'kg', 'liter'],
    stationery: ['piece', 'box', 'packet'],
    hardware: ['piece', 'kg', 'meter', 'box'],
    mobile_shop: ['piece', 'box'],
    jewelry: ['piece', 'gram']
  };

  const relevantUnits = unitsByCategory[category] || ['piece'];
  return BANGLADESH_PRODUCT_UNITS.filter(unit => relevantUnits.includes(unit.value));
};