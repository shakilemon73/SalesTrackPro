import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Mock user ID for demo
const DEMO_USER_ID = "demo-user-123";

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SalesModal({ isOpen, onClose }: SalesModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("নগদ");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers', DEMO_USER_ID],
    enabled: isOpen,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', DEMO_USER_ID],
    enabled: isOpen,
  });

  const createSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      return await apiRequest('POST', `/api/sales/${DEMO_USER_ID}`, saleData);
    },
    onSuccess: () => {
      toast({
        title: "সফল!",
        description: "বিক্রয় সফলভাবে সেভ হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      resetForm();
      onClose();
    },
    onError: () => {
      toast({
        title: "ত্রুটি!",
        description: "বিক্রয় সেভ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCustomerName("");
    setProductName("");
    setQuantity("1");
    setPrice("");
    setPaymentMethod("নগদ");
  };

  const handleSave = () => {
    if (!customerName || !productName || !quantity || !price) {
      toast({
        title: "অসম্পূর্ণ তথ্য!",
        description: "সব ক্ষেত্র পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = parseFloat(quantity) * parseFloat(price);
    const paidAmount = paymentMethod === "নগদ" ? totalAmount : 0;
    const dueAmount = totalAmount - paidAmount;

    const saleData = {
      customerName,
      totalAmount: totalAmount.toString(),
      paidAmount: paidAmount.toString(),
      dueAmount: dueAmount.toString(),
      paymentMethod,
      items: [
        {
          productName,
          quantity: parseInt(quantity),
          unitPrice: price,
          totalPrice: totalAmount.toString(),
        }
      ],
    };

    createSaleMutation.mutate(saleData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">দ্রুত বিক্রয়</h3>
          <button 
            className="text-gray-500 text-xl" 
            onClick={handleClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              গ্রাহকের নাম
            </Label>
            <Input
              type="text"
              placeholder="গ্রাহকের নাম লিখুন"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              পণ্যের নাম
            </Label>
            <Input
              type="text"
              placeholder="পণ্যের নাম লিখুন"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                পরিমাণ
              </Label>
              <Input
                type="number"
                placeholder="১"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="number-font"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                দাম
              </Label>
              <Input
                type="number"
                placeholder="০"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="number-font"
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              পেমেন্ট পদ্ধতি
            </Label>
            <div className="flex space-x-3">
              <Button
                type="button"
                className={`flex-1 ${paymentMethod === "নগদ" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => setPaymentMethod("নগদ")}
              >
                নগদ
              </Button>
              <Button
                type="button"
                className={`flex-1 ${paymentMethod === "বাকি" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => setPaymentMethod("বাকি")}
              >
                বাকি
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              বাতিল
            </Button>
            <Button
              type="button"
              className="flex-1 bg-primary"
              onClick={handleSave}
              disabled={createSaleMutation.isPending}
            >
              {createSaleMutation.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
