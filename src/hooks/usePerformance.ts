/**
 * Performance monitoring hook for tracking Core Web Vitals and user experience metrics
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { performanceUtils } from '@/lib/utils/performance';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  navigationStart: number;
}

interface PerformanceConfig {
  trackCoreWebVitals?: boolean;
  trackCustomMetrics?: boolean;
  reportToAnalytics?: boolean;
  sampleRate?: number; // 0-1, percentage of users to track
}

export function usePerformance(config: PerformanceConfig = {}) {
  const {
    trackCoreWebVitals = true,
    trackCustomMetrics = true,
    reportToAnalytics = false,
    sampleRate = 1.0
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    navigationStart: 0,
  });

  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  
  const observerRef = useRef<PerformanceObserver | null>(null);
  const navigationStartRef = useRef<number>(0);

  // Initialize performance tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Skip tracking if user is not in sample
    if (Math.random() > sampleRate) return;

    navigationStartRef.current = performance.timeOrigin || performance.now();

    // Track connection type
    setIsSlowConnection(performanceUtils.isSlowConnection());
    setConnectionType(performanceUtils.getConnectionType());

    // Track Core Web Vitals
    if (trackCoreWebVitals) {
      trackFirstContentfulPaint();
      trackLargestContentfulPaint();
      trackFirstInputDelay();
      trackCumulativeLayoutShift();
      trackTimeToFirstByte();
    }

    // Track custom metrics
    if (trackCustomMetrics) {
      trackCustomPerformanceMetrics();
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [trackCoreWebVitals, trackCustomMetrics, sampleRate]);

  // Track First Contentful Paint
  const trackFirstContentfulPaint = useCallback(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        setMetrics(prev => ({
          ...prev,
          fcp: fcpEntry.startTime,
        }));
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    observerRef.current = observer;
  }, []);

  // Track Largest Contentful Paint
  const trackLargestContentfulPaint = useCallback(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        setMetrics(prev => ({
          ...prev,
          lcp: lastEntry.startTime,
        }));
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }, []);

  // Track First Input Delay
  const trackFirstInputDelay = useCallback(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime;
          setMetrics(prev => ({
            ...prev,
            fid,
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }, []);

  // Track Cumulative Layout Shift
  const trackCumulativeLayoutShift = useCallback(() => {
    if (typeof window === 'undefined') return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      setMetrics(prev => ({
        ...prev,
        cls: clsValue,
      }));
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }, []);

  // Track Time to First Byte
  const trackTimeToFirstByte = useCallback(() => {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      setMetrics(prev => ({
        ...prev,
        ttfb,
        navigationStart: navigationStartRef.current,
      }));
    }
  }, []);

  // Track custom performance metrics
  const trackCustomPerformanceMetrics = useCallback(() => {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Page load time: ${loadTime}ms`);
    });

    // Track scroll performance
    let scrollStartTime: number;
    window.addEventListener('scroll', () => {
      if (!scrollStartTime) {
        scrollStartTime = performance.now();
      }
    }, { passive: true });

    // Track scroll end
    let scrollEndTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollEndTimeout);
      scrollEndTimeout = setTimeout(() => {
        const scrollDuration = performance.now() - scrollStartTime;
        console.log(`Scroll duration: ${scrollDuration}ms`);
        scrollStartTime = 0;
      }, 150);
    }, { passive: true });
  }, []);

  // Measure component render time
  const measureRender = useCallback((componentName: string, renderFn: () => void) => {
    return performanceUtils.measureFunction(`Render: ${componentName}`, renderFn);
  }, []);

  // Measure async operation
  const measureAsync = useCallback(async <T>(operationName: string, operation: () => Promise<T>): Promise<T> => {
    return performanceUtils.measureAsyncFunction(operationName, operation);
  }, []);

  // Get performance score based on metrics
  const getPerformanceScore = useCallback(() => {
    const scores = {
      fcp: metrics.fcp ? (metrics.fcp < 1800 ? 100 : metrics.fcp < 3000 ? 50 : 0) : null,
      lcp: metrics.lcp ? (metrics.lcp < 2500 ? 100 : metrics.lcp < 4000 ? 50 : 0) : null,
      fid: metrics.fid ? (metrics.fid < 100 ? 100 : metrics.fid < 300 ? 50 : 0) : null,
      cls: metrics.cls ? (metrics.cls < 0.1 ? 100 : metrics.cls < 0.25 ? 50 : 0) : null,
    };

    const validScores = Object.values(scores).filter(score => score !== null);
    return validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;
  }, [metrics]);

  // Check if performance is good
  const isPerformanceGood = useCallback(() => {
    const score = getPerformanceScore();
    return score !== null && score >= 75;
  }, [getPerformanceScore]);

  return {
    metrics,
    isSlowConnection,
    connectionType,
    measureRender,
    measureAsync,
    getPerformanceScore,
    isPerformanceGood,
  };
}
