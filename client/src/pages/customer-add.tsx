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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/customers">
              <button className="p-2">
                <i className="fas fa-arrow-left"></i>
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">নতুন গ্রাহক যোগ করুন</h1>
              <p className="text-sm text-green-100">{getBengaliDate()}</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-user text-primary mr-2"></i>
              গ্রাহকের তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">গ্রাহকের নাম *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="গ্রাহকের পূর্ণ নাম লিখুন"
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone_number">ফোন নম্বর</Label>
              <Input
                id="phone_number"
                {...form.register('phone_number')}
                placeholder="০১৭১২৩৪৫৬১৮ (ঐচ্ছিক)"
                className="mt-1 number-font"
              />
              {form.formState.errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.phone_number.message}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                বাংলাদেশী মোবাইল নম্বর লিখুন (যেমন: ০১৭১২৩৪৫৬১৮)
              </p>
            </div>

            <div>
              <Label htmlFor="address">ঠিকানা</Label>
              <Textarea
                id="address"
                {...form.register('address')}
                placeholder="গ্রাহকের ঠিকানা লিখুন (ঐচ্ছিক)"
                className="mt-1"
                rows={3}
              />
              {form.formState.errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-info-circle text-primary mr-2"></i>
              অতিরিক্ত তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                <i className="fas fa-lightbulb mr-2"></i>
                গুরুত্বপূর্ণ তথ্য
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• গ্রাহক যোগ করার পর আপনি তাদের বাকি খাতা দেখতে পাবেন</li>
                <li>• ফোন নম্বর দিলে দ্রুত কল করতে পারবেন</li>
                <li>• ঠিকানা দিলে ডেলিভারি দিতে সুবিধা হবে</li>
                <li>• প্রয়োজনে পরে এই তথ্য পরিবর্তন করতে পারবেন</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Form Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-eye text-primary mr-2"></i>
              তথ্য পূর্বরূপ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-primary text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {form.watch('name') || 'গ্রাহকের নাম'}
                  </h3>
                  {form.watch('phone_number') && (
                    <p className="text-sm text-gray-600 number-font">
                      {form.watch('phone_number')}
                    </p>
                  )}
                  {form.watch('address') && (
                    <p className="text-xs text-gray-500 mt-1">
                      {form.watch('address')}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-success font-medium">
                  <i className="fas fa-check-circle mr-1"></i>
                  নতুন গ্রাহক
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pb-20">
          <Link to="/customers" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              <i className="fas fa-times mr-2"></i>
              বাতিল
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1 bg-primary"
            disabled={createCustomerMutation.isPending || !form.watch('name')}
          >
            {createCustomerMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                যোগ হচ্ছে...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus mr-2"></i>
                গ্রাহক যোগ করুন
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
