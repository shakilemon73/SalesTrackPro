import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, ArrowLeft, Search, Package, Users, 
  BarChart3, ShoppingCart, MessageCircle 
} from 'lucide-react';

export default function NotFoundMobileOptimized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Main Error Display */}
      <div className="text-center mb-8">
        <div className="text-8xl font-bold text-blue-200 mb-4">৪০৪</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 bengali-font">
          পেইজ খুঁজে পাওয়া যায়নি
        </h1>
        <p className="text-gray-600 bengali-font">
          আপনি যে পেইজটি খুঁজছেন সেটি আর নেই বা ভুল ঠিকানা দিয়েছেন
        </p>
      </div>

      {/* Quick Navigation Options */}
      <Card className="w-full max-w-md bg-white border-0 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 bengali-font text-center">
            দ্রুত নেভিগেশন
          </h2>
          
          <div className="space-y-3">
            {/* Main Dashboard */}
            <Link to="/">
              <Button className="w-full flex items-center justify-start space-x-3 bg-blue-600 hover:bg-blue-700 h-12">
                <Home className="w-5 h-5" />
                <span className="bengali-font">মূল ড্যাশবোর্ড</span>
              </Button>
            </Link>

            {/* Core Features */}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/sales/new">
                <Button variant="outline" className="w-full flex flex-col items-center space-y-1 h-16">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  <span className="text-xs bengali-font">নতুন বিক্রয়</span>
                </Button>
              </Link>
              
              <Link to="/customers">
                <Button variant="outline" className="w-full flex flex-col items-center space-y-1 h-16">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-xs bengali-font">গ্রাহক তালিকা</span>
                </Button>
              </Link>
              
              <Link to="/inventory">
                <Button variant="outline" className="w-full flex flex-col items-center space-y-1 h-16">
                  <Package className="w-5 h-5 text-orange-600" />
                  <span className="text-xs bengali-font">স্টক দেখুন</span>
                </Button>
              </Link>
              
              <Link to="/reports">
                <Button variant="outline" className="w-full flex flex-col items-center space-y-1 h-16">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs bengali-font">রিপোর্ট</span>
                </Button>
              </Link>
            </div>

            {/* Advanced Features */}
            <div className="border-t pt-3 mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2 bengali-font">উন্নত ফিচার:</p>
              <div className="grid grid-cols-3 gap-2">
                <Link to="/analytics">
                  <Button variant="ghost" size="sm" className="w-full flex flex-col items-center space-y-1 h-12 border border-blue-200">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs bengali-font">অ্যানালিটিক্স</span>
                  </Button>
                </Link>
                
                <Link to="/smart-inventory">
                  <Button variant="ghost" size="sm" className="w-full flex flex-col items-center space-y-1 h-12 border border-purple-200">
                    <Search className="w-4 h-4 text-purple-600" />
                    <span className="text-xs bengali-font">স্মার্ট স্টক</span>
                  </Button>
                </Link>
                
                <Link to="/loyalty">
                  <Button variant="ghost" size="sm" className="w-full flex flex-col items-center space-y-1 h-12 border border-yellow-200">
                    <MessageCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs bengali-font">লয়ালটি</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 bengali-font">
          সমস্যা অব্যাহত থাকলে সাপোর্ট টিমের সাথে যোগাযোগ করুন
        </p>
      </div>
    </div>
  );
}