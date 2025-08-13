import { useLocation } from "wouter";
import { Link } from "wouter";
import { Home, ArrowLeftRight, Users, BarChart3, Package } from "lucide-react";
import { androidHapticFeedback, androidClasses } from "@/lib/android-optimizations";

const navItems = [
  { 
    path: "/", 
    icon: Home, 
    label: "হোম", 
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    activeColor: "bg-emerald-600"
  },
  { 
    path: "/inventory", 
    icon: Package, 
    label: "স্টক", 
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    activeColor: "bg-blue-600"
  },
  { 
    path: "/transactions", 
    icon: ArrowLeftRight, 
    label: "লেনদেন", 
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    activeColor: "bg-indigo-600"
  },
  { 
    path: "/customers", 
    icon: Users, 
    label: "গ্রাহক", 
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    activeColor: "bg-purple-600"
  },
  { 
    path: "/reports", 
    icon: BarChart3, 
    label: "রিপোর্ট", 
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    activeColor: "bg-orange-600"
  },
];

export default function BottomNavigationOptimized() {
  const [location] = useLocation();

  const handleNavClick = () => {
    androidHapticFeedback('light');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Professional Bottom Navigation with Material Design 3 */}
      <div className="bg-white/98 backdrop-blur-xl border-t border-slate-200/60 shadow-2xl">
        <div className="w-full">
          <div className="grid grid-cols-5 gap-1 px-3 py-2">
            {navItems.map((item, index) => {
              const isActive = location === item.path;
              const IconComponent = item.icon;
              
              return (
                <Link key={item.path} to={item.path}>
                  <button 
                    onClick={handleNavClick}
                    className={`
                      relative flex flex-col items-center justify-center w-full
                      py-3 px-2 rounded-2xl transition-all duration-300 ease-out
                      touch-manipulation active:scale-95 min-h-[60px]
                      ${isActive 
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg scale-105' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                      }
                    `}
                    style={{ minHeight: '60px', minWidth: '60px' }}
                  >
                    {/* Enhanced Icon with better spacing */}
                    <IconComponent 
                      size={22} 
                      className={`
                        transition-all duration-300 mb-1
                        ${isActive ? 'text-white scale-110' : 'text-current'}
                      `} 
                    />
                    
                    {/* Enhanced Label with better typography */}
                    <span className={`
                      text-[10px] font-semibold bengali-font transition-all duration-300 leading-tight
                      ${isActive ? 'text-white' : 'text-current'}
                    `}>
                      {item.label}
                    </span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-80" />
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom safe area with proper spacing */}
        <div className="h-4 bg-white/98"></div>
        <div style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }} className="bg-white/98"></div>
      </div>

    </div>
  );
}