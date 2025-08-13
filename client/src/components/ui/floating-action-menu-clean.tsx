import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ShoppingCart, UserPlus, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

interface FABAction {
  id: string;
  icon: any;
  label: string;
  path: string;
  color: string;
  bgColor: string;
}

const fabActions: FABAction[] = [
  {
    id: 'sales',
    icon: ShoppingCart,
    label: 'বিক্রয়',
    path: '/sales/new',
    color: 'text-white',
    bgColor: 'bg-gradient-to-r from-emerald-500 to-green-600'
  },
  {
    id: 'customer',
    icon: UserPlus,
    label: 'গ্রাহক',
    path: '/customers/new',
    color: 'text-white',
    bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600'
  },
  {
    id: 'expense',
    icon: TrendingUp,
    label: 'খরচ',
    path: '/expenses/new',
    color: 'text-white',
    bgColor: 'bg-gradient-to-r from-orange-500 to-red-600'
  }
];

export default function FloatingActionMenuClean() {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleActionClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Menu */}
      <div className="fixed bottom-20 right-4 z-50">
        {/* Action Items */}
        <AnimatePresence>
          {isOpen && (
            <div className="mb-4 space-y-3">
              {fabActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <motion.div
                    key={action.id}
                    initial={{ 
                      scale: 0, 
                      opacity: 0,
                      x: 20
                    }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      x: 0
                    }}
                    exit={{ 
                      scale: 0, 
                      opacity: 0,
                      x: 20
                    }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                    className="flex items-center justify-end space-x-3"
                  >
                    {/* Label */}
                    <motion.div 
                      className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200/80"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <span className="text-xs font-semibold text-slate-800 bengali-font whitespace-nowrap">
                        {action.label}
                      </span>
                    </motion.div>
                    
                    {/* Button */}
                    <motion.button
                      onClick={() => handleActionClick(action.path)}
                      className={`
                        flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg
                        ${action.bgColor} ${action.color}
                        transform transition-transform duration-200
                        hover:scale-110 active:scale-95
                        border border-white/20
                      `}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconComponent size={20} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          onClick={toggleMenu}
          className="
            w-14 h-14 rounded-2xl shadow-xl
            bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600
            text-white flex items-center justify-center
            transform transition-all duration-300
            hover:scale-105 active:scale-95
            border-2 border-white/20
          "
          whileTap={{ scale: 0.9 }}
          animate={{ 
            rotate: isOpen ? 45 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}