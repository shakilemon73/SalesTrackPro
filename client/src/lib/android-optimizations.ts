/**
 * Android APK Optimizations
 * Comprehensive mobile-first utilities for Android app experience
 */

// Android-specific device detection
export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

// Detect if running in Capacitor (native Android app)
export const isCapacitorApp = (): boolean => {
  return !!(window as any).Capacitor;
};

// Android safe area utilities
export const getAndroidSafeArea = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: style.getPropertyValue('env(safe-area-inset-top)') || '0px',
    bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
    left: style.getPropertyValue('env(safe-area-inset-left)') || '0px',
    right: style.getPropertyValue('env(safe-area-inset-right)') || '0px',
  };
};

// Optimize touch interactions for Android
export const optimizeAndroidTouch = () => {
  // Prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Improve scrolling performance
  document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });
};

// Android status bar integration (safe for web and APK)
export const configureAndroidStatusBar = async () => {
  // Only configure if we're in a native app context
  if (isCapacitorApp() && (window as any).Capacitor?.Plugins?.StatusBar) {
    try {
      const StatusBar = (window as any).Capacitor.Plugins.StatusBar;
      await StatusBar.setStyle({ style: 'DARK' });
      await StatusBar.setBackgroundColor({ color: '#2E7D32' });
    } catch (error) {
      console.log('StatusBar plugin not available');
    }
  }
};

// Android navigation bar integration (safe for web and APK)
export const configureAndroidNavBar = async () => {
  if (isCapacitorApp() && (window as any).Capacitor?.Plugins?.NavigationBar) {
    try {
      const NavigationBar = (window as any).Capacitor.Plugins.NavigationBar;
      await NavigationBar.setColor({ color: '#ffffff' });
    } catch (error) {
      console.log('NavigationBar plugin not available');
    }
  }
};

// Android haptic feedback (safe for web and APK)
export const androidHapticFeedback = async (type: 'light' | 'medium' | 'heavy' = 'light') => {
  // Try Capacitor haptics first if available
  if (isCapacitorApp() && (window as any).Capacitor?.Plugins?.Haptics) {
    try {
      const Haptics = (window as any).Capacitor.Plugins.Haptics;
      const ImpactStyle = {
        Light: 'LIGHT',
        Medium: 'MEDIUM', 
        Heavy: 'HEAVY'
      };
      const style = type === 'light' ? ImpactStyle.Light : 
                  type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy;
      await Haptics.impact({ style });
      return;
    } catch (error) {
      // Fall through to web vibration API
    }
  }
  
  // Fallback to web vibration API
  if (navigator.vibrate) {
    const duration = type === 'light' ? 10 : type === 'medium' ? 25 : 50;
    navigator.vibrate(duration);
  }
};

// Android-optimized image loading
export const androidOptimizedImageClass = 'loading-lazy will-change-transform transform-gpu';

// Android performance optimizations
export const enableAndroidPerformanceMode = () => {
  // Enable hardware acceleration
  document.documentElement.style.transform = 'translateZ(0)';
  
  // Optimize scrolling
  document.documentElement.style.webkitOverflowScrolling = 'touch';
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Reduce paint operations
  document.documentElement.style.willChange = 'scroll-position';
};

// Android keyboard handling
export const handleAndroidKeyboard = () => {
  if (isCapacitorApp()) {
    (window as any).addEventListener?.('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    
    (window as any).addEventListener?.('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  }
};

// Android orientation handling
export const handleAndroidOrientation = () => {
  const handleOrientationChange = () => {
    // Force viewport recalculation
    const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    }
    
    // Trigger resize for proper layout
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  window.addEventListener('orientationchange', handleOrientationChange);
  if (screen.orientation) {
    screen.orientation.addEventListener('change', handleOrientationChange);
  }
};

// Initialize all Android optimizations
export const initializeAndroidOptimizations = async () => {
  if (isAndroid()) {
    optimizeAndroidTouch();
    enableAndroidPerformanceMode();
    handleAndroidKeyboard();
    handleAndroidOrientation();
    
    await configureAndroidStatusBar();
    await configureAndroidNavBar();
    
    console.log('🤖 Android optimizations initialized');
  }
};

// Android-specific CSS classes
export const androidClasses = {
  container: 'android-safe-area min-h-screen bg-background',
  header: 'android-status-bar-spacing sticky top-0 z-50',
  content: 'px-4 py-6 space-y-6',
  bottomNav: 'android-nav-spacing fixed bottom-0 left-0 right-0 z-50',
  touchTarget: 'android-touch-target touch-manipulation',
  card: 'rounded-xl bg-card border border-border shadow-sm',
  button: 'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
};