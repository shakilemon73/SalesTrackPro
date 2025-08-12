import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundMobileOptimized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      {/* Mobile-First Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">পেজ খুঁজে পাওয়া যায়নি</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border border-gray-200 shadow-lg">
          <CardContent className="p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            {/* Error Code */}
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-gray-900 bengali-font mb-2">৪০৪</h1>
              <h2 className="text-xl font-semibold text-gray-800 bengali-font">পেজ পাওয়া যায়নি</h2>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-600 bengali-font leading-relaxed">
                দুঃখিত! আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি। এটি মুছে ফেলা হয়েছে, নাম পরিবর্তন করা হয়েছে, অথবা সাময়িকভাবে অনুপলব্ধ।
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link to="/">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3">
                  <Home className="w-5 h-5 mr-2" />
                  হোম পেজে যান
                </Button>
              </Link>
              
              <Link to="/transactions">
                <Button variant="outline" className="w-full rounded-full py-3">
                  <Search className="w-5 h-5 mr-2" />
                  লেনদেন দেখুন
                </Button>
              </Link>
            </div>

            {/* Quick Navigation */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 bengali-font mb-4">জনপ্রিয় পেজসমূহ:</p>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/customers">
                  <Button variant="ghost" size="sm" className="w-full text-sm bengali-font">
                    গ্রাহক তালিকা
                  </Button>
                </Link>
                <Link to="/inventory">
                  <Button variant="ghost" size="sm" className="w-full text-sm bengali-font">
                    স্টক ম্যানেজমেন্ট
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button variant="ghost" size="sm" className="w-full text-sm bengali-font">
                    রিপোর্ট
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" size="sm" className="w-full text-sm bengali-font">
                    সেটিংস
                  </Button>
                </Link>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 bengali-font">
                সাহায্যের প্রয়োজন হলে সেটিংস পেজে যোগাযোগ করুন।
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Info */}
      <div className="p-4 pb-24">
        <div className="text-center">
          <p className="text-xs text-gray-500 bengali-font">
            দোকান হিসাব - আপনার ব্যবসার সম্পূর্ণ সমাধান
          </p>
        </div>
      </div>
    </div>
  );
}