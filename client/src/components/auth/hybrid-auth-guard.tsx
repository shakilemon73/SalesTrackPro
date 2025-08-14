/**
 * Hybrid Authentication Guard - Like TaliKhata/HishabPati
 * - First login requires internet
 * - After first login, works offline
 * - Same login screen for both online/offline
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { hybridAuth } from '@/lib/hybrid-auth';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, Phone, Shield, Wifi, WifiOff, Mail, Lock } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  business_name?: string;
  phone?: string;
}

export default function HybridAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  const { isOnline } = useNetworkStatus();

  const loginForm = useForm<LoginFormData>();
  const registerForm = useForm<RegisterFormData>();

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = hybridAuth.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
    
    if (authenticated) {
      const user = hybridAuth.getCurrentUser();
      console.log('🌐 HYBRID AUTH: User already authenticated:', user?.name);
    }
  }, []);

  const handleLogin = async (data: LoginFormData) => {
    if (!isOnline) {
      setAuthError('ইন্টারনেট সংযোগ প্রয়োজন প্রথমবার লগইনের জন্য');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      await hybridAuth.loginWithInternet(data.email, data.password);
      setIsAuthenticated(true);
    } catch (error: any) {
      setAuthError(error.message || 'লগইনে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    if (!isOnline) {
      setAuthError('ইন্টারনেট সংযোগ প্রয়োজন নতুন অ্যাকাউন্ট তৈরির জন্য');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      await hybridAuth.registerWithInternet(data);
      setIsAuthenticated(true);
    } catch (error: any) {
      setAuthError(error.message || 'অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">দোকান হিসাব চালু হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          
          {/* Connection Status */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
              isOnline 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isOnline ? 'ইন্টারনেট সংযুক্ত' : 'ইন্টারনেট সংযোগ নেই'}
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                দোকান হিসাব
              </CardTitle>
              <p className="text-gray-600 text-sm">
                TaliKhata এর মতো অফলাইন ব্যবসা ম্যানেজমেন্ট
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {authError}
                </div>
              )}

              {!isOnline && (
                <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm">
                  <p className="font-medium">প্রথমবার লগইনের জন্য ইন্টারনেট প্রয়োজন</p>
                  <p className="text-xs mt-1">একবার লগইন করলে পরে অফলাইনে কাজ করবে</p>
                </div>
              )}

              {showRegister ? (
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">নতুন অ্যাকাউন্ট</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      আপনার নাম *
                    </div>
                    <Input
                      {...registerForm.register('name', { required: true })}
                      placeholder="আহমেদ সাহেব"
                      disabled={!isOnline}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      ইমেইল *
                    </div>
                    <Input
                      {...registerForm.register('email', { required: true })}
                      type="email"
                      placeholder="ahmed@example.com"
                      disabled={!isOnline}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="w-4 h-4" />
                      পাসওয়ার্ড *
                    </div>
                    <Input
                      {...registerForm.register('password', { required: true })}
                      type="password"
                      placeholder="পাসওয়ার্ড"
                      disabled={!isOnline}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      দোকানের নাম
                    </div>
                    <Input
                      {...registerForm.register('business_name')}
                      placeholder="আহমেদ ট্রেডার্স"
                      disabled={!isOnline}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    disabled={!isOnline || isLoading}
                  >
                    {isLoading ? 'তৈরি করা হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowRegister(false)}
                      className="text-blue-500 text-sm hover:underline"
                    >
                      আগে থেকে অ্যাকাউন্ট আছে? লগইন করুন
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">লগইন করুন</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      ইমেইল
                    </div>
                    <Input
                      {...loginForm.register('email', { required: true })}
                      type="email"
                      placeholder="আপনার ইমেইল"
                      disabled={!isOnline}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="w-4 h-4" />
                      পাসওয়ার্ড
                    </div>
                    <Input
                      {...loginForm.register('password', { required: true })}
                      type="password"
                      placeholder="পাসওয়ার্ড"
                      disabled={!isOnline}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-500 hover:bg-green-600"
                    disabled={!isOnline || isLoading}
                  >
                    {isLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowRegister(true)}
                      className="text-blue-500 text-sm hover:underline"
                    >
                      নতুন অ্যাকাউন্ট তৈরি করুন
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                    <Shield className="w-4 h-4" />
                    TaliKhata এর মতো হাইব্রিড সিস্টেম
                  </div>
                  <p className="text-xs text-gray-500">
                    একবার লগইন করলে অফলাইনে কাজ করবে
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}