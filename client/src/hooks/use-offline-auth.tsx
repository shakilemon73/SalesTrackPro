/**
 * Pure Offline Authentication Hook
 * Works completely without internet connection
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { offlineAuth, OfflineUser } from '@/lib/offline-auth';

interface OfflineAuthContextType {
  user: OfflineUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<OfflineUser | null>;
  createAccount: (userData: { name: string; phone?: string; business_name?: string }) => Promise<OfflineUser>;
  logout: () => void;
  updateProfile: (updates: Partial<OfflineUser>) => Promise<OfflineUser | null>;
}

const OfflineAuthContext = createContext<OfflineAuthContextType | undefined>(undefined);

export function OfflineAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<OfflineUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user on app start
    const initAuth = async () => {
      try {
        const currentUser = offlineAuth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('📱 OFFLINE AUTH: Init failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (): Promise<OfflineUser | null> => {
    setIsLoading(true);
    try {
      const loggedInUser = await offlineAuth.loginUser();
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error('📱 OFFLINE AUTH: Login failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (userData: { 
    name: string; 
    phone?: string; 
    business_name?: string 
  }): Promise<OfflineUser> => {
    setIsLoading(true);
    try {
      const newUser = await offlineAuth.createUser(userData);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('📱 OFFLINE AUTH: Account creation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    offlineAuth.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<OfflineUser>): Promise<OfflineUser | null> => {
    try {
      const updatedUser = await offlineAuth.updateUser(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('📱 OFFLINE AUTH: Profile update failed:', error);
      return null;
    }
  };

  const value: OfflineAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    createAccount,
    logout,
    updateProfile,
  };

  return (
    <OfflineAuthContext.Provider value={value}>
      {children}
    </OfflineAuthContext.Provider>
  );
}

export function useOfflineAuth() {
  const context = useContext(OfflineAuthContext);
  if (context === undefined) {
    throw new Error('useOfflineAuth must be used within an OfflineAuthProvider');
  }
  return context;
}