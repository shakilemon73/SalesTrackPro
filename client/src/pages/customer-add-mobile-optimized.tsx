import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isValidBengaliPhone } from "@/lib/bengali-utils";
import { supabaseService } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { 
  ArrowLeft, UserPlus, User, Phone, MapPin, 
  Check, AlertCircle, Save
} from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(1, "গ্রাহকের নাম আবশ্যক"),
  phone_number: z.string().optional().refine((phone) => {
    if (!phone || phone.trim() === "") return true;
    return isValidBengaliPhone(phone);
  }, "সঠিক ফোন নম্বর লিখুন"),
  address: z.string().optional(),
});

export default function CustomerAddMobileOptimized() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      address: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return await supabaseService.createCustomer(userId, customerData);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "গ্রাহক সফলভাবে যোগ করা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setLocation("/customers");
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "গ্রাহক যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof customerSchema>) => {
    const customerData = {
      name: data.name.trim(),
      phone_number: data.phone_number?.trim() || undefined,
      address: data.address?.trim() || undefined,
    };
    
    createCustomerMutation.mutate(customerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      
      {/* Compact Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/customers">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  নতুন গ্রাহক
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <UserPlus className="w-3 h-3" />
                  <span>গ্রাহক তথ্য এন্ট্রি</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Customer Information */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 bengali-font">
                  নতুন গ্রাহকের তথ্য দিন
                </p>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900 dark:text-white bengali-font flex items-center space-x-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>গ্রাহকের নাম *</span>
                </Label>
                <Input
                  {...form.register("name")}
                  placeholder="উদাহরণ: আব্দুল করিম"
                  className="h-12 text-sm bengali-font"
                  autoFocus
                />
                {form.formState.errors.name && (
                  <div className="flex items-center space-x-1 text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    <p className="text-xs bengali-font">
                      {form.formState.errors.name.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900 dark:text-white bengali-font flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>ফোন নম্বর</span>
                </Label>
                <Input
                  {...form.register("phone_number")}
                  placeholder="উদাহরণ: ০১৭১২৩৪৫৆৭৮"
                  className="h-12 text-sm"
                  type="tel"
                />
                {form.formState.errors.phone_number && (
                  <div className="flex items-center space-x-1 text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    <p className="text-xs bengali-font">
                      {form.formState.errors.phone_number.message}
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500 bengali-font">
                  ঐচ্ছিক: SMS বার্তা পাঠানোর জন্য
                </p>
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900 dark:text-white bengali-font flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>ঠিকানা</span>
                </Label>
                <Textarea
                  {...form.register("address")}
                  placeholder="উদাহরণ: ১২৩/এ, ঢাকা-১০০০"
                  className="min-h-[80px] text-sm bengali-font"
                  rows={3}
                />
                <p className="text-xs text-slate-500 bengali-font">
                  ঐচ্ছিক: ডেলিভারির জন্য
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="border-0 shadow-md bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-200 bengali-font">
                  <p className="font-medium mb-1">গ্রাহক যোগ করার সুবিধা:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• দ্রুত বিক্রয় এন্ট্রি</li>
                    <li>• বাকি টাকার হিসাব রাখা</li>
                    <li>• গ্রাহক ইতিহাস দেখা</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
              disabled={createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="bengali-font">সেভ করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span className="bengali-font">গ্রাহক সংরক্ষণ করুন</span>
                </>
              )}
            </Button>

            <Link to="/customers">
              <Button 
                type="button"
                variant="outline"
                className="w-full h-10 bengali-font"
              >
                বাতিল করুন
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}