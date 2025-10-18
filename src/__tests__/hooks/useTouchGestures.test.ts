/**
 * Tests for useTouchGestures hook
 */

import { renderHook, act } from '@testing-library/react';
import { useTouchGestures } from '@/hooks/useTouchGestures';

describe('useTouchGestures', () => {
  const mockOnSwipe = jest.fn();
  const mockOnPullToRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useTouchGestures({
        onSwipe: mockOnSwipe,
        onPullToRefresh: mockOnPullToRefresh,
      })
    );

    expect(result.current.pullToRefreshDistance).toBe(0);
    expect(result.current.isPullingToRefresh).toBe(false);
    expect(typeof result.current.touchHandlers.onTouchStart).toBe('function');
    expect(typeof result.current.touchHandlers.onTouchMove).toBe('function');
    expect(typeof result.current.touchHandlers.onTouchEnd).toBe('function');
  });

  it('should handle touch start correctly', () => {
    const { result } = renderHook(() =>
      useTouchGestures({
        onSwipe: mockOnSwipe,
        onPullToRefresh: mockOnPullToRefresh,
      })
    );

    const mockTouchEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchStart(mockTouchEvent);
    });

    // Should not trigger any callbacks on touch start
    expect(mockOnSwipe).not.toHaveBeenCalled();
    expect(mockOnPullToRefresh).not.toHaveBeenCalled();
  });

  it('should detect swipe gesture correctly', () => {
    const { result } = renderHook(() =>
      useTouchGestures({
        onSwipe: mockOnSwipe,
        onPullToRefresh: mockOnPullToRefresh,
      })
    );

    // Start touch
    const startEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchStart(startEvent);
    });

    // Move touch (swipe right)
    const moveEvent = {
      touches: [{ clientX: 200, clientY: 100 }],
      preventDefault: jest.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchMove(moveEvent);
    });

    // End touch
    const endEvent = {
      touches: [],
    } as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchEnd(endEvent);
    });

    expect(mockOnSwipe).toHaveBeenCalledWith({
      direction: 'right',
      distance: expect.any(Number),
      velocity: expect.any(Number),
    });
  });

  it('should detect pull to refresh gesture', () => {
    const { result } = renderHook(() =>
      useTouchGestures({
        onSwipe: mockOnSwipe,
        onPullToRefresh: mockOnPullToRefresh,
      })
    );

    // Start touch
    const startEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchStart(startEvent);
    });

    // Move touch down (pull to refresh)
    const moveEvent = {
      touches: [{ clientX: 100, clientY: 200 }],
      preventDefault: jest.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchMove(moveEvent);
    });

    expect(result.current.pullToRefreshDistance).toBeGreaterThan(0);
    expect(result.current.isPullingToRefresh).toBe(true);
    expect(moveEvent.preventDefault).toHaveBeenCalled();
  });

  it('should trigger pull to refresh when threshold is reached', () => {
    const { result } = renderHook(() =>
      useTouchGestures({
        onSwipe: mockOnSwipe,
        onPullToRefresh: mockOnPullToRefresh,
        pullToRefreshThreshold: 50,
      })
    );

    // Start touch
    const startEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchStart(startEvent);
    });

    // Move touch down beyond threshold
    const moveEvent = {
      touches: [{ clientX: 100, clientY: 200 }],
      preventDefault: jest.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchMove(moveEvent);
    });

    // End touch
    const endEvent = {
      touches: [],
    } as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchEnd(endEvent);
    });

    expect(mockOnPullToRefresh).toHaveBeenCalled();
  });

  it('should not trigger pull to refresh when not at top of page', () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 100, // Not at top
    });

    const { result } = renderHook(() =>
      useTouchGestures({
        onSwipe: mockOnSwipe,
        onPullToRefresh: mockOnPullToRefresh,
      })
    );

    // Start touch
    const startEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchStart(startEvent);
    });

    // Move touch down
    const moveEvent = {
      touches: [{ clientX: 100, clientY: 200 }],
      preventDefault: jest.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.touchHandlers.onTouchMove(mockTouchEvent);
    });

    expect(result.current.pullToRefreshDistance).toBe(0);
    expect(result.current.isPullingToRefresh).toBe(false);
    expect(mockTouchEvent.preventDefault).not.toHaveBeenCalled();
  });
});
