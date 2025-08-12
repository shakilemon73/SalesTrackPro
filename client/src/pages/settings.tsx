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

  const settingsSections = [
    {
      title: "ব্যবসার তথ্য",
      icon: "fas fa-store",
      color: "blue",
      items: [
        {
          title: "দোকানের তথ্য",
          subtitle: "নাম, ঠিকানা ও যোগাযোগের তথ্য",
          icon: "fas fa-edit",
          action: () => setIsBusinessInfoOpen(true)
        }
      ]
    },
    {
      title: "অ্যাপ সেটিংস",
      icon: "fas fa-cog",
      color: "purple",
      items: [
        {
          title: "নোটিফিকেশন",
          subtitle: "বিক্রয় ও পেমেন্ট সতর্কতা",
          icon: "fas fa-bell",
          toggle: { value: notifications, onChange: setNotifications }
        },
        {
          title: "অটো ব্যাকআপ",
          subtitle: "স্বয়ংক্রিয় ডেটা সংরক্ষণ",
          icon: "fas fa-cloud-upload-alt",
          toggle: { value: autoBackup, onChange: setAutoBackup }
        },
        {
          title: "ডার্ক মোড",
          subtitle: "গাঢ় থিম ব্যবহার করুন",
          icon: "fas fa-moon",
          toggle: { value: darkMode, onChange: setDarkMode }
        }
      ]
    },
    {
      title: "ডেটা ম্যানেজমেন্ট",
      icon: "fas fa-database",
      color: "green",
      items: [
        {
          title: "ডেটা এক্সপোর্ট",
          subtitle: "সকল তথ্য ডাউনলোড করুন",
          icon: "fas fa-download",
          action: handleDataExport
        }
      ]
    },
    {
      title: "সাহায্য ও সাপোর্ট",
      icon: "fas fa-question-circle",
      color: "orange",
      items: [
        {
          title: "টিউটোরিয়াল",
          subtitle: "অ্যাপ ব্যবহারের নির্দেশনা",
          icon: "fas fa-play-circle",
          action: () => window.open('/tutorial', '_blank')
        },
        {
          title: "সাপোর্ট",
          subtitle: "সহায়তা ও যোগাযোগ",
          icon: "fas fa-life-ring",
          action: () => window.open('mailto:support@dokanhisab.com')
        }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-indigo-600 bg-blue-100 text-blue-600",
      purple: "from-purple-500 to-violet-600 bg-purple-100 text-purple-600", 
      green: "from-green-500 to-emerald-600 bg-green-100 text-green-600",
      orange: "from-orange-500 to-amber-600 bg-orange-100 text-orange-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-background-app">
      {/* Premium Header */}
      <div className="header-bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <button className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20">
                <i className="fas fa-arrow-left text-white"></i>
              </button>
            </Link>
            <div>
              <h1 className="heading-2 text-white mb-0.5">সেটিংস</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-white/90 bengali-font">{getBengaliDate()}</p>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-200 font-semibold">কনফিগারেশন</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105">
              <i className="fas fa-save mr-2"></i>
              সেভ
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 mobile-safe-area space-y-6">
        {/* User Profile Card */}
        <Card className="enhanced-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-user text-white text-2xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="heading-3 text-gray-900 mb-1 bengali-font">{businessInfo.ownerName}</h3>
                <p className="body-regular text-gray-600 bengali-font">{businessInfo.shopName}</p>
                <p className="caption text-gray-500">{businessInfo.address}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsBusinessInfoOpen(true)}
                className="bg-white/80 hover:bg-white border-blue-200 text-blue-700"
              >
                <i className="fas fa-edit mr-2"></i>
                সম্পাদনা
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="enhanced-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${getColorClasses(section.color).split(' ')[0]} ${getColorClasses(section.color).split(' ')[1]} rounded-xl flex items-center justify-center shadow-lg`}>
                  <i className={`${section.icon} text-white`}></i>
                </div>
                <h3 className="heading-3 text-gray-900 bengali-font">{section.title}</h3>
              </div>
              
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="setting-item">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${getColorClasses(section.color).split(' ')[2]} ${getColorClasses(section.color).split(' ')[3]} rounded-lg flex items-center justify-center`}>
                          <i className={`${item.icon} text-sm`}></i>
                        </div>
                        <div>
                          <p className="body-large font-semibold text-gray-900 bengali-font">{item.title}</p>
                          <p className="caption text-gray-500 bengali-font">{item.subtitle}</p>
                        </div>
                      </div>
                      
                      {item.toggle ? (
                        <Switch
                          checked={item.toggle.value}
                          onCheckedChange={item.toggle.onChange}
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={item.action}
                          className="hover:bg-gray-100"
                        >
                          <i className="fas fa-chevron-right text-gray-400"></i>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* App Info */}
        <Card className="enhanced-card bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <i className="fas fa-info-circle text-white text-xl"></i>
            </div>
            <h3 className="body-large font-semibold text-gray-900 bengali-font mb-2">দোকান হিসাব</h3>
            <p className="caption text-gray-500 bengali-font mb-2">সংস্করণ ১.০.০</p>
            <p className="caption text-gray-400 bengali-font">বাংলাদেশী ব্যবসায়ীদের জন্য তৈরি</p>
          </CardContent>
        </Card>
      </div>

      {/* Business Info Dialog */}
      <Dialog open={isBusinessInfoOpen} onOpenChange={setIsBusinessInfoOpen}>
        <DialogContent className="enhanced-dialog">
          <DialogHeader>
            <DialogTitle className="bengali-font">ব্যবসার তথ্য সম্পাদনা</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="bengali-font">দোকানের নাম</Label>
              <Input
                value={businessInfo.shopName}
                onChange={(e) => setBusinessInfo({...businessInfo, shopName: e.target.value})}
                className="enhanced-input mt-1"
              />
            </div>
            <div>
              <Label className="bengali-font">মালিকের নাম</Label>
              <Input
                value={businessInfo.ownerName}
                onChange={(e) => setBusinessInfo({...businessInfo, ownerName: e.target.value})}
                className="enhanced-input mt-1"
              />
            </div>
            <div>
              <Label className="bengali-font">ঠিকানা</Label>
              <Input
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                className="enhanced-input mt-1"
              />
            </div>
            <div>
              <Label className="bengali-font">ফোন নম্বর</Label>
              <Input
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                className="enhanced-input mt-1"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleBusinessInfoSave}
                className="action-btn action-btn-primary flex-1"
              >
                <i className="fas fa-save mr-2"></i>
                সংরক্ষণ করুন
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsBusinessInfoOpen(false)}
                className="flex-1"
              >
                বাতিল
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}