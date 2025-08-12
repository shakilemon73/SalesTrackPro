import React from 'react';
import { Switch } from './switch';
import { DemoModeManager } from '../../lib/demo-mode';

interface DemoModeToggleProps {
  onToggle?: (isDemoMode: boolean) => void;
}

export function DemoModeToggle({ onToggle }: DemoModeToggleProps) {
  const [isDemoMode, setIsDemoMode] = React.useState(DemoModeManager.isDemoMode());

  const handleToggle = () => {
    const newDemoMode = DemoModeManager.toggleDemoMode();
    setIsDemoMode(newDemoMode);
    onToggle?.(newDemoMode);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          Demo Mode
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {DemoModeManager.getStatusMessage()}
        </span>
      </div>
      <Switch
        checked={isDemoMode}
        onCheckedChange={handleToggle}
        data-testid="demo-mode-toggle"
      />
    </div>
  );
}