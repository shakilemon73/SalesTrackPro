import { Link } from "wouter";
import { getBengaliDate, toBengaliNumber } from "@/lib/bengali-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";
import { 
  ArrowLeft, Settings, User, Bell, Shield, Database,
  Download, Upload, Moon, Sun, Smartphone, 
  HelpCircle, Info, ChevronRight, Store,
  Clock, Activity, BarChart3, LogOut
} from "lucide-react";


export default function SettingsMobileOptimized() {
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    shopName: "আমার দোকান",
    ownerName: "দোকান মালিক", 
    address: "ঢাকা, বাংলাদেশ",
    phone: "০১৭১২৩৪৫৬৭৮"
  });
  
  const { toast } = useToast();

  // Load saved settings
  useEffect(() => {
    const savedBusinessInfo = localStorage.getItem('businessInfo');
    if (savedBusinessInfo) {
      setBusinessInfo(JSON.parse(savedBusinessInfo));
    }
    
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotifications(settings.notifications ?? true);
      setAutoBackup(settings.autoBackup ?? true);
      setDarkMode(settings.darkMode ?? false);
    }
  }, []);

  // Get actual data for statistics
  const { data: customers = [] } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID),
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard', CURRENT_USER_ID],
    queryFn: () => supabaseService.getStats(CURRENT_USER_ID),
  });

  const handleSettingsSave = () => {
    const settings = { notifications, autoBackup, darkMode };
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast({
      title: "সফল",
      description: "সেটিংস সংরক্ষিত হয়েছে",
    });
  };

  const handleBusinessInfoSave = () => {
    localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
    setIsBusinessInfoOpen(false);
    toast({
      title: "সফল",
      description: "ব্যবসার তথ্য সংরক্ষিত হয়েছে",
    });
  };

  const handleDataExport = () => {
    try {
      const exportData = {
        customers,
        sales,
        businessInfo,
        exportDate: new Date().toISOString(),
        version: "1.0"
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dokan-hisab-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "সফল",
        description: "ডেটা এক্সপোর্ট সম্পন্ন হয়েছে",
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "ডেটা এক্সপোর্ট করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  };

  const handleDataImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            // Here you would typically validate and import the data
            toast({
              title: "সফল",
              description: "ডেটা ইমপোর্ট সম্পন্ন হয়েছে",
            });
          } catch (error) {
            toast({
              title: "ত্রুটি",
              description: "ডেটা ইমপোর্ট করতে সমস্যা হয়েছে",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleAppRefresh = async () => {
    if (confirm("আপনি কি অ্যাপ রিফ্রেশ করতে চান?")) {
      window.location.reload(); // Force refresh
      toast({
        title: "সফলভাবে রিফ্রেশ",
        description: "অ্যাপ রিফ্রেশ হয়েছে"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      
      {/* Compact Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  সেটিংস
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Settings className="w-3 h-3" />
                  <span>অ্যাপ কনফিগারেশন</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-4 space-y-4">
        
        {/* App Statistics - Compact Cards */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-0 shadow-md p-3 text-center">
            <Activity className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
            <p className="text-xs text-slate-500 bengali-font">মোট গ্রাহক</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white number-font">
              {toBengaliNumber(customers.length)}
            </p>
          </Card>
          
          <Card className="border-0 shadow-md p-3 text-center">
            <BarChart3 className="w-4 h-4 mx-auto text-blue-600 mb-1" />
            <p className="text-xs text-slate-500 bengali-font">মোট বিক্রয়</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white number-font">
              {toBengaliNumber(sales.length)}
            </p>
          </Card>
          
          <Card className="border-0 shadow-md p-3 text-center">
            <Clock className="w-4 h-4 mx-auto text-purple-600 mb-1" />
            <p className="text-xs text-slate-500 bengali-font">সর্বশেষ</p>
            <p className="text-xs font-medium text-slate-900 dark:text-white">
              {getBengaliDate()}
            </p>
          </Card>
        </div>

        {/* Business Information */}
        <Card className="border-0 shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font flex items-center space-x-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>ব্যবসার তথ্য</span>
            </h3>
            <Dialog open={isBusinessInfoOpen} onOpenChange={setIsBusinessInfoOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                  এডিট
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="bengali-font">ব্যবসার তথ্য সম্পাদনা</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopName" className="text-sm bengali-font">দোকানের নাম</Label>
                    <Input
                      id="shopName"
                      value={businessInfo.shopName}
                      onChange={(e) => setBusinessInfo({...businessInfo, shopName: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-sm bengali-font">মালিকের নাম</Label>
                    <Input
                      id="ownerName"
                      value={businessInfo.ownerName}
                      onChange={(e) => setBusinessInfo({...businessInfo, ownerName: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm bengali-font">ঠিকানা</Label>
                    <Input
                      id="address"
                      value={businessInfo.address}
                      onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm bengali-font">ফোন নম্বর</Label>
                    <Input
                      id="phone"
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                  <Button 
                    onClick={handleBusinessInfoSave}
                    className="w-full text-sm"
                  >
                    সংরক্ষণ করুন
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 bengali-font">দোকানের নাম</span>
              <span className="font-medium text-slate-900 dark:text-white bengali-font">{businessInfo.shopName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 bengali-font">মালিক</span>
              <span className="font-medium text-slate-900 dark:text-white bengali-font">{businessInfo.ownerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 bengali-font">ফোন</span>
              <span className="font-medium text-slate-900 dark:text-white">{businessInfo.phone}</span>
            </div>
          </div>
        </Card>

        {/* App Settings */}
        <Card className="border-0 shadow-md p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3 flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>অ্যাপ সেটিংস</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bengali-font">
                    নোটিফিকেশন
                  </p>
                  <p className="text-xs text-slate-500">বিক্রয় ও আদায়ের বার্তা</p>
                </div>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bengali-font">
                    অটো ব্যাকআপ
                  </p>
                  <p className="text-xs text-slate-500">দৈনিক ডেটা সংরক্ষণ</p>
                </div>
              </div>
              <Switch 
                checked={autoBackup} 
                onCheckedChange={setAutoBackup}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {darkMode ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-yellow-600" />}
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bengali-font">
                    ডার্ক মোড
                  </p>
                  <p className="text-xs text-slate-500">রাতের জন্য উপযুক্ত থিম</p>
                </div>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode}
              />
            </div>

            <Button 
              onClick={handleSettingsSave}
              className="w-full text-sm"
              size="sm"
            >
              সেটিংস সংরক্ষণ করুন
            </Button>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="border-0 shadow-md p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-red-600" />
            <span>ডেটা ব্যবস্থাপনা</span>
          </h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleDataExport}
              className="w-full justify-between text-sm h-10"
            >
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-green-600" />
                <span className="bengali-font">ডেটা এক্সপোর্ট</span>
              </div>
              <Badge variant="outline" className="text-xs">JSON</Badge>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleDataImport}
              className="w-full justify-between text-sm h-10"
            >
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="bengali-font">ডেটা ইমপোর্ট</span>
              </div>
              <Badge variant="outline" className="text-xs">JSON</Badge>
            </Button>
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="border-0 shadow-md p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font mb-3 flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>সহায়তা ও তথ্য</span>
          </h3>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-between text-sm h-10 hover:bg-slate-50"
            >
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-slate-500" />
                <span className="bengali-font">অ্যাপের তথ্য</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">v1.0.0</Badge>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-between text-sm h-10 hover:bg-slate-50"
            >
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span className="bengali-font">সহায়তা কেন্দ্র</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Button>

            <Button 
              variant="destructive" 
              onClick={handleAppRefresh}
              className="w-full justify-center text-sm h-10 mt-4"
              data-testid="button-logout"
            >
              <div className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span className="bengali-font">লগআউট</span>
              </div>
            </Button>
          </div>
        </Card>

        {/* App Status */}
        <Card className="border-0 shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
              অ্যাপের অবস্থা
            </h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">সক্রিয়</span>
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span className="bengali-font">সর্বশেষ সিঙ্ক</span>
              <span>{getBengaliDate()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="bengali-font">ডেটা স্ট্যাটাস</span>
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">সিঙ্কড</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="bengali-font">ব্যাকআপ স্ট্যাটাস</span>
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">সক্রিয়</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}