import { useState } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, KeyRound, Store } from 'lucide-react';
import { formatBengaliPhone } from '@/lib/bengali-utils';

export default function AuthLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Ensure it starts with +880 for Bangladesh
    if (cleaned.startsWith('880')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `+880${cleaned.substring(1)}`;
    } else if (cleaned.length === 10) {
      return `+880${cleaned}`;
    }
    
    return phone;
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'ফোন নম্বর প্রয়োজন',
        description: 'দয়া করে আপনার ফোন নম্বর দিন',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        toast({
          title: 'OTP পাঠানো যায়নি',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setIsOtpSent(true);
        toast({
          title: 'OTP পাঠানো হয়েছে',
          description: `${formatBengaliPhone(formattedPhone)} নম্বরে OTP পাঠানো হয়েছে`,
        });
      }
    } catch (error) {
      console.error('OTP send error:', error);
      toast({
        title: 'সমস্যা হয়েছে',
        description: 'দয়া করে আবার চেষ্টা করুন',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast({
        title: 'OTP প্রয়োজন',
        description: 'দয়া করে আপনার OTP কোড দিন',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        toast({
          title: 'OTP যাচাই করা যায়নি',
          description: error.message,
          variant: 'destructive'
        });
      } else if (data.user) {
        // Create user profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            phone_number: formattedPhone,
            business_name: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'id' 
          });

        if (profileError) {
          console.warn('Profile creation warning:', profileError);
        }

        toast({
          title: 'সফলভাবে লগইন হয়েছে',
          description: 'স্বাগতম!',
        });
        
        // Redirect will happen automatically due to auth state change
        window.location.href = '/';
      }
    } catch (error) {
      console.error('OTP verification error:', error);
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
          {!isOtpSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  ফোন নম্বর
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01XXXXXXXXX বা +8801XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  বাংলাদেশের যেকোনো মোবাইল অপারেটর (গ্রামীণফোন, বাংলালিংক, রবি, টেলিটক)
                </p>
              </div>
              
              <Button 
                onClick={handleSendOtp} 
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠান'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  OTP পাঠানো হয়েছে
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {formatBengaliPhone(formatPhoneNumber(phoneNumber))}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">
                  OTP কোড
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="6 অঙ্কের কোড"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleVerifyOtp} 
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
                </Button>
                
                <Button 
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtp('');
                  }} 
                  variant="outline"
                  className="w-full"
                >
                  ফোন নম্বর পরিবর্তন করুন
                </Button>
              </div>
            </div>
          )}
          
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