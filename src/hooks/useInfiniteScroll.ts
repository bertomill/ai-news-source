/**
 * Custom hook for infinite scroll functionality
 * Handles scroll detection, loading states, and pagination
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  threshold?: number; // Distance from bottom to trigger load (in pixels)
  rootMargin?: string; // Intersection Observer root margin
}

interface UseInfiniteScrollReturn {
  loadMoreRef: (node: HTMLElement | null) => void;
  isNearBottom: boolean;
  triggerLoad: () => void;
}

export function useInfiniteScroll({
  hasMore,
  loading,
  threshold = 100,
  rootMargin = '0px 0px 100px 0px',
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [isNearBottom, setIsNearBottom] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLElement | null>(null);

  const loadMoreRefCallback = useCallback((node: HTMLElement | null) => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    loadMoreRef.current = node;

    if (node && hasMore && !loading) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          setIsNearBottom(entry.isIntersecting);
          
          if (entry.isIntersecting && hasMore && !loading) {
            // Trigger load more when element comes into view
            entry.target.dispatchEvent(new CustomEvent('loadMore'));
          }
        },
        {
          rootMargin,
          threshold: 0.1,
        }
      );

      observerRef.current.observe(node);
    }
  }, [hasMore, loading, rootMargin]);

  const triggerLoad = useCallback(() => {
    if (loadMoreRef.current && hasMore && !loading) {
      loadMoreRef.current.dispatchEvent(new CustomEvent('loadMore'));
    }
  }, [hasMore, loading]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    loadMoreRef: loadMoreRefCallback,
    isNearBottom,
    triggerLoad,
  };
}
