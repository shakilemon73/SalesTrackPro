import { useLocation } from "wouter";
import { Link } from "wouter";

const navItems = [
  { path: "/", icon: "fas fa-home", label: "হোম", color: "text-blue-500" },
  { path: "/transactions", icon: "fas fa-exchange-alt", label: "লেনদেন", color: "text-green-500" },
  { path: "/customers", icon: "fas fa-users", label: "গ্রাহক", color: "text-purple-500" },
  { path: "/reports", icon: "fas fa-chart-bar", label: "রিপোর্ট", color: "text-orange-500" },
  { path: "/settings", icon: "fas fa-cog", label: "সেটিংস", color: "text-gray-500" },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="bottom-nav">
      <div className="flex justify-around items-center relative">
        {navItems.map((item, index) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <button className={`nav-button group ${isActive ? 'active' : ''}`}>
                <div className={`relative transition-all duration-300 ${isActive ? 'transform -translate-y-1' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary/10 shadow-lg' 
                      : 'hover:bg-muted group-hover:scale-110'
                  }`}>
                    <i className={`${item.icon} text-lg transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    }`}></i>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-primary rounded-full transition-all duration-300"></div>
                  )}
                </div>
                <span className={`text-xs font-semibold bengali-font transition-colors duration-200 mt-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`}>
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
