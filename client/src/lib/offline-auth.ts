/**
 * Pure Offline Authentication System
 * Works completely without internet connection
 * Stores user data locally for offline-first experience
 */

interface OfflineUser {
  id: string;
  name: string;
  phone?: string;
  business_name?: string;
  created_at: string;
  last_login: string;
}

class OfflineAuthManager {
  private storageKey = 'dokan_hisab_offline_user';
  private isLoggedInKey = 'dokan_hisab_logged_in';

  // Create offline user account
  async createUser(userData: {
    name: string;
    phone?: string;
    business_name?: string;
  }): Promise<OfflineUser> {
    const user: OfflineUser = {
      id: crypto.randomUUID(),
      name: userData.name,
      phone: userData.phone,
      business_name: userData.business_name,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    localStorage.setItem(this.storageKey, JSON.stringify(user));
    localStorage.setItem(this.isLoggedInKey, 'true');
    
    console.log('📱 OFFLINE AUTH: User created successfully', user.id);
    return user;
  }

  // Login offline user
  async loginUser(): Promise<OfflineUser | null> {
    const userData = localStorage.getItem(this.storageKey);
    if (!userData) {
      return null;
    }

    const user: OfflineUser = JSON.parse(userData);
    user.last_login = new Date().toISOString();
    
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    localStorage.setItem(this.isLoggedInKey, 'true');
    
    console.log('📱 OFFLINE AUTH: User logged in successfully', user.id);
    return user;
  }

  // Get current offline user
  getCurrentUser(): OfflineUser | null {
    const isLoggedIn = localStorage.getItem(this.isLoggedInKey) === 'true';
    if (!isLoggedIn) return null;

    const userData = localStorage.getItem(this.storageKey);
    if (!userData) return null;

    return JSON.parse(userData);
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return localStorage.getItem(this.isLoggedInKey) === 'true' && 
           localStorage.getItem(this.storageKey) !== null;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.isLoggedInKey);
    console.log('📱 OFFLINE AUTH: User logged out');
  }

  // Update user profile
  async updateUser(updates: Partial<OfflineUser>): Promise<OfflineUser | null> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const updatedUser = {
      ...currentUser,
      ...updates,
      id: currentUser.id, // Keep original ID
    };

    localStorage.setItem(this.storageKey, JSON.stringify(updatedUser));
    console.log('📱 OFFLINE AUTH: User updated successfully');
    return updatedUser;
  }

  // Check if user exists
  userExists(): boolean {
    return localStorage.getItem(this.storageKey) !== null;
  }
}

export const offlineAuth = new OfflineAuthManager();
export type { OfflineUser };