/**
 * Tests for useInfiniteScroll hook
 */

import { renderHook, act } from '@testing-library/react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        hasMore: true,
        loading: false,
      })
    );

    expect(result.current.isNearBottom).toBe(false);
    expect(typeof result.current.loadMoreRef).toBe('function');
    expect(typeof result.current.triggerLoad).toBe('function');
  });

  it('should create IntersectionObserver when loadMoreRef is called with element', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        hasMore: true,
        loading: false,
      })
    );

    const mockElement = document.createElement('div');
    
    act(() => {
      result.current.loadMoreRef(mockElement);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '0px 0px 100px 0px',
        threshold: 0.1,
      }
    );
  });

  it('should not create IntersectionObserver when hasMore is false', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        hasMore: false,
        loading: false,
      })
    );

    const mockElement = document.createElement('div');
    
    act(() => {
      result.current.loadMoreRef(mockElement);
    });

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  it('should not create IntersectionObserver when loading is true', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        hasMore: true,
        loading: true,
      })
    );

    const mockElement = document.createElement('div');
    
    act(() => {
      result.current.loadMoreRef(mockElement);
    });

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  it('should trigger loadMore event when element intersects', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        hasMore: true,
        loading: false,
      })
    );

    const mockElement = document.createElement('div');
    const mockEvent = new Event('loadMore');
    const addEventListenerSpy = jest.spyOn(mockElement, 'dispatchEvent');

    let intersectionCallback: IntersectionObserverCallback;
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    act(() => {
      result.current.loadMoreRef(mockElement);
    });

    // Simulate intersection
    act(() => {
      intersectionCallback([{ isIntersecting: true, target: mockElement }], {} as IntersectionObserver);
    });

    expect(addEventListenerSpy).toHaveBeenCalledWith('loadMore');
  });

  it('should update isNearBottom state when element intersects', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        hasMore: true,
        loading: false,
      })
    );

    const mockElement = document.createElement('div');

    let intersectionCallback: IntersectionObserverCallback;
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    act(() => {
      result.current.loadMoreRef(mockElement);
    });

    expect(result.current.isNearBottom).toBe(false);

    // Simulate intersection
    act(() => {
      intersectionCallback([{ isIntersecting: true, target: mockElement }], {} as IntersectionObserver);
    });

    expect(result.current.isNearBottom).toBe(true);
  });
});
