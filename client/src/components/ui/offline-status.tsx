/**
 * Offline Status Component
 * Shows network status and sync progress for Bengali entrepreneurs
 */

import { useState, useEffect } from 'react';
import { useNetworkStatus, useSyncStatus } from '@/hooks/use-offline-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineStatusProps {
  className?: string;
  showSyncButton?: boolean;
}

export function OfflineStatus({ className, showSyncButton = true }: OfflineStatusProps) {
  const { isOnline, lastOnlineTime } = useNetworkStatus();
  const { issyncing, pendingCount, lastSyncTime, forcSync } = useSyncStatus();
  const [showDetails, setShowDetails] = useState(false);

  // Auto-hide details after 5 seconds
  useEffect(() => {
    if (showDetails) {
      const timer = setTimeout(() => setShowDetails(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showDetails]);

  const handleStatusClick = () => {
    setShowDetails(!showDetails);
  };

  const handleSyncClick = () => {
    forcSync();
    setShowDetails(true);
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'কখনো নয়';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'এইমাত্র';
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘন্টা আগে`;
    
    return new Date(timestamp).toLocaleDateString('bn-BD');
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Main Status Badge */}
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:scale-105",
          "flex items-center gap-1 text-xs font-medium",
          isOnline ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
        )}
        onClick={handleStatusClick}
        data-testid="status-network"
      >
        {isOnline ? (
          <>
            <Wifi size={12} />
            অনলাইন
          </>
        ) : (
          <>
            <WifiOff size={12} />
            অফলাইন
          </>
        )}
      </Badge>

      {/* Sync Status */}
      {pendingCount > 0 && (
        <Badge
          variant="secondary"
          className={cn(
            "text-xs font-medium",
            issyncing && "animate-pulse"
          )}
          data-testid="status-sync"
        >
          {issyncing ? (
            <>
              <RefreshCw size={12} className="animate-spin mr-1" />
              সিঙ্ক হচ্ছে
            </>
          ) : (
            <>
              <AlertCircle size={12} className="mr-1" />
              {pendingCount} অপেক্ষমাণ
            </>
          )}
        </Badge>
      )}

      {/* Sync Button */}
      {showSyncButton && isOnline && !issyncing && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSyncClick}
          className="h-6 px-2 text-xs"
          data-testid="button-force-sync"
        >
          <RefreshCw size={12} className="mr-1" />
          সিঙ্ক
        </Button>
      )}

      {/* Detailed Status Panel */}
      {showDetails && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">নেটওয়ার্ক:</span>
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <>
                    <CheckCircle size={12} className="text-green-600" />
                    <span className="text-green-600">সংযুক্ত</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} className="text-red-600" />
                    <span className="text-red-600">বিচ্ছিন্ন</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">শেষ অনলাইন:</span>
              <span>{formatTime(lastOnlineTime)}</span>
            </div>
            
            {pendingCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">অপেক্ষমাণ:</span>
                <span className="text-orange-600">{pendingCount} এন্ট্রি</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">শেষ সিঙ্ক:</span>
              <span>{formatTime(lastSyncTime)}</span>
            </div>
            
            {!isOnline && (
              <div className="pt-2 border-t text-center">
                <p className="text-muted-foreground mb-1">
                  অফলাইন মোড সক্রিয়
                </p>
                <p className="text-xs text-green-600">
                  ✓ সব ফিচার কাজ করবে
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile bottom navigation
export function OfflineStatusCompact() {
  const { isOnline } = useNetworkStatus();
  const { pendingCount } = useSyncStatus();

  return (
    <div className="flex items-center gap-1">
      {isOnline ? (
        <div className="w-2 h-2 bg-green-500 rounded-full" />
      ) : (
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
      
      {pendingCount > 0 && (
        <Badge variant="secondary" className="h-4 px-1 text-[10px] leading-none">
          {pendingCount}
        </Badge>
      )}
    </div>
  );
}

export default OfflineStatus;