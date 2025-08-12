import { useEffect, useState } from 'react';

export const useAndroidKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Handle visual viewport changes (modern approach)
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const heightDifference = windowHeight - viewportHeight;
        
        // Keyboard is considered open if viewport height is significantly smaller
        const keyboardOpen = heightDifference > 150;
        setIsKeyboardOpen(keyboardOpen);
        setKeyboardHeight(keyboardOpen ? heightDifference : 0);
        
        // Update body class for CSS targeting
        document.body.classList.toggle('keyboard-open', keyboardOpen);
      }
    };

    // Handle window resize (fallback for older browsers)
    const handleResize = () => {
      if (!window.visualViewport) {
        const heightDifference = window.screen.height - window.innerHeight;
        const keyboardOpen = heightDifference > 300; // Adjust threshold for different devices
        setIsKeyboardOpen(keyboardOpen);
        setKeyboardHeight(keyboardOpen ? heightDifference : 0);
        document.body.classList.toggle('keyboard-open', keyboardOpen);
      }
    };

    // Handle Capacitor keyboard events
    const handleCapacitorKeyboard = () => {
      if ((window as any).Capacitor) {
        (window as any).addEventListener?.('keyboardWillShow', (event: any) => {
          setIsKeyboardOpen(true);
          setKeyboardHeight(event.keyboardHeight || 0);
          document.body.classList.add('keyboard-open');
        });

        (window as any).addEventListener?.('keyboardWillHide', () => {
          setIsKeyboardOpen(false);
          setKeyboardHeight(0);
          document.body.classList.remove('keyboard-open');
        });
      }
    };

    // Add event listeners
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }
    window.addEventListener('resize', handleResize);
    handleCapacitorKeyboard();

    // Initial check
    handleViewportChange();
    handleResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    isKeyboardOpen,
    keyboardHeight,
  };
};