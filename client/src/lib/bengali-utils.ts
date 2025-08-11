// Bengali number conversion
const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  if (num === null || num === undefined || num === '') {
    return '০';
  }
  
  // Handle numbers directly
  if (typeof num === 'number') {
    if (isNaN(num)) return '০';
    return num.toString().split('').map(digit => 
      /\d/.test(digit) ? bengaliNumerals[parseInt(digit)] : digit
    ).join('');
  }
  
  // Handle strings - preserve formatting characters like commas and decimals
  return num.toString().split('').map(char => {
    if (/\d/.test(char)) {
      return bengaliNumerals[parseInt(char)];
    }
    // Keep non-digit characters like commas, decimals, etc.
    return char;
  }).join('');
}

export function toEnglishNumber(bengaliNum: string): string {
  const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return bengaliNum.split('').map(char => {
    const index = bengaliNumerals.indexOf(char);
    return index !== -1 ? englishNumerals[index] : char;
  }).join('');
}

// Bengali date and time
const bengaliMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const bengaliDays = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

export function getBengaliDate(date: Date = new Date()): string {
  // Handle invalid dates
  if (!date || isNaN(date.getTime())) {
    date = new Date();
  }
  const day = toBengaliNumber(date.getDate());
  const month = bengaliMonths[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());
  
  return `${day} ${month}, ${year}`;
}

export function getBengaliTime(date: Date = new Date()): string {
  // Handle invalid dates
  if (!date || isNaN(date.getTime())) {
    date = new Date();
  }
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'অপরাহ্ন' : 'সকাল';
  
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  
  const bengaliHours = toBengaliNumber(hours);
  const bengaliMinutes = toBengaliNumber(minutes.toString().padStart(2, '0'));
  
  return `${period} ${bengaliHours}:${bengaliMinutes}`;
}

export function getBengaliDay(date: Date = new Date()): string {
  return bengaliDays[date.getDay()];
}

// Currency formatting
export function formatCurrency(amount: number | string): string {
  // Handle invalid numbers - but don't be too aggressive
  if (amount === null || amount === undefined) {
    return '০ টাকা';
  }
  
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return '০ টাকা';
  }
  
  const formatted = numAmount.toLocaleString('en-IN');
  return `${toBengaliNumber(formatted)} টাকা`;
}

// Time period helpers
export function getBengaliTimePeriod(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'ভোর';
  if (hour < 12) return 'সকাল';
  if (hour < 17) return 'দুপুর';
  if (hour < 20) return 'বিকাল';
  return 'রাত';
}

// Relative time in Bengali
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'এখনই';
  if (diffInMinutes < 60) return `${toBengaliNumber(diffInMinutes)} মিনিট আগে`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${toBengaliNumber(diffInHours)} ঘন্টা আগে`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${toBengaliNumber(diffInDays)} দিন আগে`;
  
  return getBengaliDate(date);
}

// Validation helpers
export function isValidBengaliPhone(phone: string): boolean {
  // Remove any Bengali numerals and convert to English
  const englishPhone = toEnglishNumber(phone);
  // Check if it's a valid Bangladeshi phone number
  return /^(\+88)?01[3-9]\d{8}$/.test(englishPhone);
}

export function formatBengaliPhone(phone: string): string {
  const englishPhone = toEnglishNumber(phone);
  // Format as +88 01X-XXXX-XXXX
  if (englishPhone.length === 11 && englishPhone.startsWith('01')) {
    const formatted = `+88 ${englishPhone.slice(0, 3)}-${englishPhone.slice(3, 7)}-${englishPhone.slice(7)}`;
    return toBengaliNumber(formatted);
  }
  return toBengaliNumber(phone);
}

// Generate URL slug from customer name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Generate unique slug with number suffix if needed
export const generateUniqueSlug = (name: string, existingCustomers: any[]): string => {
  const baseSlug = generateSlug(name);
  const existingSlugs = existingCustomers.map(customer => customer.slug || generateSlug(customer.name));
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
};
