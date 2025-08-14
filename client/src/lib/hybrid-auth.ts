/**
 * Hybrid Authentication System
 * - First login requires internet (Supabase auth)
 * - After first login, works offline with stored token
 * - Same as TaliKhata/HishabPati approach
 */

import { supabase } from './supabase';

interface StoredAuth {
  user_id: string;
  email?: string;
  name?: string;
  phone?: string;
  business_name?: string;
  auth_token: string;
  last_sync: string;
  created_at: string;
}

class HybridAuthManager {
  private storageKey = 'dokan_hisab_auth';
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 HYBRID AUTH: Back online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 HYBRID AUTH: Now offline');
    });
  }

  // First-time login (requires internet)
  async loginWithInternet(email: string, password: string): Promise<StoredAuth> {
    if (!this.isOnline) {
      throw new Error('ইন্টারনেট সংযোগ প্রয়োজন প্রথমবার লগইনের জন্য');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('User not found');

      // Get user profile from Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Store auth data locally
      const authData: StoredAuth = {
        user_id: data.user.id,
        email: data.user.email,
        name: profile?.name,
        phone: profile?.phone,
        business_name: profile?.business_name,
        auth_token: data.session?.access_token || '',
        last_sync: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(authData));
      console.log('🌐 HYBRID AUTH: First login successful, stored locally');
      
      return authData;
    } catch (error) {
      console.error('🌐 HYBRID AUTH: Login failed:', error);
      throw error;
    }
  }

  // Register new user (requires internet)
  async registerWithInternet(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    business_name?: string;
  }): Promise<StoredAuth> {
    if (!this.isOnline) {
      throw new Error('ইন্টারনেট সংযোগ প্রয়োজন অ্যাকাউন্ট তৈরির জন্য');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (error) throw error;
      if (!data.user) throw new Error('Registration failed');

      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        name: userData.name,
        phone: userData.phone,
        business_name: userData.business_name
      });

      // Store auth data locally
      const authData: StoredAuth = {
        user_id: data.user.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        business_name: userData.business_name,
        auth_token: data.session?.access_token || '',
        last_sync: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(authData));
      console.log('🌐 HYBRID AUTH: Registration successful, stored locally');
      
      return authData;
    } catch (error) {
      console.error('🌐 HYBRID AUTH: Registration failed:', error);
      throw error;
    }
  }

  // Check if user is authenticated (works offline)
  isAuthenticated(): boolean {
    const authData = localStorage.getItem(this.storageKey);
    return authData !== null;
  }

  // Get current user (works offline)
  getCurrentUser(): StoredAuth | null {
    const authData = localStorage.getItem(this.storageKey);
    if (!authData) return null;
    
    try {
      return JSON.parse(authData);
    } catch (error) {
      console.error('🌐 HYBRID AUTH: Invalid stored auth data');
      return null;
    }
  }

  // Logout (works offline)
  logout(): void {
    localStorage.removeItem(this.storageKey);
    console.log('🌐 HYBRID AUTH: User logged out');
  }

  // Check if online
  isOnlineMode(): boolean {
    return this.isOnline;
  }

  // Update user data
  updateUserData(updates: Partial<StoredAuth>): void {
    const currentAuth = this.getCurrentUser();
    if (!currentAuth) return;

    const updatedAuth = {
      ...currentAuth,
      ...updates,
      last_sync: new Date().toISOString()
    };

    localStorage.setItem(this.storageKey, JSON.stringify(updatedAuth));
  }
}

export const hybridAuth = new HybridAuthManager();
export type { StoredAuth };