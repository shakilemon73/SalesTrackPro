import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getBengaliDate, toBengaliNumber } from '@/lib/bengali-utils';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Smartphone, 
  Download, 
  Upload,
  CreditCard,
  HelpCircle,
  LogOut,
  Edit3,
  Save,
  X,
  Crown,
  Zap,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Store,
  Clock,
  Activity,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsAuthMobileOptimized() {
  const { user, signOut } = useAuth();
  const { profile, subscription, loading, updateProfile, isTrialActive, getTrialDaysLeft } = useUserProfile();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Local state for editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    business_name: profile?.business_name || '',
    email: profile?.email || '',
    address: profile?.address || ''
  });

  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "সফলভাবে লগআউট",
        description: "আপনি সফলভাবে লগআউট হয়েছেন"
      });
    } catch (error) {
      toast({
        title: "লগআউট ত্রুটি",
        description: "লগআউট করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const { error } = await updateProfile(profileForm);
      if (error) throw new Error(error);
      
      setEditingProfile(false);
      toast({
        title: "প্রোফাইল আপডেট",
        description: "আপনার প্রোফাইল সফলভাবে আপডেট হয়েছে"
      });
    } catch (error) {
      toast({
        title: "আপডেট ত্রুটি",
        description: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const getSubscriptionBadge = () => {
    if (!subscription) return null;

    const variants = {
      free_trial: { variant: 'outline', color: 'text-primary', text: 'ফ্রি ট্রায়াল' },
      basic: { variant: 'default', color: 'text-success', text: 'বেসিক' },
      pro: { variant: 'default', color: 'text-warning', text: 'প্রো' },
      enterprise: { variant: 'default', color: 'text-purple-500', text: 'এন্টারপ্রাইজ' }
    };

    const config = variants[subscription.plan_name as keyof typeof variants] || variants.free_trial;
    
    return (
      <Badge variant={config.variant as any} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">সেটিংস</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* User Profile Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                  {profile?.business_name?.charAt(0) || 'দো'}
                </div>
                <div>
                  <CardTitle className="text-lg">{profile?.business_name || 'আমার ব্যবসা'}</CardTitle>
                  <CardDescription className="text-sm">
                    {user?.phone || 'ফোন নম্বর নেই'}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                {getSubscriptionBadge()}
                {isTrialActive() && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {toBengaliNumber(getTrialDaysLeft())} দিন বাকি
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {isTrialActive() && (
              <Alert className="border-warning/20 bg-warning/10 mb-4">
                <Crown className="w-4 h-4 text-warning" />
                <AlertDescription className="text-sm">
                  আপনার ফ্রি ট্রায়াল {toBengaliNumber(getTrialDaysLeft())} দিন বাকি। 
                  <Link href="/subscription">
                    <Button variant="link" className="h-auto p-0 text-warning">
                      {' '}এখনই আপগ্রেড করুন
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Link href="/subscription">
                <Button variant="outline" size="sm" className="w-full h-auto p-3 flex-col">
                  <CreditCard className="w-5 h-5 mb-1 text-primary" />
                  <span className="text-xs">সাবস্ক্রিপশন</span>
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full h-auto p-3 flex-col">
                    <Edit3 className="w-5 h-5 mb-1 text-primary" />
                    <span className="text-xs">প্রোফাইল এডিট</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle>প্রোফাইল সম্পাদনা</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="business_name">ব্যবসার নাম</Label>
                      <Input
                        id="business_name"
                        value={profileForm.business_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, business_name: e.target.value }))}
                        placeholder="আপনার ব্যবসার নাম"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="example@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">ঠিকানা</Label>
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="আপনার ব্যবসার ঠিকানা"
                      />
                    </div>
                    <Button onClick={handleProfileUpdate} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">সাধারণ</TabsTrigger>
            <TabsTrigger value="notifications">নোটিফিকেশন</TabsTrigger>
            <TabsTrigger value="data">ডেটা</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-primary" />
                  সাধারণ সেটিংস
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>ডার্ক মোড</Label>
                    <p className="text-xs text-muted-foreground">রাতের জন্য উপযুক্ত থিম</p>
                  </div>
                  <Switch checked={false} disabled />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>অটো ব্যাকআপ</Label>
                    <p className="text-xs text-muted-foreground">স্বয়ংক্রিয় ডেটা সংরক্ষণ</p>
                  </div>
                  <Switch 
                    checked={autoBackup} 
                    onCheckedChange={setAutoBackup}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>ভাষা</Label>
                  <Button variant="outline" className="w-full justify-between">
                    বাংলা (ডিফল্ট)
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* App Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Info className="w-5 h-5 mr-2 text-primary" />
                  অ্যাপ তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">সংস্করণ</span>
                  <span>v১.০.০</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">সর্বশেষ আপডেট</span>
                  <span>{getBengaliDate(new Date())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ডেভেলপার</span>
                  <span>দোকান হিসাব টিম</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  নোটিফিকেশন সেটিংস
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS নোটিফিকেশন</Label>
                    <p className="text-xs text-muted-foreground">গুরুত্বপূর্ণ আপডেটের জন্য SMS</p>
                  </div>
                  <Switch 
                    checked={notifications} 
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>বিক্রয় রিমাইন্ডার</Label>
                    <p className="text-xs text-muted-foreground">দৈনিক বিক্রয় রিপোর্ট</p>
                  </div>
                  <Switch checked={true} />
                </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>স্টক সতর্কতা</Label>
                    <p className="text-xs text-muted-foreground">কম স্টক থাকলে জানান</p>
                  </div>
                  <Switch checked={true} />
                </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>পেমেন্ট রিমাইন্ডার</Label>
                    <p className="text-xs text-muted-foreground">বকেয়া পেমেন্টের জন্য</p>
                  </div>
                  <Switch checked={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Settings */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Database className="w-5 h-5 mr-2 text-primary" />
                  ডেটা ব্যবস্থাপনা
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  ডেটা এক্সপোর্ট করুন
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  ডেটা ইমপোর্ট করুন
                </Button>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">স্টোরেজ তথ্য</Label>
                  <div className="bg-muted rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ব্যবহৃত স্থান</span>
                      <span className="font-medium">২.৫ MB</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">১০ MB এর মধ্যে ২.৫ MB ব্যবহৃত</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Support & Help */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-primary" />
              সহায়তা ও সাপোর্ট
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <div className="text-left">
                <div className="font-medium">সহায়তা কেন্দ্র</div>
                <div className="text-xs text-muted-foreground">প্রায়শই জিজ্ঞাসিত প্রশ্ন</div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <div className="text-left">
                <div className="font-medium">যোগাযোগ করুন</div>
                <div className="text-xs text-muted-foreground">সাপোর্ট টিমের সাথে কথা বলুন</div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <div className="text-left">
                <div className="font-medium">মতামত পাঠান</div>
                <div className="text-xs text-muted-foreground">অ্যাপ উন্নতিতে সাহায্য করুন</div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card className="border-destructive/20">
          <CardContent className="pt-6">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleSignOut}
              data-testid="button-signout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              লগআউট
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}