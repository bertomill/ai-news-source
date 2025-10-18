/**
 * Optimized image loading hook with lazy loading, WebP support, and performance optimization
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { performanceUtils, bundleUtils } from '@/lib/utils/performance';

interface OptimizedImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  fallback?: string;
  sizes?: string;
  quality?: number;
}

interface OptimizedImageState {
  src: string;
  isLoaded: boolean;
  isError: boolean;
  isVisible: boolean;
  loadTime: number;
}

export function useOptimizedImage(config: OptimizedImageConfig) {
  const {
    src,
    alt,
    width,
    height,
    priority = false,
    placeholder,
    fallback,
    sizes = '100vw',
    quality
  } = config;

  const [state, setState] = useState<OptimizedImageState>({
    src: priority ? src : placeholder || '',
    isLoaded: priority,
    isError: false,
    isVisible: priority,
    loadTime: 0,
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadStartTime = useRef<number>(0);

  // Generate optimized image URL with Next.js Image Optimization API
  const getOptimizedImageUrl = useCallback((originalSrc: string): string => {
    if (typeof window === 'undefined') return originalSrc;
    
    // If it's already a Next.js optimized image, return as is
    if (originalSrc.includes('/_next/image')) return originalSrc;
    
    // Generate optimized URL with Next.js Image Optimization
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', (quality || bundleUtils.getOptimalImageQuality()).toString());
    
    // Add WebP format support
    if (supportsWebP()) {
      params.append('f', 'webp');
    }
    
    return `/_next/image?url=${encodeURIComponent(originalSrc)}&${params.toString()}`;
  }, [width, height, quality]);

  // Check WebP support
  const supportsWebP = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState(prev => ({ ...prev, isVisible: true }));
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before image comes into view
        threshold: 0.1,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Load image when visible
  useEffect(() => {
    if (!state.isVisible || state.isLoaded || state.isError) return;

    const optimizedSrc = getOptimizedImageUrl(src);
    loadStartTime.current = performance.now();

    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - loadStartTime.current;
      setState(prev => ({
        ...prev,
        src: optimizedSrc,
        isLoaded: true,
        loadTime,
      }));
    };

    img.onerror = () => {
      setState(prev => ({
        ...prev,
        src: fallback || src,
        isError: true,
        isLoaded: true,
      }));
    };

    img.src = optimizedSrc;
  }, [state.isVisible, src, fallback, getOptimizedImageUrl]);

  // Preload critical images
  const preloadImage = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const optimizedSrc = getOptimizedImageUrl(src);
    performanceUtils.preloadResource(optimizedSrc, 'image');
  }, [src, getOptimizedImageUrl]);

  // Get image loading state for UI
  const getImageProps = useCallback(() => {
    return {
      ref: imgRef,
      src: state.src,
      alt,
      width,
      height,
      sizes,
      loading: priority ? ('eager' as const) : ('lazy' as const),
      decoding: 'async' as const,
      style: {
        opacity: state.isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      },
      onLoad: () => {
        setState(prev => ({ ...prev, isLoaded: true }));
      },
      onError: () => {
        setState(prev => ({
          ...prev,
          src: fallback || src,
          isError: true,
          isLoaded: true,
        }));
      },
    };
  }, [state, alt, width, height, sizes, priority, fallback, src]);

  // Get placeholder props for loading state
  const getPlaceholderProps = useCallback(() => {
    if (state.isLoaded) return null;
    
    return {
      className: 'animate-pulse bg-muted',
      style: {
        width: width || '100%',
        height: height || '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--muted-foreground)',
      },
      children: 'Loading...',
    };
  }, [state.isLoaded, width, height]);

  return {
    ...state,
    getImageProps,
    getPlaceholderProps,
    preloadImage,
    supportsWebP: supportsWebP(),
  };
}

// Utility hook for batch image optimization
export function useBatchImageOptimization(images: OptimizedImageConfig[]) {
  const [optimizedImages, setOptimizedImages] = useState<Record<string, OptimizedImageState>>({});
  
  useEffect(() => {
    const imageStates: Record<string, OptimizedImageState> = {};
    
    images.forEach((imageConfig, index) => {
      const key = imageConfig.src || `image-${index}`;
      imageStates[key] = {
        src: imageConfig.priority ? imageConfig.src : imageConfig.placeholder || '',
        isLoaded: imageConfig.priority || false,
        isError: false,
        isVisible: imageConfig.priority || false,
        loadTime: 0,
      };
    });
    
    setOptimizedImages(imageStates);
  }, [images]);

  return optimizedImages;
}
