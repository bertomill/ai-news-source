/**
 * PWA functionality tests
 * Tests service worker registration, offline capability, and install prompts
 */

import { pwaManager, isPWAInstalled, isPWASupported, getPWADisplayMode } from '@/lib/pwa';

// Mock service worker API
const mockServiceWorker = {
  register: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const mockCaches = {
  open: jest.fn(),
  keys: jest.fn(),
  delete: jest.fn(),
  match: jest.fn(),
};

// Mock navigator
Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
});

Object.defineProperty(window, 'caches', {
  value: mockCaches,
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('PWA Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  describe('Service Worker Registration', () => {
    it('should register service worker successfully', async () => {
      const mockRegistration = {
        active: null,
        installing: null,
        waiting: null,
      };
      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      const result = await pwaManager.registerServiceWorker();
      
      expect(result).toBe(true);
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
      });
    });

    it('should handle service worker registration failure', async () => {
      mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'));

      const result = await pwaManager.registerServiceWorker();
      
      expect(result).toBe(false);
    });

    it('should return false when service worker is not supported', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
      });

      const result = await pwaManager.registerServiceWorker();
      
      expect(result).toBe(false);
    });
  });

  describe('Install Prompt', () => {
    it('should return false when no install prompt is available', () => {
      const result = pwaManager.canInstall();
      expect(result).toBe(false);
    });

    it('should handle install prompt when available', async () => {
      const mockPrompt = {
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      };
      
      // Mock the deferred prompt
      (pwaManager as any).deferredPrompt = mockPrompt;

      const result = await pwaManager.showInstallPrompt();
      
      expect(result).toBe(true);
      expect(mockPrompt.prompt).toHaveBeenCalled();
    });

    it('should handle install prompt dismissal', async () => {
      const mockPrompt = {
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
      };
      
      (pwaManager as any).deferredPrompt = mockPrompt;

      const result = await pwaManager.showInstallPrompt();
      
      expect(result).toBe(false);
    });
  });

  describe('Online Status', () => {
    it('should return correct online status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const result = pwaManager.isAppOnline();
      expect(result).toBe(true);
    });

    it('should return correct offline status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const result = pwaManager.isAppOnline();
      expect(result).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('should clear all caches successfully', async () => {
      mockCaches.keys.mockResolvedValue(['cache1', 'cache2']);
      mockCaches.delete.mockResolvedValue(true);

      const result = await pwaManager.clearCaches();
      
      expect(result).toBe(true);
      expect(mockCaches.keys).toHaveBeenCalled();
      expect(mockCaches.delete).toHaveBeenCalledTimes(2);
    });

    it('should handle cache clearing failure', async () => {
      mockCaches.keys.mockRejectedValue(new Error('Cache error'));

      const result = await pwaManager.clearCaches();
      
      expect(result).toBe(false);
    });

    it('should get cache info successfully', async () => {
      const mockCacheInfo = [
        { name: 'cache1', size: 5 },
        { name: 'cache2', size: 3 },
      ];
      
      mockCaches.keys.mockResolvedValue(['cache1', 'cache2']);
      mockCaches.open.mockImplementation((name) => ({
        keys: jest.fn().mockResolvedValue(Array(mockCacheInfo.find(c => c.name === name)?.size || 0)),
      }));

      const result = await pwaManager.getCacheInfo();
      
      expect(result).toEqual(mockCacheInfo);
    });
  });
});

describe('PWA Utility Functions', () => {
  describe('isPWAInstalled', () => {
    it('should return true for standalone display mode', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const result = isPWAInstalled();
      expect(result).toBe(true);
    });

    it('should return true for iOS standalone', () => {
      (window.navigator as any).standalone = true;
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const result = isPWAInstalled();
      expect(result).toBe(true);
    });

    it('should return false for browser mode', () => {
      (window.navigator as any).standalone = false;
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const result = isPWAInstalled();
      expect(result).toBe(false);
    });
  });

  describe('isPWASupported', () => {
    it('should return true when both service worker and push manager are supported', () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {},
        writable: true,
      });
      Object.defineProperty(window, 'PushManager', {
        value: {},
        writable: true,
      });

      const result = isPWASupported();
      expect(result).toBe(true);
    });

    it('should return false when service worker is not supported', () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
      });
      Object.defineProperty(window, 'PushManager', {
        value: {},
        writable: true,
      });

      const result = isPWASupported();
      expect(result).toBe(false);
    });

    it('should return false when push manager is not supported', () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {},
        writable: true,
      });
      Object.defineProperty(window, 'PushManager', {
        value: undefined,
        writable: true,
      });

      const result = isPWASupported();
      expect(result).toBe(false);
    });
  });

  describe('getPWADisplayMode', () => {
    it('should return standalone for standalone display mode', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const result = getPWADisplayMode();
      expect(result).toBe('standalone');
    });

    it('should return minimal-ui for minimal-ui display mode', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: minimal-ui)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const result = getPWADisplayMode();
      expect(result).toBe('minimal-ui');
    });

    it('should return browser for browser display mode', () => {
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const result = getPWADisplayMode();
      expect(result).toBe('browser');
    });
  });
});
