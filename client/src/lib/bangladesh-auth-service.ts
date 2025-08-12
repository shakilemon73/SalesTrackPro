// Real Bangladesh SMS OTP Authentication Service
// Integration with SMS.NET.BD for authentic Bangladesh phone verification

import { supabase } from './supabase';
import { validateBangladeshPhone, formatBangladeshPhone } from './bangladesh-phone-utils';
import { DemoModeManager } from './demo-mode';

export interface BangladeshAuthUser {
  id: string;
  phone: string;
  created_at: string;
  user_metadata: {
    phone_verified: boolean;
    country: string;
    operator?: string;
  };
}

class BangladeshAuthService {
  private currentUser: BangladeshAuthUser | null = null;
  private sessionKey = 'dokan_hisab_bd_session';
  private apiEndpoint = 'https://sms.net.bd/api'; // SMS.NET.BD API endpoint
  
  constructor() {
    // Restore session on initialization
    this.restoreSession();
  }

  // Send real OTP via Bangladesh SMS provider
  async sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate Bangladesh phone number
      const validation = validateBangladeshPhone(phone);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errorMessage || 'Invalid Bangladesh phone number'
        };
      }

      const formattedPhone = formatBangladeshPhone(phone);
      
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // SMS message in Bengali
      const message = `আপনার দোকান হিসাব OTP কোড: ${otp}। ৫ মিনিটের মধ্যে ব্যবহার করুন। কোড গোপন রাখুন।`;
      
      // Check if demo mode is enabled
      if (DemoModeManager.isDemoMode()) {
        const demoOtp = DemoModeManager.getDemoOTP();
        console.log(`🧪 Demo mode: OTP for ${formattedPhone} is ${demoOtp}`);
        localStorage.setItem('bd_otp_code', demoOtp);
        localStorage.setItem('bd_otp_phone', formattedPhone);
        localStorage.setItem('bd_otp_time', Date.now().toString());
        
        return { 
          success: true
        };
      }

      // Check if SMS API key is available for live mode
      const smsApiKey = localStorage.getItem('SMS_API_KEY') || '';
      const smsApiUser = localStorage.getItem('SMS_API_USER') || '';
      
      if (!smsApiKey || !smsApiUser) {
        return {
          success: false,
          error: 'SMS API credentials not configured. Enable demo mode or provide SMS API credentials.'
        };
      }

      // Send real SMS via Bangladesh provider
      const smsResponse = await this.sendBangladeshSMS(
        formattedPhone, 
        message, 
        smsApiUser, 
        smsApiKey
      );
      
      if (smsResponse.success) {
        // Store OTP for verification
        localStorage.setItem('bd_otp_code', otp);
        localStorage.setItem('bd_otp_phone', formattedPhone);
        localStorage.setItem('bd_otp_time', Date.now().toString());
        
        return { success: true };
      } else {
        return {
          success: false,
          error: smsResponse.error || 'Failed to send SMS'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify OTP and create session
  async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; user?: BangladeshAuthUser; error?: string }> {
    try {
      const storedPhone = localStorage.getItem('bd_otp_phone');
      const storedOtp = localStorage.getItem('bd_otp_code');
      const otpTime = localStorage.getItem('bd_otp_time');
      const formattedPhone = formatBangladeshPhone(phone);

      // Check if phone matches
      if (storedPhone !== formattedPhone) {
        return {
          success: false,
          error: 'Phone number mismatch. Please request new OTP.'
        };
      }

      // Check OTP expiry (5 minutes)
      if (!otpTime || Date.now() - parseInt(otpTime) > 5 * 60 * 1000) {
        return {
          success: false,
          error: 'OTP expired. Please request a new one.'
        };
      }

      // Validate OTP format
      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        return {
          success: false,
          error: 'Please enter a valid 6-digit OTP code'
        };
      }

      // Verify OTP matches
      if (otp !== storedOtp) {
        return {
          success: false,
          error: 'Invalid OTP code. Please check and try again.'
        };
      }

      // Create authenticated user
      const user: BangladeshAuthUser = {
        id: this.generateUserId(formattedPhone),
        phone: formattedPhone,
        created_at: new Date().toISOString(),
        user_metadata: {
          phone_verified: true,
          country: 'BD',
          operator: this.detectOperator(formattedPhone)
        }
      };

      // Store session
      this.currentUser = user;
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
      
      // Clean up OTP data
      localStorage.removeItem('bd_otp_phone');
      localStorage.removeItem('bd_otp_code');
      localStorage.removeItem('bd_otp_time');

      console.log('✅ Bangladesh authentication successful for:', formattedPhone);
      
      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
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
    localStorage.removeItem('bd_otp_phone');
    localStorage.removeItem('bd_otp_code');
    localStorage.removeItem('bd_otp_time');
    console.log('👋 Bangladesh user signed out');
  }

  // Send SMS via Bangladesh SMS provider
  private async sendBangladeshSMS(phone: string, message: string, username: string, apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove +88 for local SMS API
      const localPhone = phone.replace('+88', '');
      
      const smsData = {
        username: username,
        password: apiKey,
        number: localPhone,
        message: message,
        type: 'OTP' // OTP type for Bangladesh providers
      };

      const response = await fetch(`${this.apiEndpoint}/sendsms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData)
      });

      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.message || 'SMS sending failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  // Restore session from localStorage
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

  // Generate proper UUID for new user
  private generateUserId(phone: string): string {
    // Generate a proper UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Detect mobile operator from phone number
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

  // Create or update user profile in Supabase
  async ensureUserProfile(): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Check if user exists in Supabase
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', this.currentUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingUser) {
        // Create new user profile with proper data
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: this.currentUser.id,
            username: `user_${this.currentUser.phone.replace('+88', '').slice(-4)}`,
            business_name: 'আমার দোকান',
            phone_number: this.currentUser.phone,
            email: null,
            address: null,
            created_at: this.currentUser.created_at
          });

        if (insertError) {
          console.error('Failed to create user profile:', insertError);
          throw new Error('Failed to create user profile');
        } else {
          console.log('✅ New user profile created in Supabase for:', this.currentUser.phone);
          
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
          } else {
            console.log('✅ Default subscription created for new user');
          }
        }
      } else {
        console.log('✅ Existing user profile found:', this.currentUser.phone);
      }
    } catch (error) {
      console.error('Profile sync failed:', error);
      throw error; // Throw so authentication fails if profile creation fails
    }
  }
}

export const bangladeshAuthService = new BangladeshAuthService();