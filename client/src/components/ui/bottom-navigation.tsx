import { useLocation } from "wouter";
import { Link } from "wouter";

const navItems = [
  { path: "/", icon: "fas fa-home", label: "হোম" },
  { path: "/transactions", icon: "fas fa-exchange-alt", label: "লেনদেন" },
  { path: "/customers", icon: "fas fa-users", label: "গ্রাহক" },
  { path: "/reports", icon: "fas fa-chart-bar", label: "রিপোর্ট" },
  { path: "/settings", icon: "fas fa-cog", label: "সেটিংস" },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="bottom-nav">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <button className={`nav-button ${location === item.path ? 'active' : ''}`}>
              <i className={`${item.icon} text-xl mb-1`}></i>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
