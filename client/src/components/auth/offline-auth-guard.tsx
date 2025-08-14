/**
 * Pure Offline Authentication Guard
 * Works completely without internet connection
 */

import { useEffect, useState } from 'react';
import { useOfflineAuth } from '@/hooks/use-offline-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { User, Building2, Phone, Shield, Wifi, WifiOff } from 'lucide-react';

interface LoginFormData {
  name: string;
  business_name?: string;
  phone?: string;
}

export default function OfflineAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, login, createAccount } = useOfflineAuth();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  useEffect(() => {
    // If no user exists, show create account form
    if (!isLoading && !isAuthenticated) {
      const userExists = localStorage.getItem('dokan_hisab_offline_user') !== null;
      setShowCreateAccount(!userExists);
    }
  }, [isLoading, isAuthenticated]);

  const onLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const onCreateAccount = async (data: LoginFormData) => {
    try {
      await createAccount(data);
    } catch (error) {
      console.error('Account creation failed:', error);
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
          
          {/* Offline Status Indicator */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm">
              <WifiOff className="w-4 h-4" />
              সম্পূর্ণ অফলাইন মোড
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
                অফলাইন ব্যবসা ম্যানেজমেন্ট
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {showCreateAccount ? (
                <form onSubmit={handleSubmit(onCreateAccount)} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">নতুন অ্যাকাউন্ট তৈরি করুন</h3>
                    <p className="text-sm text-gray-600">আপনার ব্যবসার তথ্য দিন</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      আপনার নাম *
                    </div>
                    <Input
                      {...register('name', { required: 'নাম আবশ্যক' })}
                      placeholder="যেমন: আহমেদ সাহেব"
                      className="text-center"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      দোকানের নাম
                    </div>
                    <Input
                      {...register('business_name')}
                      placeholder="যেমন: আহমেদ ট্রেডার্স"
                      className="text-center"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      মোবাইল নম্বর
                    </div>
                    <Input
                      {...register('phone')}
                      placeholder="01XXXXXXXXX"
                      className="text-center"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                    অ্যাকাউন্ট তৈরি করুন
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      সব তথ্য আপনার ডিভাইসে নিরাপদে সংরক্ষিত হবে
                    </p>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">স্বাগতম!</h3>
                    <p className="text-sm text-gray-600">আপনার দোকান হিসাবে ফিরে আসুন</p>
                  </div>

                  <Button onClick={onLogin} className="w-full bg-green-500 hover:bg-green-600">
                    <Shield className="w-4 h-4 mr-2" />
                    দোকান হিসাবে প্রবেশ করুন
                  </Button>

                  <div className="text-center">
                    <button
                      onClick={() => setShowCreateAccount(true)}
                      className="text-blue-500 text-sm hover:underline"
                    >
                      নতুন অ্যাকাউন্ট তৈরি করুন
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                    <Shield className="w-4 h-4" />
                    ১০০% অফলাইন এবং নিরাপদ
                  </div>
                  <p className="text-xs text-gray-500">
                    ইন্টারনেট ছাড়াই সব কাজ করুন
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