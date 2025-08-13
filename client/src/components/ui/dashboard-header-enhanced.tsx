import { Bell, Settings, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toBengaliNumber, formatCurrency, getBengaliDate } from "@/lib/bengali-utils";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  timeOfDay: string;
  stats?: {
    todaySales: number;
    todayProfit: number;
    pendingCollection: number;
    salesCount: number;
  };
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function DashboardHeaderEnhanced({ 
  timeOfDay, 
  stats, 
  isLoading, 
  onRefresh 
}: DashboardHeaderProps) {
  const salesGrowth = stats?.todaySales && stats.todaySales > 0 ? 12.5 : 0;
  
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-50 via-white to-green-50 backdrop-blur-xl border-b border-emerald-100 shadow-sm">
      {/* Ultra-Compact Header for Mobile */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Enhanced Bengali Shop Identity */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              {/* Modern Bengali Shop Symbol */}
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-white text-lg font-bold bengali-font">দো</div>
              </div>
              {/* Business Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-slate-800 bengali-font leading-tight">
                {timeOfDay}! 🌟
              </h1>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <span className="bengali-font">📅 {getBengaliDate()}</span>
                {stats?.salesCount && (
                  <Badge variant="secondary" className="px-1.5 py-0.5 text-[9px] bg-emerald-50 text-emerald-700">
                    {toBengaliNumber(stats.salesCount)} বিক্রয়
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Compact Action Buttons */}
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50 relative"
            >
              <Bell className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </Button>
          </div>
        </div>
      </div>


    </div>
  );
}