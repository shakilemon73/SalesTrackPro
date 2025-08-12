// Bangladesh-specific phone number utilities
// Comprehensive support for all major Bangladesh mobile operators

export interface BangladeshOperator {
  name: string;
  nameBengali: string;
  prefixes: string[];
  color: string;
  marketShare: number; // approximate market share percentage
}

// Major Bangladesh mobile operators with their prefixes
export const BANGLADESH_OPERATORS: BangladeshOperator[] = [
  {
    name: 'Grameenphone',
    nameBengali: 'গ্রামীণফোন',
    prefixes: ['017', '013'],
    color: '#00A651',
    marketShare: 47
  },
  {
    name: 'Robi',
    nameBengali: 'রবি',
    prefixes: ['018'],
    color: '#E60012',
    marketShare: 29
  },
  {
    name: 'Banglalink',
    nameBengali: 'বাংলালিংক',
    prefixes: ['019', '014'],
    color: '#FF6600',
    marketShare: 21
  },
  {
    name: 'Teletalk',
    nameBengali: 'টেলিটক',
    prefixes: ['015'],
    color: '#1F4E79',
    marketShare: 2
  },
  {
    name: 'Airtel',
    nameBengali: 'এয়ারটেল',
    prefixes: ['016'],
    color: '#ED1C24',
    marketShare: 1
  },
  {
    name: 'Citycell', // Legacy operator, still some users
    nameBengali: 'সিটিসেল',
    prefixes: ['011'],
    color: '#0066CC',
    marketShare: 0
  }
];

// Get all valid prefixes
export const getAllValidPrefixes = (): string[] => {
  return BANGLADESH_OPERATORS.flatMap(op => op.prefixes);
};

