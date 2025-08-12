import { Link } from "wouter";
import { getBengaliDate } from "@/lib/bengali-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";

export default function Settings() {
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

  // Get actual customer and sales data for statistics
  const { data: customers = [] } = useQuery({
    queryKey: ['customers', CURRENT_USER_ID],
    queryFn: () => supabaseService.getCustomers(CURRENT_USER_ID),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales', CURRENT_USER_ID],
    queryFn: () => supabaseService.getSales(CURRENT_USER_ID),
  });

  const handleBusinessInfoSave = () => {
    localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
    setIsBusinessInfoOpen(false);
    toast({
      title: "সফল",
      description: "ব্যবসার তথ্য সংরক্ষিত হয়েছে",
    });
  };

  const handleDataExport = () => {
    const exportData = {
      customers,
      sales,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dokan-hisab-backup-${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}.json`;
    link.click();
    
    toast({
      title: "সফল",
      description: "ডেটা এক্সপোর্ট সম্পন্ন হয়েছে",
    });
  };

  return (
    <div className="page-layout">
      {/* Modern Header with Status */}
      <div className="page-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="w-10 h-10">
                  <i className="fas fa-arrow-left text-slate-600"></i>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-900 bengali-font">সেটিংস</h1>
                <div className="text-sm text-slate-500 flex items-center space-x-2">
                  <span>{getBengaliDate()}</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">লাইভ</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDataExport}
              variant="outline"
              size="sm"
            >
              <i className="fas fa-download mr-2"></i>
              এক্সপোর্ট
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-content content-max-width">
        <div className="section-spacing">
          {/* Business Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-store text-blue-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 bengali-font">{businessInfo.shopName}</h3>
                    <p className="text-sm text-slate-500 bengali-font">{businessInfo.ownerName}</p>
                  </div>
                </div>
                <Dialog open={isBusinessInfoOpen} onOpenChange={setIsBusinessInfoOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <i className="fas fa-edit mr-2"></i>
                      সম্পাদনা
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="bengali-font">ব্যবসার তথ্য সম্পাদনা</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="shopName" className="bengali-font">দোকানের নাম</Label>
                        <Input
                          id="shopName"
                          value={businessInfo.shopName}
                          onChange={(e) => setBusinessInfo({...businessInfo, shopName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ownerName" className="bengali-font">মালিকের নাম</Label>
                        <Input
                          id="ownerName"
                          value={businessInfo.ownerName}
                          onChange={(e) => setBusinessInfo({...businessInfo, ownerName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address" className="bengali-font">ঠিকানা</Label>
                        <Input
                          id="address"
                          value={businessInfo.address}
                          onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="bengali-font">ফোন নম্বর</Label>
                        <Input
                          id="phone"
                          value={businessInfo.phone}
                          onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleBusinessInfoSave} className="w-full">
                        সংরক্ষণ করুন
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4 bengali-font">অ্যাপ সেটিংস</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 bengali-font">নোটিফিকেশন</p>
                    <p className="text-sm text-slate-500 bengali-font">বিক্রয় ও পেমেন্ট সতর্কতা</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 bengali-font">অটো ব্যাকআপ</p>
                    <p className="text-sm text-slate-500 bengali-font">স্বয়ংক্রিয় ডেটা সংরক্ষণ</p>
                  </div>
                  <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 bengali-font">ডার্ক মোড</p>
                    <p className="text-sm text-slate-500 bengali-font">গাঢ় থিম ব্যবহার করুন</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4 bengali-font">ডেটা ম্যানেজমেন্ট</h3>
              <div className="space-y-3">
                <Button onClick={handleDataExport} variant="outline" className="w-full justify-start">
                  <i className="fas fa-download mr-3"></i>
                  <div className="text-left">
                    <p className="font-medium bengali-font">ডেটা এক্সপোর্ট</p>
                    <p className="text-sm text-slate-500 bengali-font">সকল তথ্য ডাউনলোড করুন</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4 bengali-font">সাহায্য ও সাপোর্ট</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-play-circle mr-3"></i>
                  <div className="text-left">
                    <p className="font-medium bengali-font">টিউটোরিয়াল</p>
                    <p className="text-sm text-slate-500 bengali-font">অ্যাপ ব্যবহারের নির্দেশনা</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-life-ring mr-3"></i>
                  <div className="text-left">
                    <p className="font-medium bengali-font">সাপোর্ট</p>
                    <p className="text-sm text-slate-500 bengali-font">সহায়তা ও যোগাযোগ</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}