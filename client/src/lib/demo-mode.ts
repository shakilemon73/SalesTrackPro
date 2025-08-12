// Demo Mode Manager for Bangladesh Authentication
// Allows testing without real SMS credentials

export class DemoModeManager {
  private static readonly DEMO_MODE_KEY = 'dokan_hisab_demo_mode';
  private static readonly DEMO_OTP = '123456';

  // Check if demo mode is enabled (default to true for first-time users)
  static isDemoMode(): boolean {
    const storedValue = localStorage.getItem(this.DEMO_MODE_KEY);
    // Default to demo mode if not set (for first-time users)
    return storedValue === null ? true : storedValue === 'true';
  }

  // Enable demo mode
  static enableDemoMode(): void {
    localStorage.setItem(this.DEMO_MODE_KEY, 'true');
    console.log('🧪 Demo mode enabled - OTP code will be 123456');
  }

  // Initialize demo mode on first load
  static initializeDemoMode(): void {
    if (localStorage.getItem(this.DEMO_MODE_KEY) === null) {
      this.enableDemoMode();
    }
  }

  // Disable demo mode
  static disableDemoMode(): void {
    localStorage.removeItem(this.DEMO_MODE_KEY);
    console.log('🔒 Demo mode disabled - Real SMS required');
  }

  // Get demo OTP
  static getDemoOTP(): string {
    return this.DEMO_OTP;
  }

  // Toggle demo mode
  static toggleDemoMode(): boolean {
    const isCurrentlyDemo = this.isDemoMode();
    if (isCurrentlyDemo) {
      this.disableDemoMode();
    } else {
      this.enableDemoMode();
    }
    return !isCurrentlyDemo;
  }

  // Get status message
  static getStatusMessage(): string {
    return this.isDemoMode() 
      ? 'Demo mode active - Use OTP: 123456'
      : 'Live mode - Real SMS required';
  }
}