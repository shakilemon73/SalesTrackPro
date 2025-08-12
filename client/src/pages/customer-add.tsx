import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getBengaliDate, isValidBengaliPhone } from "@/lib/bengali-utils";
import { supabaseService, CURRENT_USER_ID } from "@/lib/supabase";

const customerSchema = z.object({
  name: z.string().min(1, "গ্রাহকের নাম আবশ্যক"),
  phone_number: z.string().optional().refine((phone) => {
    if (!phone || phone.trim() === "") return true;
    return isValidBengaliPhone(phone);
  }, "সঠিক ফোন নম্বর লিখুন"),
  address: z.string().optional(),
});

export default function CustomerAdd() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      return await supabaseService.createCustomer(CURRENT_USER_ID, customerData);
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
    <div className="min-h-screen bg-background-app">
      {/* Premium Header */}
      <div className="header-bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/customers">
              <button className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/20">
                <i className="fas fa-arrow-left text-white"></i>
              </button>
            </Link>
            <div>
              <h1 className="heading-2 text-white mb-0.5">নতুন গ্রাহক</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-white/90 bengali-font">{getBengaliDate()}</p>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-200 font-semibold">নতুন এন্ট্রি</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              form="customer-form"
              type="submit"
              disabled={createCustomerMutation.isPending}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              {createCustomerMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-user-plus mr-2"></i>
              )}
              যোগ করুন
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 mobile-safe-area">
        <form id="customer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <Card className="enhanced-card">
            <CardHeader className="enhanced-card-header">
              <CardTitle className="flex items-center bengali-font">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-user text-blue-600"></i>
                </div>
                গ্রাহকের তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="bengali-font">গ্রাহকের নাম *</Label>
                <Input
                  {...form.register("name")}
                  placeholder="গ্রাহকের পূর্ণ নাম লিখুন..."
                  className="enhanced-input mt-1"
                  autoFocus
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1 bengali-font">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="bengali-font">ফোন নম্বর</Label>
                <Input
                  {...form.register("phone_number")}
                  placeholder="০১৭১২৩৪৫৬৭৮"
                  className="enhanced-input mt-1"
                  type="tel"
                />
                {form.formState.errors.phone_number && (
                  <p className="text-sm text-red-600 mt-1 bengali-font">
                    {form.formState.errors.phone_number.message}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1 bengali-font">
                  ঐচ্ছিক - যোগাযোগের জন্য
                </p>
              </div>

              <div>
                <Label className="bengali-font">ঠিকানা</Label>
                <Textarea
                  {...form.register("address")}
                  placeholder="গ্রাহকের ঠিকানা লিখুন..."
                  className="enhanced-input mt-1 min-h-[100px]"
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1 bengali-font">
                  ঐচ্ছিক - ডেলিভারি বা যোগাযোগের জন্য
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="enhanced-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="flex items-center heading-3 text-blue-900 mb-4 bengali-font">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                  <i className="fas fa-lightbulb text-blue-600 text-sm"></i>
                </div>
                সহায়ক তথ্য
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="body-regular text-blue-800 bengali-font">
                    গ্রাহকের নাম অবশ্যই দিতে হবে
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="body-regular text-blue-800 bengali-font">
                    ফোন নম্বর দিলে সহজে যোগাযোগ করতে পারবেন
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="body-regular text-blue-800 bengali-font">
                    ঠিকানা দিলে ডেলিভারি সুবিধা হবে
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="responsive-grid-2 gap-4">
            <Link to="/sales/new">
              <Card className="enhanced-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-shopping-cart text-green-600 text-xl"></i>
                  </div>
                  <h3 className="body-large font-semibold text-gray-900 bengali-font">বিক্রয় করুন</h3>
                  <p className="caption text-gray-500 bengali-font">নতুন বিক্রয় এন্ট্রি</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/customers">
              <Card className="enhanced-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-users text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="body-large font-semibold text-gray-900 bengali-font">গ্রাহক তালিকা</h3>
                  <p className="caption text-gray-500 bengali-font">সব গ্রাহক দেখুন</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}