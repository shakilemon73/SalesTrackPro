import * as React from "react";
import { cn } from "@/lib/utils";
import { androidClasses } from "@/lib/android-optimizations";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface AndroidHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backPath?: string;
  rightAction?: React.ReactNode;
  className?: string;
}

export const AndroidEnhancedHeader: React.FC<AndroidHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  backPath = "/",
  rightAction,
  className
}) => {
  return (
    <div className={cn(
      androidClasses.header,
      "bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          {showBack && (
            <Link to={backPath}>
              <button className="android-touch-target p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200">
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
            </Link>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900 bengali-font">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 bengali-font">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {rightAction && (
          <div className="flex items-center space-x-2">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
};