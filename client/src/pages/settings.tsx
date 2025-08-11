import { Link } from "wouter";
import { getBengaliDate } from "@/lib/bengali-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingsSections = [
    {
      title: "ব্যবসার তথ্য",
      icon: "fas fa-store",
      items: [
        { label: "দোকানের নাম", value: "রহিম স্টোর", action: "edit" },
        { label: "মালিকের নাম", value: "রহিম উদ্দিন", action: "edit" },
        { label: "ঠিকানা", value: "ঢাকা, বাংলাদেশ", action: "edit" },
        { label: "ফোন নম্বর", value: "০১৭১২৩৪৫৬৭৮", action: "edit" }
      ]
    },
    {
      title: "অ্যাকাউন্ট সেটিংস",
      icon: "fas fa-user-cog",
      items: [
        { label: "পাসওয়ার্ড পরিবর্তন", action: "navigate" },
        { label: "প্রোফাইল আপডেট", action: "navigate" },
        { label: "অ্যাকাউন্ট ডিলিট", action: "danger" }
      ]
    },
    {
      title: "প্রিন্ট সেটিংস",
      icon: "fas fa-print",
      items: [
        { label: "প্রিন্টার সংযোগ", action: "navigate" },
        { label: "বিল টেমপ্লেট", action: "navigate" },
        { label: "কাগজের সাইজ", value: "A4", action: "select" },
        { label: "ভাষা", value: "বাংলা", action: "select" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <button className="p-2">
                <i className="fas fa-arrow-left"></i>
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">সেটিংস</h1>
              <p className="text-sm text-green-100">{getBengaliDate()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* App Preferences */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-cog text-primary mr-2"></i>
              অ্যাপ পছন্দসমূহ
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">নোটিফিকেশন</p>
                  <p className="text-sm text-gray-600">বিক্রয় ও স্টক সম্পর্কে জানান</p>
                </div>
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">অটো ব্যাকআপ</p>
                  <p className="text-sm text-gray-600">প্রতিদিন ডেটা সংরক্ষণ</p>
                </div>
                <Switch 
                  checked={autoBackup} 
                  onCheckedChange={setAutoBackup}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ডার্ক মোড</p>
                  <p className="text-sm text-gray-600">রাতের জন্য অন্ধকার থিম</p>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <i className={`${section.icon} text-primary mr-2`}></i>
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      {item.value && (
                        <p className="text-sm text-gray-600">{item.value}</p>
                      )}
                    </div>
                    {item.action === "edit" && (
                      <Button variant="outline" size="sm">
                        <i className="fas fa-edit"></i>
                      </Button>
                    )}
                    {item.action === "navigate" && (
                      <Button variant="outline" size="sm">
                        <i className="fas fa-chevron-right"></i>
                      </Button>
                    )}
                    {item.action === "select" && (
                      <Button variant="outline" size="sm">
                        <i className="fas fa-chevron-down"></i>
                      </Button>
                    )}
                    {item.action === "danger" && (
                      <Button variant="destructive" size="sm">
                        <i className="fas fa-trash"></i>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Data Management */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-database text-primary mr-2"></i>
              ডেটা ব্যবস্থাপনা
            </h2>
            <div className="space-y-3">
              <Button className="w-full bg-success" variant="outline">
                <i className="fas fa-download mr-2"></i>
                ডেটা এক্সপোর্ট করুন
              </Button>
              <Button className="w-full bg-warning text-white" variant="outline">
                <i className="fas fa-upload mr-2"></i>
                ডেটা ইমপোর্ট করুন
              </Button>
              <Button className="w-full bg-primary" variant="outline">
                <i className="fas fa-sync mr-2"></i>
                ব্যাকআপ তৈরি করুন
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-info-circle text-primary mr-2"></i>
              অ্যাপ সম্পর্কে
            </h2>
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center space-x-2">
                <i className="fas fa-store text-primary text-2xl"></i>
                <h3 className="text-xl font-bold text-primary">দোকান হিসাব</h3>
              </div>
              <p className="text-gray-600">
                বাংলাদেশী দোকানদারদের জন্য সম্পূর্ণ ব্যবসা ব্যবস্থাপনা সমাধান
              </p>
              <p className="text-sm text-gray-500">
                সংস্করণ: ১.০.০
              </p>
              <div className="flex justify-center space-x-4 pt-4">
                <Button variant="outline" size="sm">
                  <i className="fas fa-star mr-2"></i>
                  রেটিং দিন
                </Button>
                <Button variant="outline" size="sm">
                  <i className="fas fa-share mr-2"></i>
                  শেয়ার করুন
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-headset text-primary mr-2"></i>
              সহায়তা ও যোগাযোগ
            </h2>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <i className="fas fa-question-circle mr-2"></i>
                সাহায্য ও নির্দেশনা
              </Button>
              <Button className="w-full" variant="outline">
                <i className="fas fa-envelope mr-2"></i>
                আমাদের সাথে যোগাযোগ
              </Button>
              <Button className="w-full" variant="outline">
                <i className="fas fa-file-alt mr-2"></i>
                গোপনীয়তা নীতি
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
