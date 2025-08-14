import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, toBengaliNumber } from "@/lib/bengali-utils";
import { useOfflineAuth } from "@/hooks/use-offline-auth";
import { usePureOfflineCustomers, usePureOfflineDeleteCustomer } from "@/hooks/use-pure-offline-data";
import { 
  Search, Plus, Phone, MapPin, ArrowLeft,
  Trash2, Edit, User, CreditCard, AlertCircle,
  Users, Filter, SortAsc, MoreVertical, Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomersMobileOptimizedOffline() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'credit' | 'recent'>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  
  const { user } = useOfflineAuth();
  const { data: customers = [], isLoading } = usePureOfflineCustomers();
  const deleteCustomer = usePureOfflineDeleteCustomer();

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => 
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone_number?.includes(searchQuery)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'credit':
          return (b.total_credit || 0) - (a.total_credit || 0);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${customerName}" গ্রাহককে মুছে দিতে চান?`)) {
      return;
    }

    try {
      await deleteCustomer.mutateAsync(customerId);
      toast({
        title: "গ্রাহক মুছে দেওয়া হয়েছে",
        description: `${customerName} সফলভাবে মুছে দেওয়া হয়েছে`,
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "গ্রাহক মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">গ্রাহক তালিকা</h1>
              <p className="text-xs text-gray-500">
                {toBengaliNumber(filteredCustomers.length)} জন গ্রাহক
              </p>
            </div>
          </div>
          <Link href="/customers/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              নতুন
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mt-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              ফিল্টার
            </Button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-2 py-1 border rounded bg-white"
            >
              <option value="recent">সাম্প্রতিক</option>
              <option value="name">নাম অনুযায়ী</option>
              <option value="credit">বাকি অনুযায়ী</option>
            </select>
          </div>
        </div>
      </div>

      {/* Offline Status */}
      <div className="px-4 py-2 bg-green-50 border-b border-green-200">
        <div className="flex items-center gap-2 text-green-700 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          সম্পূর্ণ অফলাইন মোড - সব তথ্য আপনার ডিভাইসে সংরক্ষিত
        </div>
      </div>

      {/* Customer List */}
      <div className="px-4 py-4 space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোন গ্রাহক নেই</h3>
            <p className="text-gray-500 mb-4">প্রথম গ্রাহক যোগ করে শুরু করুন</p>
            <Link href="/customers/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                নতুন গ্রাহক যোগ করুন
              </Button>
            </Link>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      {customer.total_credit > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          বাকি
                        </Badge>
                      )}
                    </div>

                    {customer.phone_number && (
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{customer.phone_number}</span>
                      </div>
                    )}

                    {customer.address && (
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 line-clamp-1">{customer.address}</span>
                      </div>
                    )}

                    {customer.total_credit > 0 && (
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-red-500" />
                        <span className="text-sm font-medium text-red-600">
                          বাকি: ৳{formatCurrency(customer.total_credit)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/customers/${customer.id}/edit`}>
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(customer.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}