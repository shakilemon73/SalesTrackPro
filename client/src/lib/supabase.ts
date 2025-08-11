// Supabase direct API configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lkhqdqlryjzalsemofdt.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
};

// API endpoints for different tables
export const apiEndpoints = {
  customers: `${SUPABASE_URL}/rest/v1/customers`,
  products: `${SUPABASE_URL}/rest/v1/products`, 
  sales: `${SUPABASE_URL}/rest/v1/sales`,
  expenses: `${SUPABASE_URL}/rest/v1/expenses`,
  collections: `${SUPABASE_URL}/rest/v1/collections`,
  users: `${SUPABASE_URL}/rest/v1/users`
};

// Helper function to make authenticated requests to Supabase
export async function supabaseRequest(
  endpoint: string, 
  options: RequestInit = {}
) {
  const config = {
    ...options,
    headers: {
      ...supabaseConfig.headers,
      ...options.headers
    }
  };

  const response = await fetch(endpoint, config);
  
  if (!response.ok) {
    throw new Error(`Supabase API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Current user ID (in a real app, this would come from authentication)
export const CURRENT_USER_ID = 'demo-user-123';