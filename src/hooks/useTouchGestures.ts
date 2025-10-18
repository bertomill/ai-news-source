/**
 * Custom hook for touch gesture handling
 * Provides swipe detection and pull-to-refresh functionality
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

interface UseTouchGesturesOptions {
  onSwipe?: (gesture: SwipeGesture) => void;
  onPullToRefresh?: () => void;
  pullToRefreshThreshold?: number;
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
}

interface UseTouchGesturesReturn {
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  pullToRefreshDistance: number;
  isPullingToRefresh: boolean;
}

export function useTouchGestures({
  onSwipe,
  onPullToRefresh,
  pullToRefreshThreshold = 80,
  swipeThreshold = 50,
  swipeVelocityThreshold = 0.3,
}: UseTouchGesturesOptions = {}): UseTouchGesturesReturn {
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);
  const [pullToRefreshDistance, setPullToRefreshDistance] = useState(0);
  const [isPullingToRefresh, setIsPullingToRefresh] = useState(false);
  const touchStartTime = useRef<number>(0);
  const lastTouchMove = useRef<TouchPosition | null>(null);

  const minSwipeDistance = swipeThreshold;
  const maxPullDistance = pullToRefreshThreshold * 2;

  const onTouchStartHandler = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const position: TouchPosition = { x: touch.clientX, y: touch.clientY };
    
    setTouchStart(position);
    setTouchEnd(null);
    touchStartTime.current = Date.now();
    lastTouchMove.current = position;
  }, []);

  const onTouchMoveHandler = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const currentPosition: TouchPosition = { x: touch.clientX, y: touch.clientY };
    lastTouchMove.current = currentPosition;

    // Handle pull-to-refresh (only at top of page)
    if (window.scrollY === 0 && currentPosition.y > touchStart.y) {
      const pullDistance = currentPosition.y - touchStart.y;
      const clampedDistance = Math.min(pullDistance, maxPullDistance);
      
      setPullToRefreshDistance(clampedDistance);
      setIsPullingToRefresh(true);
      
      // Add resistance effect
      e.preventDefault();
    } else {
      setPullToRefreshDistance(0);
      setIsPullingToRefresh(false);
    }
  }, [touchStart, maxPullDistance]);

  const onTouchEndHandler = useCallback((e: React.TouchEvent) => {
    if (!touchStart || !lastTouchMove.current) return;

    const touchEndTime = Date.now();
    const timeDiff = touchEndTime - touchStartTime.current;
    
    setTouchEnd(lastTouchMove.current);
    setIsPullingToRefresh(false);

    // Handle pull-to-refresh
    if (pullToRefreshDistance >= pullToRefreshThreshold) {
      onPullToRefresh?.();
    }
    setPullToRefreshDistance(0);

    // Calculate swipe gesture
    const deltaX = lastTouchMove.current.x - touchStart.x;
    const deltaY = lastTouchMove.current.y - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / timeDiff;

    if (distance > minSwipeDistance && velocity > swipeVelocityThreshold) {
      let direction: SwipeGesture['direction'];
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const gesture: SwipeGesture = {
        direction,
        distance,
        velocity,
      };

      onSwipe?.(gesture);
    }

    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, pullToRefreshDistance, pullToRefreshThreshold, minSwipeDistance, swipeVelocityThreshold, onSwipe, onPullToRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setTouchStart(null);
      setTouchEnd(null);
      setPullToRefreshDistance(0);
      setIsPullingToRefresh(false);
    };
  }, []);

  return {
    touchHandlers: {
      onTouchStart: onTouchStartHandler,
      onTouchMove: onTouchMoveHandler,
      onTouchEnd: onTouchEndHandler,
    },
    pullToRefreshDistance,
    isPullingToRefresh,
  };
}
