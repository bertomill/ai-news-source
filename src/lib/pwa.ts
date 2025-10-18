/**
 * PWA utilities for AI News Tap
 * Handles service worker registration, install prompts, and offline detection
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : true;
  private serviceWorker: ServiceWorker | null = null;

  private constructor() {
    // Only setup event listeners on client side
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
    }
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;
    
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatus(false);
    });

    // Install prompt handling
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyInstallPromptAvailable();
    });

    // App installed detection
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notifyAppInstalled();
    });
  }

  /**
   * Register the service worker
   */
  public async registerServiceWorker(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.serviceWorker = registration.active || registration.installing || registration.waiting;

      console.log('Service Worker registered successfully:', registration);
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Check if the app can be installed
   */
  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  /**
   * Show the install prompt
   */
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  /**
   * Check if the app is currently online
   */
  public isAppOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Get the current service worker
   */
  public getServiceWorker(): ServiceWorker | null {
    return this.serviceWorker;
  }

  /**
   * Update the service worker
   */
  public async updateServiceWorker(): Promise<boolean> {
    if (!this.serviceWorker) {
      return false;
    }

    try {
      await this.serviceWorker.postMessage({ type: 'SKIP_WAITING' });
      return true;
    } catch (error) {
      console.error('Error updating service worker:', error);
      return false;
    }
  }

  /**
   * Clear all caches
   */
  public async clearCaches(): Promise<boolean> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
      return true;
    } catch (error) {
      console.error('Error clearing caches:', error);
      return false;
    }
  }

  /**
   * Get cache storage info
   */
  public async getCacheInfo(): Promise<{ name: string; size: number }[]> {
    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return { name, size: keys.length };
        })
      );
      return cacheInfo;
    } catch (error) {
      console.error('Error getting cache info:', error);
      return [];
    }
  }

  private notifyOnlineStatus(isOnline: boolean): void {
    if (typeof window === 'undefined') return;
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('pwa-online-status', {
      detail: { isOnline }
    }));
  }

  private notifyInstallPromptAvailable(): void {
    if (typeof window === 'undefined') return;
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('pwa-install-prompt-available'));
  }

  private notifyAppInstalled(): void {
    if (typeof window === 'undefined') return;
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('pwa-app-installed'));
  }
}

// Export singleton instance
export const pwaManager = PWAManager.getInstance();

// Utility functions
export const isPWAInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

export const isPWASupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const getPWADisplayMode = (): string => {
  if (typeof window === 'undefined') return 'browser';
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  return 'browser';
};
