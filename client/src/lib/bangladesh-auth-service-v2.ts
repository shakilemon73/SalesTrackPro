// Hybrid Bangladesh Authentication Service
// Demo OTP verification but real user creation and management

import { supabase } from './supabase';
import { validateBangladeshPhone, formatBangladeshPhone } from './bangladesh-phone-utils';
import { DemoModeManager } from './demo-mode';

export interface BangladeshAuthUser {
  id: string;
  phone: string;
  operator: string;
  created_at: string;
  last_sign_in_at: string;
  isNewUser?: boolean;
  username?: string;
  business_name?: string;
  email?: string;
  address?: string;
}

export interface BangladeshAuthResult {
  success: boolean;
  error?: string;
  user?: BangladeshAuthUser;
  isNewUser?: boolean;
}

class BangladeshAuthServiceV2 {
  private currentUser: BangladeshAuthUser | null = null;
  private sessionKey = 'dokan_hisab_bd_session';
  
  constructor() {
    this.restoreSession();
  }

  // Send OTP (always demo mode for testing)
  async sendOTP(phone: string): Promise<BangladeshAuthResult> {
    try {
      const validation = validateBangladeshPhone(phone);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errorMessage || 'Invalid Bangladesh phone number'
        };
      }

      const formattedPhone = formatBangladeshPhone(phone);
      const demoOtp = DemoModeManager.getDemoOTP();
      
