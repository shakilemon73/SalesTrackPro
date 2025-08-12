import { useLocation } from "wouter";
import { Link } from "wouter";
import { Home, ArrowLeftRight, Users, BarChart3, Settings, Package } from "lucide-react";
import { androidHapticFeedback, androidClasses } from "@/lib/android-optimizations";

const navItems = [
  { 
    path: "/", 
    icon: Home, 
    label: "হোম", 
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    activeColor: "bg-blue-600"
  },
  { 
    path: "/inventory", 
    icon: Package, 
    label: "স্টক", 
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    activeColor: "bg-indigo-600"
  },
  { 
    path: "/transactions", 
    icon: ArrowLeftRight, 
    label: "লেনদেন", 
    color: "text-green-600",
    bgColor: "bg-green-50",
    activeColor: "bg-green-600"
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
    <div className="fixed bottom-0 left-0 right-0 z-50 android-nav-spacing">
      {/* World-class mobile navigation with backdrop blur and glass morphism */}
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-2xl"
           style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <div className="w-full">
          <div className="grid grid-cols-5 gap-1 px-4 py-3">
            {navItems.map((item, index) => {
              const isActive = location === item.path;
              const IconComponent = item.icon;
              
              return (
                <Link key={item.path} to={item.path}>
                  <button 
                    onClick={handleNavClick}
                    className={`
                      relative flex flex-col items-center justify-center py-2 px-1 
                      rounded-2xl transition-all duration-300 ease-out
                      group hover:scale-105 active:scale-95 min-h-12 min-w-12
                      touch-manipulation
                      ${isActive ? 'transform -translate-y-1' : 'hover:bg-gray-50/80'}
                    `}
                  >
                    {/* Background indicator for active state */}
                    <div className={`
                      absolute inset-0 rounded-2xl transition-all duration-500 ease-out
                      ${isActive 
                        ? `${item.activeColor} shadow-lg shadow-${item.color.split('-')[1]}-500/20 scale-100` 
                        : 'scale-0'
                      }
                    `} />
                    
                    {/* Icon container with modern glass effect */}
                    <div className={`
                      relative z-10 w-8 h-8 rounded-xl flex items-center justify-center 
                      transition-all duration-300 ease-out mb-1
                      ${isActive 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : `${item.bgColor} group-hover:scale-110 group-hover:bg-opacity-80`
                      }
                    `}>
                      <IconComponent 
                        size={18} 
                        className={`
                          transition-all duration-300 ease-out
                          ${isActive 
                            ? 'text-white drop-shadow-sm' 
                            : `${item.color} group-hover:scale-110`
                          }
                        `} 
                      />
                    </div>
                    
                    {/* Label with smart typography */}
                    <span className={`
                      text-xs font-medium bengali-font transition-all duration-300 ease-out
                      ${isActive 
                        ? 'text-white drop-shadow-sm scale-105' 
                        : 'text-gray-600 group-hover:text-gray-900'
                      }
                    `}>
                      {item.label}
                    </span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1 h-1 bg-white rounded-full shadow-lg animate-pulse" />
                      </div>
                    )}

                    {/* Subtle glow effect for active item */}
                    {isActive && (
                      <div className={`
                        absolute inset-0 rounded-2xl opacity-30
                        bg-gradient-to-t from-${item.color.split('-')[1]}-600/20 to-transparent
                        animate-pulse
                      `} />
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Home indicator (iPhone-style) */}
        <div className="flex justify-center pb-1">
          <div className="w-20 h-1 bg-gray-300 rounded-full opacity-40" />
        </div>
      </div>

      {/* Safe area spacing for devices with home indicators */}
      <div className="h-safe-area-inset-bottom bg-white/95 backdrop-blur-lg" />
    </div>
  );
}