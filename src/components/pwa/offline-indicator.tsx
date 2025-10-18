'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      // Show indicator briefly when status changes
      if (!online) {
        setShowIndicator(true);
      } else {
        // Hide indicator after a delay when coming back online
        setTimeout(() => {
          setShowIndicator(false);
        }, 2000);
      }
    };

    // Check initial status
    handleOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Listen for PWA online status events
    const handlePWAOnlineStatus = (event: CustomEvent) => {
      const { isOnline: pwaOnline } = event.detail;
      setIsOnline(pwaOnline);
      
      if (!pwaOnline) {
        setShowIndicator(true);
      } else {
        setTimeout(() => {
          setShowIndicator(false);
        }, 2000);
      }
    };

    window.addEventListener('pwa-online-status', handlePWAOnlineStatus as EventListener);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('pwa-online-status', handlePWAOnlineStatus as EventListener);
    };
  }, []);

  if (!showIndicator) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          isOnline
            ? 'bg-success text-success-foreground'
            : 'bg-error text-error-foreground'
        }`}
      >
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? 'Back Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}
