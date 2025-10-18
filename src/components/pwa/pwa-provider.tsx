'use client';

import { useEffect, useState } from 'react';
import { InstallPrompt } from './install-prompt';
import { OfflineIndicator } from './offline-indicator';
import { pwaManager } from '@/lib/pwa';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Register service worker
        await pwaManager.registerServiceWorker();
        
        // Set up PWA event listeners
        setupPWAEventListeners();
        
        setIsInitialized(true);
        console.log('PWA initialized successfully');
      } catch (error) {
        console.error('PWA initialization failed:', error);
        setIsInitialized(true); // Continue anyway
      }
    };

    const setupPWAEventListeners = () => {
      // Listen for service worker updates
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Service worker updated, reload the page
          window.location.reload();
        });
      }

      // Listen for app installation
      window.addEventListener('pwa-app-installed', () => {
        console.log('PWA app installed successfully');
        // You can show a success message here
      });

      // Listen for install prompt availability
      window.addEventListener('pwa-install-prompt-available', () => {
        console.log('PWA install prompt is available');
      });
    };

    initializePWA();
  }, []);

  if (!isInitialized) {
    // You could show a loading indicator here
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <InstallPrompt />
      <OfflineIndicator />
    </>
  );
}
