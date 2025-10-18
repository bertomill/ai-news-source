/**
 * Performance utilities for monitoring and optimization
 */

// Performance monitoring utilities
export const performanceUtils = {
  /**
   * Measure performance of a function execution
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (typeof window !== 'undefined') {
      console.log(`Performance: ${name} took ${end - start} milliseconds`);
    }
    
    return result;
  },

  /**
   * Measure async function performance
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (typeof window !== 'undefined') {
      console.log(`Performance: ${name} took ${end - start} milliseconds`);
    }
    
    return result;
  },

  /**
   * Check if user is on slow connection
   */
  isSlowConnection(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    const connection = (navigator as any).connection;
    if (!connection) return false;
    
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' ||
           connection.saveData;
  },

  /**
   * Get connection type for optimization decisions
   */
  getConnectionType(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const connection = (navigator as any).connection;
    if (!connection) return 'unknown';
    
    return connection.effectiveType || 'unknown';
  },

  /**
   * Preload critical resources
   */
  preloadResource(href: string, as: string, crossorigin?: string): void {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }
    
    document.head.appendChild(link);
  },

  /**
   * Lazy load images with intersection observer
   */
  observeImages(selector: string = 'img[data-src]'): void {
    if (typeof IntersectionObserver === 'undefined') return;
    
    const images = document.querySelectorAll(selector);
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }
};

// Bundle size optimization utilities
export const bundleUtils = {
  /**
   * Dynamically import a component only when needed
   */
  lazyLoadComponent<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ): React.LazyExoticComponent<T> {
    return React.lazy(importFunc);
  },

  /**
   * Check if we should load heavy features based on connection
   */
  shouldLoadHeavyFeatures(): boolean {
    return !performanceUtils.isSlowConnection();
  },

  /**
   * Get optimal image quality based on connection
   */
  getOptimalImageQuality(): number {
    const connectionType = performanceUtils.getConnectionType();
    
    switch (connectionType) {
      case '4g':
        return 90;
      case '3g':
        return 75;
      case '2g':
        return 50;
      default:
        return 80;
    }
  }
};

// Memory optimization utilities
export const memoryUtils = {
  /**
   * Clean up unused references to prevent memory leaks
   */
  cleanupReferences(obj: Record<string, any>): void {
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === 'object') {
        obj[key] = null;
      }
    });
  },

  /**
   * Debounce function to limit execution frequency
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function to limit execution frequency
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// React import for lazy loading
import React from 'react';
