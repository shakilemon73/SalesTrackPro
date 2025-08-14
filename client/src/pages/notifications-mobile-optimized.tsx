/**
 * Notifications Page - Business Notifications & Alerts
 * Another test page to verify Android build scalability
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  MessageCircle,
  Smartphone,
  Mail,
  TrendingDown
} from 'lucide-react';
import { formatCurrency, toBengaliNumber } from '@/lib/bengali-utils';

interface Notification {
  id: string;
  type: 'payment' | 'stock' | 'sale' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'পেমেন্ট রিমাইন্ডার',
    message: 'রহিম উদ্দিন এর ৳৫,০০০ টাকা বাকি আছে। শেষ পেমেন্ট ১৫ দিন আগে।',
    time: '২ ঘন্টা আগে',
    read: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'stock',
    title: 'স্টক সতর্কতা',
    message: 'চাল (৫ কেজি) এর স্টক কম! বর্তমান স্টক: ৩ প্যাকেট',
    time: '৪ ঘন্টা আগে',
    read: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'sale',
    title: 'নতুন বিক্রয়',
    message: 'করিম সাহেব ৳২,৫০০ টাকার পণ্য কিনেছেন।',
    time: '৬ ঘন্টা আগে',
    read: true,
    priority: 'low'
  },
  {
    id: '4',
    type: 'reminder',
    title: 'দৈনিক রিপোর্ট',
    message: 'আজকের বিক্রয় রিপোর্ট তৈরি করার সময় হয়েছে।',
    time: '৮ ঘন্টা আগে',
    read: true,
    priority: 'medium'
  }
];

export default function NotificationsMobileOptimized() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState({
    paymentReminders: true,
    stockAlerts: true,
    salesNotifications: false,
    dailyReports: true,
    pushNotifications: true,
    smsNotifications: false,
    emailNotifications: true
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'stock': return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'sale': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'reminder': return <Clock className="h-5 w-5 text-blue-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BellRing className="h-6 w-6" />
              নোটিফিকেশন
            </h1>
            <p className="text-indigo-100 text-sm">
              {unreadCount > 0 ? `${toBengaliNumber(unreadCount.toString())} টি নতুন বার্তা` : 'সব বার্তা পড়া হয়েছে'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={markAllAsRead}
              className="bg-indigo-700 hover:bg-indigo-800"
            >
              সব পড়া হয়েছে
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">বার্তাসমূহ</TabsTrigger>
            <TabsTrigger value="settings">সেটিংস</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-4 mt-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{toBengaliNumber('2')}</p>
                  <p className="text-xs text-gray-600">জরুরি</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{toBengaliNumber('1')}</p>
                  <p className="text-xs text-gray-600">মাঝারি</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{toBengaliNumber('1')}</p>
                  <p className="text-xs text-gray-600">সাধারণ</p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`cursor-pointer transition-all ${
                    !notification.read 
                      ? `${getPriorityColor(notification.priority)} border-l-4` 
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-medium ${!notification.read ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <Badge variant="destructive" className="text-xs px-2 py-1">
                              নতুন
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {notification.time}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              notification.priority === 'high' 
                                ? 'border-red-300 text-red-600' 
                                : notification.priority === 'medium'
                                ? 'border-yellow-300 text-yellow-600'
                                : 'border-green-300 text-green-600'
                            }`}
                          >
                            {notification.priority === 'high' ? 'জরুরি' : 
                             notification.priority === 'medium' ? 'মাঝারি' : 'সাধারণ'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-4">
            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  নোটিফিকেশনের ধরন
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">পেমেন্ট রিমাইন্ডার</p>
                    <p className="text-sm text-gray-600">বাকি পেমেন্টের জন্য সতর্কতা</p>
                  </div>
                  <Switch 
                    checked={settings.paymentReminders}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, paymentReminders: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">স্টক সতর্কতা</p>
                    <p className="text-sm text-gray-600">কম স্টকের বিজ্ঞপ্তি</p>
                  </div>
                  <Switch 
                    checked={settings.stockAlerts}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, stockAlerts: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">বিক্রয় নোটিফিকেশন</p>
                    <p className="text-sm text-gray-600">নতুন বিক্রয়ের আপডেট</p>
                  </div>
                  <Switch 
                    checked={settings.salesNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, salesNotifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">দৈনিক রিপোর্ট</p>
                    <p className="text-sm text-gray-600">প্রতিদিনের সারসংক্ষেপ</p>
                  </div>
                  <Switch 
                    checked={settings.dailyReports}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, dailyReports: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">পৌঁছানোর মাধ্যম</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">পুশ নোটিফিকেশন</p>
                      <p className="text-sm text-gray-600">অ্যাপে সরাসরি বার্তা</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">SMS বার্তা</p>
                      <p className="text-sm text-gray-600">মোবাইলে টেক্সট মেসেজ</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, smsNotifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">ইমেইল</p>
                      <p className="text-sm text-gray-600">ইমেইলে বিস্তারিত রিপোর্ট</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}