      // Always use demo OTP for testing
      console.log(`🧪 Demo OTP for ${formattedPhone}: ${demoOtp}`);
      localStorage.setItem('bd_otp_code', demoOtp);
      localStorage.setItem('bd_otp_phone', formattedPhone);
      localStorage.setItem('bd_otp_time', Date.now().toString());
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send OTP'
      };
    }
  }

  // Verify OTP and check user existence
  async verifyOTP(phone: string, otp: string): Promise<BangladeshAuthResult> {
    try {
      const formattedPhone = formatBangladeshPhone(phone);
      
      // Get stored OTP data
      const storedOtp = localStorage.getItem('bd_otp_code');
      const storedPhone = localStorage.getItem('bd_otp_phone');
      const storedTime = localStorage.getItem('bd_otp_time');
      
      if (!storedOtp || !storedPhone || !storedTime) {
        return {
          success: false,
          error: 'No OTP request found. Please request a new OTP.'
        };
      }
      
      // Check if OTP has expired (5 minutes)
      const otpTime = parseInt(storedTime);
      const currentTime = Date.now();
      const otpAge = currentTime - otpTime;
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      if (otpAge > maxAge) {
        this.clearOTPData();
        return {
          success: false,
          error: 'OTP has expired. Please request a new OTP.'
        };
      }
      
      // Verify phone number matches
      if (storedPhone !== formattedPhone) {
        return {
          success: false,
          error: 'Phone number mismatch. Please start over.'
        };
      }
      
      // Verify OTP code
      if (storedOtp !== otp) {
        return {
          success: false,
          error: 'Invalid OTP code. Please try again.'
        };
      }
      
      // OTP is valid - check if user exists in database
      const existingUserCheck = await this.checkUserExists(formattedPhone);
      
      let user: BangladeshAuthUser;
      let isNewUser = false;
      
      if (existingUserCheck.exists && existingUserCheck.user) {
        // Existing user - login
        user = existingUserCheck.user;
        user.last_sign_in_at = new Date().toISOString();
        console.log('✅ Existing user logged in:', formattedPhone);
      } else {
        // New user - create temporary user object (will be completed in registration)
        user = {
          id: this.generateUserId(),
          phone: formattedPhone,
          operator: this.detectOperator(formattedPhone),
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          isNewUser: true // Flag to indicate this user needs registration
        };
        isNewUser = true;
        console.log('✅ New user detected, needs registration:', formattedPhone);
      }
      
      // Store user session
      this.currentUser = user;
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
      
      // Clear OTP data after successful verification
      this.clearOTPData();
      
      return {
        success: true,
        user,
        isNewUser
      };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify OTP'
      };
    }
  }

  // Check if user exists in database
  async checkUserExists(phone: string): Promise<{exists: boolean, user?: BangladeshAuthUser}> {
    try {
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('id, username, business_name, phone_number, email, address, created_at')
        .eq('phone_number', phone)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user existence:', error);
        return { exists: false };
      }

      if (existingUser) {
        return {
          exists: true,
          user: {
            id: existingUser.id,
            phone: existingUser.phone_number,
            operator: this.detectOperator(existingUser.phone_number),
            created_at: existingUser.created_at,
            last_sign_in_at: new Date().toISOString(),
            username: existingUser.username,
            business_name: existingUser.business_name,
            email: existingUser.email,
            address: existingUser.address
          }
        };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error in checkUserExists:', error);
      return { exists: false };
    }
  }

  // Complete user registration (for new users)
  async completeRegistration(userData: {
    business_name: string;
    email?: string;
    address?: string;
  }): Promise<BangladeshAuthResult> {
    if (!this.currentUser || !this.currentUser.isNewUser) {
      return {
        success: false,
        error: 'No new user session found'
      };
    }

    try {
      // Create user profile in Supabase
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: this.currentUser.id,
          username: `user_${this.currentUser.phone.replace('+88', '').slice(-4)}`,
          business_name: userData.business_name,
          phone_number: this.currentUser.phone,
          email: userData.email || null,
          address: userData.address || null,
          created_at: this.currentUser.created_at
        });

      if (insertError) {
        console.error('Failed to create user profile:', insertError);
        return {
          success: false,
          error: 'Failed to create user account. Please try again.'
        };
      }

      // Create default subscription for new user
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: this.currentUser.id,
          plan_name: 'free_trial',
          plan_name_local: 'ফ্রি ট্রায়াল',
          status: 'active',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        });

      if (subscriptionError) {
        console.warn('Failed to create subscription:', subscriptionError);
      }

      // Update current user object
      this.currentUser = {
        ...this.currentUser,
        username: `user_${this.currentUser.phone.replace('+88', '').slice(-4)}`,
        business_name: userData.business_name,
        email: userData.email,
        address: userData.address,
        isNewUser: false
      };

      // Update session
      localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));

      console.log('✅ New user registration completed:', this.currentUser.phone);

      return {
        success: true,
        user: this.currentUser
      };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  }

  // Get current user
  getCurrentUser(): BangladeshAuthUser | null {
    return this.currentUser;
  }

  // Sign out
  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem(this.sessionKey);
    this.clearOTPData();
    console.log('👋 Bangladesh user signed out');
  }

  // Private helper methods
  private clearOTPData(): void {
    localStorage.removeItem('bd_otp_code');
    localStorage.removeItem('bd_otp_phone');
    localStorage.removeItem('bd_otp_time');
  }

  private restoreSession(): void {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      if (sessionData) {
        this.currentUser = JSON.parse(sessionData);
        console.log('🔄 Bangladesh session restored for:', this.currentUser?.phone);
      }
    } catch (error) {
      console.warn('Failed to restore Bangladesh session:', error);
      localStorage.removeItem(this.sessionKey);
    }
  }

  private generateUserId(): string {
    // Generate a proper UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private detectOperator(phone: string): string {
    const number = phone.replace('+88', '');
    const prefix = number.substring(0, 3);
    
    const operators: Record<string, string> = {
      '017': 'গ্রামীণফোন',
      '013': 'গ্রামীণফোন',
      '018': 'রবি',
      '019': 'বাংলালিংক',
      '014': 'বাংলালিংক',
      '015': 'টেলিটক',
      '016': 'এয়ারটেল',
      '011': 'সিটিসেল'
    };
    
    return operators[prefix] || 'Unknown';
  }
}

export const bangladeshAuthServiceV2 = new BangladeshAuthServiceV2();