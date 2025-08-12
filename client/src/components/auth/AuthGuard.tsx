import React from 'react';
import { Switch, Route } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import PhoneAuthMobile from '@/pages/auth/PhoneAuthMobile';
import RegistrationFormMobile from '@/pages/auth/RegistrationFormMobile';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl text-2xl font-bold">
            দো
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">লোড হচ্ছে...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return (
      <Switch>
        <Route path="/auth/register">
          <RegistrationFormMobile />
        </Route>
        <Route path="*">
          <PhoneAuthMobile />
        </Route>
      </Switch>
    );
  }

  // Show app if authenticated
  return <>{children}</>;
}