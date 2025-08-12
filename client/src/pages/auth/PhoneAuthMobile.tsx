import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DemoModeToggle } from '@/components/ui/demo-mode-toggle';
import { Smartphone, Shield, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { 
  validateBangladeshPhone as validatePhone, 
  formatAsUserTypes, 
  cleanPhoneInput,
  getOperatorInfo,
  BANGLADESH_OPERATORS
} from "@/lib/bangladesh-phone-utils";
import { DemoModeManager } from "@/lib/demo-mode";

interface PhoneAuthMobileProps {
  onSuccess?: () => void;
}

export default function PhoneAuthMobile({ onSuccess }: PhoneAuthMobileProps) {
  const [phone, setPhone] = useState('');
  const [displayPhone, setDisplayPhone] = useState(''); // For formatted display
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [detectedOperator, setDetectedOperator] = useState<any>(null);
  const [, setLocation] = useLocation();

  const { signInWithOTP, verifyOTP, user } = useAuth();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Initialize demo mode and redirect if already authenticated
  useEffect(() => {
    DemoModeManager.initializeDemoMode();
    
    if (user) {
      onSuccess?.();
      setLocation('/');
    }
  }, [user, onSuccess, setLocation]);

  // Handle phone input changes with real-time formatting and operator detection
  const handlePhoneChange = (value: string) => {
    const cleanValue = cleanPhoneInput(value);
    setPhone(cleanValue);
    
    // Format for display
    const formatted = formatAsUserTypes(cleanValue);
    setDisplayPhone(formatted);
    
    // Detect operator
    const operator = getOperatorInfo(cleanValue);
    setDetectedOperator(operator);
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      setError('অনুগ্রহ করে ফোন নম্বর দিন');
      return;
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.errorMessage || 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await signInWithOTP(phone);

    if (error) {
      setError(getErrorMessage(error));
      setLoading(false);
    } else {
      setStep('otp');
      setCountdown(60); // 60 seconds countdown
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('৬ ডিজিটের OTP কোড দিন');
      return;
    }

    setLoading(true);
    setError('');

    const result = await verifyOTP(phone, otp);

    if (result.error) {
      setError(getErrorMessage(result.error));
      setLoading(false);
    } else if (result.user) {
      // Check if this is a new user that needs registration
      if ((result as any).isNewUser) {
        console.log('🆕 New user detected, redirecting to registration');
        setLocation('/auth/register');
      } else {
        console.log('👤 Existing user, redirecting to dashboard');
        onSuccess?.();
        setLocation('/');
      }
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    const { error } = await signInWithOTP(phone);
    
    if (!error) {
      setCountdown(60);
    } else {
      setError(getErrorMessage(error));
    }
    setLoading(false);
  };

  const getErrorMessage = (error: any): string => {
    const errorMessages: Record<string, string> = {
      'invalid_phone_number': 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (গ্রামীণফোন, রবি, বাংলালিংক, টেলিটক, এয়ারটেল, সিটিসেল)',
      'too_many_requests': 'অনেকবার চেষ্টা করেছেন। ৬০ সেকেন্ড পর আবার চেষ্টা করুন',
      'otp_expired': 'OTP এর মেয়াদ শেষ (৬০ সেকেন্ড)। নতুন OTP নিন',
      'invalid_otp': 'ভুল OTP কোড। সঠিক ৬ ডিজিটের কোড দিন',
      'signup_disabled': 'নতুন অ্যাকাউন্ট তৈরি সাময়িকভাবে বন্ধ আছে',
      'sms_send_failed': 'SMS পাঠাতে সমস্যা হয়েছে। নেটওয়ার্ক চেক করে আবার চেষ্টা করুন',
    };

    return errorMessages[error?.message] || error?.message || 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন';
  };

  const formatPhoneDisplay = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length === 11 && digitsOnly.startsWith('01')) {
      return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 7)} ${digitsOnly.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl text-2xl font-bold">
            দো
          </div>
          <h1 className="text-2xl font-bold text-foreground">দোকান হিসাব</h1>
          <p className="text-sm text-muted-foreground">
            আপনার ব্যবসার সম্পূর্ণ হিসাব রাখুন সহজে
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
          <CardHeader className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full text-primary mb-2">
              {step === 'phone' ? <Smartphone className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
            </div>
            <CardTitle className="text-xl">
              {step === 'phone' ? 'লগইন করুন' : 'OTP যাচাই করুন'}
            </CardTitle>
            <CardDescription className="text-sm">
              {step === 'phone' 
                ? 'আপনার মোবাইল নম্বর দিয়ে লগইন করুন'
                : `${formatPhoneDisplay(phone)} নম্বরে পাঠানো ৬ ডিজিটের কোড দিন`
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Demo Mode Toggle */}
            <DemoModeToggle />

            {error && (
              <Alert variant="destructive" className="border-error/20 bg-error/10">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {step === 'phone' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    মোবাইল নম্বর
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01712-345678"
                    value={displayPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="text-center text-lg tracking-wider"
                    disabled={loading}
                    data-testid="input-phone"
                    maxLength={12} // For formatted input 01XXX-XXXXXX
                  />
                  
                  {/* Operator Detection */}
                  {detectedOperator && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: detectedOperator.color + '40',
                          backgroundColor: detectedOperator.color + '10',
                          color: detectedOperator.color
                        }}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {detectedOperator.nameBengali}
                      </Badge>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    সমর্থিত অপারেটর: গ্রামীণফোন, রবি, বাংলালিংক, টেলিটক, এয়ারটেল, সিটিসেল
                  </p>
                </div>

                <Button 
                  onClick={handleSendOTP}
                  disabled={loading || !phone}
                  className="w-full h-12 text-base font-medium"
                  data-testid="button-send-otp"
                >
                  {loading ? 'OTP পাঠানো হচ্ছে...' : 'OTP পাঠান'}
                </Button>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-success/10 rounded-full text-success">
                      <Shield className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">নিরাপদ</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">সহজ</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-warning/10 rounded-full text-warning">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">দ্রুত</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('phone')}
                  className="mb-2 p-0 h-auto text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  নম্বর পরিবর্তন করুন
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium">
                    OTP কোড
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest font-mono"
                    disabled={loading}
                    data-testid="input-otp"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    SMS এ পাওয়া ৬ ডিজিটের কোড দিন
                  </p>
                </div>

                <Button 
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 text-base font-medium"
                  data-testid="button-verify-otp"
                >
                  {loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
                </Button>

                {/* Resend OTP */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {countdown} সেকেন্ড পর আবার পাঠাতে পারবেন
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-primary hover:text-primary/80"
                      data-testid="button-resend-otp"
                    >
                      আবার OTP পাঠান
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                লগইন করে আপনি আমাদের{' '}
                <span className="text-primary font-medium">গোপনীয়তা নীতি</span> এবং{' '}
                <span className="text-primary font-medium">ব্যবহারের শর্তাবলী</span> মেনে নিচ্ছেন
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center text-xs text-muted-foreground">
          সহায়তার জন্য: <span className="text-primary font-medium">support@dokanhisab.com</span>
        </div>
      </div>
    </div>
  );
}