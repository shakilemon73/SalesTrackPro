import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Store, User, Mail, MapPin, Sparkles } from 'lucide-react';
import { bangladeshAuthServiceV2 } from '@/lib/bangladesh-auth-service-v2';
import { useLocation } from 'wouter';

interface RegistrationFormMobileProps {
  onSuccess?: () => void;
}

export default function RegistrationFormMobile({ onSuccess }: RegistrationFormMobileProps) {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  const currentUser = bangladeshAuthServiceV2.getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim()) {
      setError('অনুগ্রহ করে ব্যবসার নাম দিন');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await bangladeshAuthServiceV2.completeRegistration({
        business_name: businessName.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined
      });

      if (result.success) {
        console.log('✅ Registration completed successfully');
        onSuccess?.();
        setLocation('/');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error: any) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !currentUser.isNewUser) {
    setLocation('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              আপনার ব্যবসার তথ্য দিন
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {currentUser.phone} নম্বরের জন্য নতুন অ্যাকাউন্ট তৈরি করুন
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-error/20 bg-error/10">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="business_name" className="text-sm font-medium flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  ব্যবসার নাম <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="business_name"
                  type="text"
                  placeholder="যেমন: রহিম জেনারেল স্টোর"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={loading}
                  data-testid="input-business-name"
                  className="text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  ইমেইল (ঐচ্ছিক)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  data-testid="input-email"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  ঠিকানা (ঐচ্ছিক)
                </Label>
                <Textarea
                  id="address"
                  placeholder="যেমন: ১২৩ নিউ মার্কেট, ঢাকা"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  data-testid="input-address"
                  className="text-base min-h-[80px]"
                  rows={3}
                />
              </div>

              <Button 
                type="submit"
                disabled={loading || !businessName.trim()}
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                data-testid="button-register"
              >
                {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  আপনার তথ্য সুরক্ষিত থাকবে এবং শুধুমাত্র আপনার ব্যবসার জন্য ব্যবহৃত হবে
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}