/**
 * Communication Panel Component
 * Unified interface for WhatsApp and SMS communication
 * Competitive feature matching TaliKhata's communication capabilities
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { whatsappManager } from '@/lib/whatsapp-business';
import { smsManager } from '@/lib/sms-api';
import { formatCurrency, toBengaliNumber } from '@/lib/bengali-utils';

interface CommunicationPanelProps {
  customerData?: {
    name: string;
    phone?: string;
    dueAmount?: number;
  };
  salesData?: {
    todaySales: number;
    totalSales: number;
    profit: number;
    pendingCollection: number;
    salesCount: number;
  };
  lowStockItems?: Array<{
    name: string;
    currentStock: number;
    minStock: number;
  }>;
}

export default function CommunicationPanel({ 
  customerData, 
  salesData, 
  lowStockItems = [] 
}: CommunicationPanelProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [messageType, setMessageType] = useState<'due_reminder' | 'sales_report' | 'stock_alert' | 'custom'>('due_reminder');
  const [communicationMethod, setCommunicationMethod] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  // Handle WhatsApp share
  const handleWhatsAppShare = async () => {
    setIsLoading(true);
    try {
      switch (messageType) {
        case 'sales_report':
          if (salesData) {
            whatsappManager.shareSalesReport(salesData);
            toast({
              title: "রিপোর্ট শেয়ার হয়েছে",
              description: "হোয়াটসঅ্যাপে বিক্রয় রিপোর্ট শেয়ার করা হয়েছে"
            });
          }
          break;
          
        case 'due_reminder':
          if (customerData && customerData.phone && customerData.dueAmount) {
            whatsappManager.sendDueReminder({
              customerName: customerData.name,
              dueAmount: customerData.dueAmount,
              lastSaleDate: new Date().toLocaleDateString('bn-BD'),
              customerPhone: customerData.phone
            });
            toast({
              title: "রিমাইন্ডার পাঠানো হয়েছে",
              description: `${customerData.name} কে বাকি টাকার রিমাইন্ডার পাঠানো হয়েছে`
            });
          }
          break;
          
        case 'stock_alert':
          if (lowStockItems.length > 0) {
            whatsappManager.shareStockAlert(lowStockItems);
            toast({
              title: "স্টক সতর্কতা পাঠানো হয়েছে",
              description: "স্টক কমে যাওয়ার সতর্কতা পাঠানো হয়েছে"
            });
          }
          break;
          
        case 'custom':
          if (customMessage.trim()) {
            const encodedMessage = encodeURIComponent(customMessage);
            window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
            toast({
              title: "কাস্টম বার্তা তৈরি",
              description: "আপনার বার্তা হোয়াটসঅ্যাপে প্রস্তুত"
            });
          }
          break;
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "বার্তা পাঠাতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle SMS send
  const handleSMSSend = async () => {
    setIsLoading(true);
    try {
      switch (messageType) {
        case 'due_reminder':
          if (customerData && customerData.phone && customerData.dueAmount) {
            const success = await smsManager.sendDueReminder(
              customerData.name,
              customerData.phone,
              customerData.dueAmount,
              "আপনার দোকান"
            );
            
            if (success) {
              toast({
                title: "SMS পাঠানো হয়েছে",
                description: `${customerData.name} কে বাকি টাকার রিমাইন্ডার SMS পাঠানো হয়েছে`
              });
            }
          }
          break;
          
        case 'stock_alert':
          if (lowStockItems.length > 0 && customerData?.phone) {
            const success = await smsManager.sendStockAlert(
              customerData.phone,
              lowStockItems,
              "দোকান মালিক"
            );
            
            if (success) {
              toast({
                title: "স্টক সতর্কতা SMS পাঠানো হয়েছে",
                description: "স্টক কমে যাওয়ার SMS সতর্কতা পাঠানো হয়েছে"
              });
            }
          }
          break;
          
        case 'custom':
          if (customMessage.trim() && customerData?.phone) {
            const success = await smsManager.sendSMS({
              to: customerData.phone,
              message: customMessage,
              type: 'due_reminder'
            });
            
            if (success) {
              toast({
                title: "কাস্টম SMS পাঠানো হয়েছে",
                description: "আপনার বার্তা SMS এ পাঠানো হয়েছে"
              });
            }
          }
          break;
      }
    } catch (error) {
      toast({
        title: "SMS ত্রুটি",
        description: "SMS পাঠাতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle send action
  const handleSend = () => {
    if (communicationMethod === 'whatsapp') {
      handleWhatsAppShare();
    } else {
      handleSMSSend();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 bengali-font">
          <i className="fas fa-comments text-primary"></i>
          <span>যোগাযোগ কেন্দ্র</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Communication Method Selection */}
        <div className="space-y-2">
          <Label className="bengali-font">যোগাযোগের মাধ্যম</Label>
          <Tabs value={communicationMethod} onValueChange={(value) => setCommunicationMethod(value as 'whatsapp' | 'sms')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
                <i className="fab fa-whatsapp text-green-600"></i>
                <span className="bengali-font">হোয়াটসঅ্যাপ</span>
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center space-x-2">
                <i className="fas fa-sms text-blue-600"></i>
                <span className="bengali-font">SMS</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Message Type Selection */}
        <div className="space-y-2">
          <Label className="bengali-font">বার্তার ধরন</Label>
          <Select value={messageType} onValueChange={(value) => setMessageType(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="বার্তার ধরন নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_reminder">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-bell text-orange-500"></i>
                  <span className="bengali-font">বাকি টাকার রিমাইন্ডার</span>
                </div>
              </SelectItem>
              <SelectItem value="sales_report">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-chart-line text-green-500"></i>
                  <span className="bengali-font">বিক্রয় রিপোর্ট</span>
                </div>
              </SelectItem>
              <SelectItem value="stock_alert">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-exclamation-triangle text-red-500"></i>
                  <span className="bengali-font">স্টক সতর্কতা</span>
                </div>
              </SelectItem>
              <SelectItem value="custom">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-edit text-blue-500"></i>
                  <span className="bengali-font">কাস্টম বার্তা</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preview Section */}
        <div className="space-y-2">
          <Label className="bengali-font">বার্তার পূর্বরূপ</Label>
          <div className="p-4 bg-muted rounded-lg border">
            {messageType === 'due_reminder' && customerData && (
              <div className="space-y-2">
                <p className="font-semibold bengali-font">বাকি টাকার রিমাইন্ডার</p>
                <p className="text-sm bengali-font">গ্রাহক: {customerData.name}</p>
                {customerData.dueAmount && (
                  <p className="text-sm bengali-font">বাকি টাকা: {formatCurrency(customerData.dueAmount)}</p>
                )}
              </div>
            )}
            
            {messageType === 'sales_report' && salesData && (
              <div className="space-y-2">
                <p className="font-semibold bengali-font">আজকের বিক্রয় রিপোর্ট</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="bengali-font">আজকের বিক্রয়: {formatCurrency(salesData.todaySales)}</span>
                  <span className="bengali-font">মোট লাভ: {formatCurrency(salesData.profit)}</span>
                  <span className="bengali-font">বাকি আদায়: {formatCurrency(salesData.pendingCollection)}</span>
                  <span className="bengali-font">লেনদেন: {toBengaliNumber(salesData.salesCount)}টি</span>
                </div>
              </div>
            )}
            
            {messageType === 'stock_alert' && lowStockItems.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold text-red-600 bengali-font">স্টক সতর্কতা</p>
                <div className="space-y-1">
                  {lowStockItems.slice(0, 3).map((item, index) => (
                    <p key={index} className="text-sm bengali-font">
                      • {item.name}: {toBengaliNumber(item.currentStock)}টি
                    </p>
                  ))}
                  {lowStockItems.length > 3 && (
                    <p className="text-sm text-muted-foreground bengali-font">
                      এবং আরো {toBengaliNumber(lowStockItems.length - 3)}টি পণ্য...
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {messageType === 'custom' && (
              <div className="space-y-2">
                <Label className="bengali-font">আপনার বার্তা লিখুন</Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="এখানে আপনার কাস্টম বার্তা লিখুন..."
                  className="min-h-[100px] bengali-font"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {communicationMethod === 'whatsapp' && (
              <Badge variant="secondary" className="bengali-font">
                <i className="fab fa-whatsapp mr-1"></i>
                হোয়াটসঅ্যাপে শেয়ার
              </Badge>
            )}
            {communicationMethod === 'sms' && (
              <Badge variant="secondary" className="bengali-font">
                <i className="fas fa-sms mr-1"></i>
                SMS পাঠান
              </Badge>
            )}
          </div>
          
          <Button 
            onClick={handleSend}
            disabled={isLoading || (messageType === 'custom' && !customMessage.trim())}
            className="bengali-font"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                পাঠানো হচ্ছে...
              </>
            ) : (
              <>
                <i className={`${communicationMethod === 'whatsapp' ? 'fab fa-whatsapp' : 'fas fa-sms'} mr-2`}></i>
                পাঠান
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <Label className="bengali-font mb-3 block">দ্রুত কাজ</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setMessageType('sales_report');
                setCommunicationMethod('whatsapp');
              }}
              className="bengali-font"
            >
              <i className="fas fa-chart-line mr-2"></i>
              দৈনিক রিপোর্ট
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setMessageType('due_reminder');
                setCommunicationMethod('sms');
              }}
              className="bengali-font"
            >
              <i className="fas fa-bell mr-2"></i>
              বাকি রিমাইন্ডার
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}