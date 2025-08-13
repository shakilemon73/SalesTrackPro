import { useState } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, KeyRound, Store, User } from 'lucide-react';

export default function AuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: 'সব তথ্য প্রয়োজন',
        description: 'দয়া করে ইমেইল এবং পাসওয়ার্ড দিন',
        variant: 'destructive'
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: 'ভুল ইমেইল',
        description: 'দয়া করে সঠিক ইমেইল ঠিকানা দিন',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'পাসওয়ার্ড ছোট',
        description: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
      }

      if (result.error) {
        toast({
          title: isSignUp ? 'অ্যাকাউন্ট তৈরি করা যায়নি' : 'লগইন করা যায়নি',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        // Create user profile if it doesn't exist and it's a sign up
        if (isSignUp && result.data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: result.data.user.id,
              email: email.trim(),
              business_name: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { 
              onConflict: 'id' 
            });

          if (profileError) {
            console.warn('Profile creation warning:', profileError);
          }
        }

        toast({
          title: isSignUp ? 'অ্যাকাউন্ট তৈরি হয়েছে' : 'লগইন সফল',
          description: isSignUp ? 'আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে' : 'স্বাগতম!',
        });
        // Navigation will be handled by the auth guard
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'দয়া করে আবার চেষ্টা করুন',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-green-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center">
            <Store className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">দোকান হিসাব</CardTitle>
          <CardDescription className="text-center">
            আপনার ব্যবসার জন্য স্মার্ট সমাধান
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                ইমেইল
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="আপনার ইমেইল লিখুন"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bengali-font"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                পাসওয়ার্ড
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bengali-font"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              onClick={handleAuth}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isSignUp ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'লগইন হচ্ছে...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {isSignUp ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  <span>{isSignUp ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}</span>
                </div>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-green-600 hover:text-green-800 bengali-font"
                disabled={isLoading}
              >
                {isSignUp ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
              </button>
            </div>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            লগইন করার মাধ্যমে আপনি আমাদের{' '}
            <Link href="/terms" className="text-green-600 hover:underline">
              শর্তাবলী
            </Link>
            {' '}এবং{' '}
            <Link href="/privacy" className="text-green-600 hover:underline">
              গোপনীয়তা নীতি
            </Link>
            {' '}মেনে নিচ্ছেন
          </div>
        </CardContent>
      </Card>
    </div>
  );
}