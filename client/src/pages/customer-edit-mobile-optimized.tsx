import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { CustomerDetailsSkeleton } from "@/components/loading-skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, Save, Trash2, User, Phone, MapPin, 
  AlertTriangle, Loader2
} from "lucide-react";

const customerEditSchema = z.object({
  name: z.string().min(1, "গ্রাহকের নাম আবশ্যক"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
});

type CustomerEditForm = z.infer<typeof customerEditSchema>;

interface CustomerEditMobileOptimizedProps {
  customerId: string;
}

export default function CustomerEditMobileOptimized({ customerId }: CustomerEditMobileOptimizedProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { userId, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: customer, isLoading: customerLoading, error: customerError } = useQuery({
    queryKey: ['customer', customerId, userId],
    queryFn: () => userId ? supabaseService.getCustomer(customerId, userId) : Promise.resolve(null),
    enabled: !!userId && !!customerId,
  });

  const form = useForm<CustomerEditForm>({
    resolver: zodResolver(customerEditSchema),
    defaultValues: {
      name: customer?.name || "",
      phone_number: customer?.phone_number || "",
      address: customer?.address || "",
    },
  });

  // Reset form when customer data loads
  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        phone_number: customer.phone_number || "",
        address: customer.address || "",
      });
    }
  }, [customer, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: CustomerEditForm) => {
      if (!userId) throw new Error("User not authenticated");
      return supabaseService.updateCustomer(customerId, data);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "গ্রাহকের তথ্য আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setLocation(`/customers/${customerId}`);
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি!",
        description: "গ্রাহকের তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      console.error("Customer update error:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      return supabaseService.deleteCustomer(customerId);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "গ্রাহক মুছে ফেলা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setLocation("/customers");
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি!",
        description: "গ্রাহক মুছে ফেলতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      console.error("Customer delete error:", error);
    },
  });

  const onSubmit = (data: CustomerEditForm) => {
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  // Show skeleton while auth or customer is loading
  if (authLoading || (!!userId && customerLoading)) {
    return <CustomerDetailsSkeleton />;
  }

  // Error state
  if (customerError || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2 bengali-font">
              গ্রাহক খুঁজে পাওয়া যায়নি
            </h1>
            <p className="text-gray-600 bengali-font mb-4">
              এই গ্রাহক বিদ্যমান নেই বা মুছে ফেলা হয়েছে।
            </p>
            <Link to="/customers">
              <Button className="w-full">গ্রাহক তালিকায় ফিরুন</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to={`/customers/${customerId}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white bengali-font">
                  গ্রাহক এডিট
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{customer.name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3 h-3 mr-1" />
                    মুছুন
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="bengali-font">গ্রাহক মুছে ফেলুন?</AlertDialogTitle>
                    <AlertDialogDescription className="bengali-font">
                      আপনি কি নিশ্চিত যে আপনি "{customer.name}" গ্রাহককে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bengali-font">বাতিল</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 bengali-font"
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          মুছে ফেলা হচ্ছে...
                        </>
                      ) : (
                        "হ্যাঁ, মুছে ফেলুন"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="px-4 py-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium bengali-font flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>গ্রাহকের নাম <span className="text-red-500">*</span></span>
                </Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="গ্রাহকের নাম লিখুন"
                  className="h-10"
                  data-testid="input-customer-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 bengali-font">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-medium bengali-font flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>ফোন নম্বর</span>
                </Label>
                <Input
                  id="phone_number"
                  {...form.register("phone_number")}
                  placeholder="০১৭XXXXXXXX"
                  className="h-10"
                  data-testid="input-customer-phone"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium bengali-font flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>ঠিকানা</span>
                </Label>
                <Textarea
                  id="address"
                  {...form.register("address")}
                  placeholder="গ্রাহকের ঠিকানা লিখুন"
                  rows={3}
                  className="resize-none"
                  data-testid="input-customer-address"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12"
                disabled={updateMutation.isPending}
                data-testid="button-save-customer"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    সংরক্ষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    পরিবর্তন সংরক্ষণ করুন
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}