// Enhanced phone number formatting for Bangladesh
export const formatBangladeshPhone = (phone: string): string => {
  // Remove all non-digit characters except + at the beginning
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove + if it exists and handle the digits
  const digitsOnly = cleaned.replace(/\+/g, '');
  
  // Handle different input formats intelligently
  if (digitsOnly.startsWith('88') && digitsOnly.length === 13) {
    // Already has country code: 8801XXXXXXXXX
    return `+${digitsOnly}`;
  } else if (digitsOnly.startsWith('01') && digitsOnly.length === 11) {
    // Standard Bangladesh format: 01XXXXXXXXX
    return `+88${digitsOnly}`;
  } else if (digitsOnly.startsWith('1') && digitsOnly.length === 10) {
    // Missing leading 0: 1XXXXXXXXX
    return `+880${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('01')) {
    // Ensure it's 01XXXXXXXXX format
    return `+88${digitsOnly}`;
  } else if (digitsOnly.length === 10 && !digitsOnly.startsWith('0')) {
    // Assume missing 01 prefix: XXXXXXXXX
    return `+8801${digitsOnly}`;
  } else if (digitsOnly.length === 9) {
    // Missing 01 prefix: XXXXXXXXX (9 digits)
    return `+8801${digitsOnly}`;
  }
  
  // If it already has +88, validate and return
  if (phone.startsWith('+88') && digitsOnly.length === 13) {
    return phone;
  }
  
  // For any other format, try to intelligently add Bangladesh country code
  if (digitsOnly.length >= 9 && digitsOnly.length <= 11) {
    // Assume it's a Bangladesh number
    if (digitsOnly.startsWith('01')) {
      return `+88${digitsOnly}`;
    } else if (digitsOnly.startsWith('1')) {
      return `+880${digitsOnly}`;
    } else {
      return `+8801${digitsOnly}`;
    }
  }
  
  // Default fallback: add +88 prefix
  return `+88${digitsOnly}`;
};

// Comprehensive validation for Bangladesh phone numbers
export const validateBangladeshPhone = (phone: string): { 
  isValid: boolean; 
  operator?: BangladeshOperator;
  formattedNumber?: string;
  errorMessage?: string;
} => {
  const formatted = formatBangladeshPhone(phone);
  
  // Extract digits after +88
  const digitsAfterCountryCode = formatted.substring(3);
  
  // Must be 11 digits total after +88
  if (digitsAfterCountryCode.length !== 11) {
    return {
      isValid: false,
      errorMessage: 'বাংলাদেশী মোবাইল নম্বর ১১ ডিজিটের হতে হবে (01XXXXXXXXX)'
    };
  }
  
  // Must start with 01
  if (!digitsAfterCountryCode.startsWith('01')) {
    return {
      isValid: false,
      errorMessage: 'বাংলাদেশী মোবাইল নম্বর ০১ দিয়ে শুরু হতে হবে'
    };
  }
  
  // Check operator validity
  const operatorPrefix = digitsAfterCountryCode.substring(0, 3);
  const validPrefixes = getAllValidPrefixes();
  
  if (!validPrefixes.includes(operatorPrefix)) {
    return {
      isValid: false,
      errorMessage: `অবৈধ অপারেটর কোড। সমর্থিত: ${validPrefixes.join(', ')}`
    };
  }
  
  // Find the operator
  const operator = BANGLADESH_OPERATORS.find(op => 
    op.prefixes.includes(operatorPrefix)
  );
  
  return {
    isValid: true,
    operator,
    formattedNumber: formatted
  };
};

// Get operator info from phone number
export const getOperatorInfo = (phone: string): BangladeshOperator | null => {
  const validation = validateBangladeshPhone(phone);
  return validation.operator || null;
};

// Format phone for display (local format)
export const formatPhoneForDisplay = (phone: string): string => {
  const formatted = formatBangladeshPhone(phone);
  // Remove +88 and format as 01XXX-XXXXXX
  const localNumber = formatted.substring(3);
  if (localNumber.length === 11) {
    return `${localNumber.substring(0, 5)}-${localNumber.substring(5)}`;
  }
  return localNumber;
};

// Format phone for SMS/international use
export const formatPhoneForSMS = (phone: string): string => {
  return formatBangladeshPhone(phone);
};

// Validate and suggest corrections
export const validateAndSuggest = (phone: string): {
  isValid: boolean;
  suggestions?: string[];
  operator?: BangladeshOperator;
  errorMessage?: string;
} => {
  const validation = validateBangladeshPhone(phone);
  
  if (validation.isValid) {
    return validation;
  }
  
  // Generate suggestions for common mistakes
  const suggestions: string[] = [];
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Common mistake: missing 0
  if (digitsOnly.length === 10 && digitsOnly.startsWith('1')) {
    suggestions.push(`0${digitsOnly}`);
  }
  
  // Common mistake: extra country code
  if (digitsOnly.startsWith('880') && digitsOnly.length === 13) {
    suggestions.push(digitsOnly.substring(2));
  }
  
  // Common mistake: extra 8
  if (digitsOnly.startsWith('8801') && digitsOnly.length === 14) {
    suggestions.push(digitsOnly.substring(2));
  }
  
  return {
    isValid: false,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    errorMessage: validation.errorMessage
  };
};

// Check if phone number looks like Bangladesh format (loose check)
export const looksLikeBangladeshPhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check common patterns
  return (
    digitsOnly.startsWith('01') && digitsOnly.length >= 10 ||
    digitsOnly.startsWith('8801') && digitsOnly.length >= 12 ||
    digitsOnly.startsWith('880') && digitsOnly.length >= 12 ||
    digitsOnly.startsWith('1') && digitsOnly.length >= 9
  );
};

// Get popular operators for UI display
export const getPopularOperators = (): BangladeshOperator[] => {
  return BANGLADESH_OPERATORS
    .filter(op => op.marketShare > 0)
    .sort((a, b) => b.marketShare - a.marketShare);
};

// Bangladesh number input helper
export const formatAsUserTypes = (input: string): string => {
  const digitsOnly = input.replace(/\D/g, '');
  
  // Format as user types: 01XXX-XXXXXX
  if (digitsOnly.length <= 5) {
    return digitsOnly;
  } else if (digitsOnly.length <= 11) {
    return `${digitsOnly.substring(0, 5)}-${digitsOnly.substring(5)}`;
  } else {
    // Limit to 11 digits
    const truncated = digitsOnly.substring(0, 11);
    return `${truncated.substring(0, 5)}-${truncated.substring(5)}`;
  }
};

// Remove formatting to get clean digits
export const cleanPhoneInput = (formattedInput: string): string => {
  return formattedInput.replace(/\D/g, '');
};