import { toBengaliNumber } from "@/lib/bengali-utils";

interface DashboardCardProps {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  isLoading?: boolean;
}

const colorClasses = {
  primary: 'border-primary bg-primary/10 text-primary',
  secondary: 'border-secondary bg-secondary/10 text-secondary',
  success: 'border-success bg-success/10 text-success',
  warning: 'border-warning bg-warning/10 text-warning',
  error: 'border-error bg-error/10 text-error',
};

const textColorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

export default function DashboardCard({ 
  title, 
  value, 
  unit, 
  icon, 
  color, 
  isLoading = false 
}: DashboardCardProps) {
  if (isLoading) {
    return (
      <div className="dashboard-card border-gray-200 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
            <div className="h-6 bg-gray-200 rounded mb-1 w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="bg-gray-200 p-2 rounded-full w-10 h-10"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card ${colorClasses[color].split(' ')[0]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-xl font-bold number-font ${textColorClasses[color]}`}>
            {value}
          </p>
          <p className="text-xs text-gray-500">{unit}</p>
        </div>
        <div className={`p-2 rounded-full ${colorClasses[color].split(' ').slice(1).join(' ')}`}>
          <i className={`${icon}`}></i>
        </div>
      </div>
    </div>
  );
}
