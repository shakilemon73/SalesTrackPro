import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useOfflineAuth } from "@/hooks/use-offline-auth";
import { usePureOfflineCreateCustomer } from "@/hooks/use-pure-offline-data";
import { 
  ArrowLeft, User, Phone, MapPin, 
  Save, UserPlus, CheckCircle2
} from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(1, "গ্রাহকের নাম আবশ্যক"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomerAddMobileOptimizedOffline() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useOfflineAuth();
  const createCustomer = usePureOfflineCreateCustomer();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomer.mutateAsync(data);
      
      toast({
        title: "গ্রাহক যোগ করা হয়েছে",
        description: `${data.name} সফলভাবে যোগ করা হয়েছে`,
      });

      // Navigate back to customers list
      setLocation("/customers");
    } catch (error) {
      console.error("Customer creation failed:", error);
      toast({
        title: "ত্রুটি",
        description: "গ্রাহক যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">নতুন গ্রাহক</h1>
            <p className="text-xs text-gray-500">গ্রাহকের তথ্য দিন</p>
          </div>
        </div>
      </div>

      {/* Offline Status */}
      <div className="px-4 py-2 bg-green-50 border-b border-green-200">
        <div className="flex items-center gap-2 text-green-700 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          সম্পূর্ণ অফলাইন মোড - তথ্য আপনার ডিভাইসে সংরক্ষিত হবে
        </div>
      </div>

      {/* Form */}
      <div className="p-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
              গ্রাহকের তথ্য
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4" />
                  গ্রাহকের নাম *
                </label>
                <Input
                  {...register("name")}
                  placeholder="যেমন: আহমেদ সাহেব"
                  className="text-center"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4" />
                  মোবাইল নম্বর
                </label>
                <Input
                  {...register("phone_number")}
                  placeholder="01XXXXXXXXX"
                  className="text-center"
                  type="tel"
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-xs">{errors.phone_number.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4" />
                  ঠিকানা
                </label>
                <Textarea
                  {...register("address")}
                  placeholder="পূর্ণ ঠিকানা লিখুন..."
                  className="min-h-[80px]"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs">{errors.address.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Link href="/customers">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                  >
                    বাতিল
                  </Button>
                </Link>
                
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={createCustomer.isPending}
                >
                  {createCustomer.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      সংরক্ষণ করা হচ্ছে...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      সংরক্ষণ করুন
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">অফলাইন সুবিধা:</p>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>• ইন্টারনেট ছাড়াই গ্রাহক যোগ করুন</li>
                <li>• সব তথ্য আপনার ডিভাইসে নিরাপদ</li>
                <li>• পরে ইন্টারনেট সংযোগ হলে সিঙ্ক হবে</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}