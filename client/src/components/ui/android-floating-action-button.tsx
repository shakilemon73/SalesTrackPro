import * as React from "react";
import { cn } from "@/lib/utils";
import { androidHapticFeedback } from "@/lib/android-optimizations";
import { Plus } from "lucide-react";

interface AndroidFABProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  size?: 'default' | 'mini';
  variant?: 'primary' | 'secondary' | 'surface';
  className?: string;
}

export const AndroidFloatingActionButton: React.FC<AndroidFABProps> = ({
  onClick,
  icon = <Plus size={24} />,
  size = 'default',
  variant = 'primary',
  className
}) => {
  const handleClick = async () => {
    await androidHapticFeedback('medium');
    onClick?.();
  };

  const sizeClasses = {
    default: 'w-14 h-14',
    mini: 'w-10 h-10'
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl', 
    surface: 'bg-surface text-foreground shadow-md hover:shadow-lg border border-border'
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-20 right-4 z-40",
        "rounded-full flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "hover:scale-110 active:scale-95",
        "android-elevation-3",
        "android-ripple",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {icon}
    </button>
  );
};