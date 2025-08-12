import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithOTP: (phone: string) => Promise<{ error: any }>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: any; user?: User | null }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session - check both Supabase and Bangladesh auth
    const getInitialSession = async () => {
      try {
        // First check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
        } else {
          // Check new Bangladesh auth service for existing session
          const { bangladeshAuthServiceV2 } = await import('../lib/bangladesh-auth-service-v2');
          const bdUser = bangladeshAuthServiceV2.getCurrentUser();
          
          if (bdUser) {
            setUser(bdUser as any);
            setSession({ user: bdUser } as any);
            console.log('🔄 Restored Bangladesh auth session for:', bdUser.phone);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOTP = async (phone: string) => {
    try {
      // Use new hybrid Bangladesh auth service
      const { bangladeshAuthServiceV2 } = await import('../lib/bangladesh-auth-service-v2');
      const result = await bangladeshAuthServiceV2.sendOTP(phone);
      
      if (result.success) {
        return { error: null };
      } else {
        return { error: { message: result.error || 'Failed to send OTP' } };
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return { error: { message: error.message } };
    }
  };

  const verifyOTP = async (phone: string, token: string) => {
    try {
      // Use new hybrid Bangladesh auth service
      const { bangladeshAuthServiceV2 } = await import('../lib/bangladesh-auth-service-v2');
      const result = await bangladeshAuthServiceV2.verifyOTP(phone, token);
      
      if (result.success && result.user) {
        // Set the authenticated user
        setUser(result.user as any);
        setSession({ user: result.user } as any);
        
        console.log('✅ Authentication complete:', result.user.phone, result.isNewUser ? '(new user)' : '(existing user)');
        return { 
          error: null, 
          user: result.user,
          isNewUser: result.isNewUser 
        };
      } else {
        return { error: { message: result.error || 'Invalid OTP' }, user: null };
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return { error: { message: error.message }, user: null };
    }
  };

  const createUserProfile = async (authUser: User) => {
    try {
      // Create user profile in our users table
      const { error } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          phone_number: authUser.phone,
          username: `user_${authUser.phone?.slice(-4) || Math.random().toString(36).substr(2, 4)}`,
          business_name: 'আমার ব্যবসা', // Default business name in Bengali
          created_at: new Date().toISOString()
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating user profile:', error);
      }

      // Create default subscription (free trial)
      await supabase
        .from('subscriptions')
        .insert({
          user_id: authUser.id,
          plan_name: 'free_trial',
          plan_name_local: 'ফ্রি ট্রায়াল',
          status: 'active',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          created_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Bangladesh auth service
      const { bangladeshAuthServiceV2 } = await import('../lib/bangladesh-auth-service-v2');
      await bangladeshAuthServiceV2.signOut();
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error signing out:', error);
      return { error: { message: error.message } };
    }
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signInWithOTP,
    verifyOTP,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to format Bangladesh phone numbers
function formatBangladeshPhone(phone: string): string {
  // Remove all non-digit characters except + at the beginning
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove + if it exists and handle the digits
  const digitsOnly = cleaned.replace(/\+/g, '');
  
  // Bangladesh mobile number patterns:
  // Grameenphone: 017, 013
  // Robi: 018, 019  
  // Banglalink: 019, 014
  // Teletalk: 015
  // Citycell: 011
  // Airtel: 016
  
  // Handle different input formats
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
  }
  
  // If it already has +88, validate and return
  if (phone.startsWith('+88') && digitsOnly.length === 13) {
    return phone;
  }
  
  // For any other format, try to intelligently add Bangladesh country code
  if (digitsOnly.length >= 10 && digitsOnly.length <= 11) {
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
}

// Enhanced validation for Bangladesh phone numbers
function validateBangladeshPhone(phone: string): boolean {
  const formatted = formatBangladeshPhone(phone);
  
  // Extract digits after +88
  const digitsAfterCountryCode = formatted.substring(3);
  
  // Must be 11 digits total after +88
  if (digitsAfterCountryCode.length !== 11) {
    return false;
  }
  
  // Must start with 01 and then valid operator codes
  const validPrefixes = [
    '017', '013', // Grameenphone
    '018', '019', // Robi
    '014',        // Banglalink
    '015',        // Teletalk
    '016',        // Airtel
    '011'         // Citycell
  ];
  
  return validPrefixes.some(prefix => digitsAfterCountryCode.startsWith(prefix));
}