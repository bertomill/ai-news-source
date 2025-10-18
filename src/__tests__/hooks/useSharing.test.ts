/**
 * Tests for useSharing hook
 */

import { renderHook, act } from '@testing-library/react';
import { useSharing } from '@/hooks/useSharing';

// Mock navigator.share
const mockNavigatorShare = jest.fn();
const mockClipboardWriteText = jest.fn();
const mockExecCommand = jest.fn();

// Mock navigator
Object.defineProperty(navigator, 'share', {
  writable: true,
  value: mockNavigatorShare,
});

Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: mockClipboardWriteText,
  },
});

// Mock document.execCommand
Object.defineProperty(document, 'execCommand', {
  writable: true,
  value: mockExecCommand,
});

describe('useSharing', () => {
  const mockOnShare = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigatorShare.mockClear();
    mockClipboardWriteText.mockClear();
    mockExecCommand.mockClear();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useSharing({
        onShare: mockOnShare,
        onError: mockOnError,
      })
    );

    expect(result.current.canShare).toBe(true); // Mocked as available
    expect(result.current.isSharing).toBe(false);
    expect(typeof result.current.share).toBe('function');
    expect(typeof result.current.shareWithFallback).toBe('function');
    expect(typeof result.current.copyToClipboard).toBe('function');
  });

  it('should detect Web Share API support correctly', () => {
    // Test with Web Share API available
    const { result: resultWithShare } = renderHook(() => useSharing());
    expect(resultWithShare.current.canShare).toBe(true);

    // Test without Web Share API
    const originalShare = navigator.share;
    delete (navigator as any).share;

    const { result: resultWithoutShare } = renderHook(() => useSharing());
    expect(resultWithoutShare.current.canShare).toBe(false);

    // Restore
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: originalShare,
    });
  });

  it('should share successfully with Web Share API', async () => {
    mockNavigatorShare.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useSharing({
        onShare: mockOnShare,
        onError: mockOnError,
      })
    );

    const shareData = {
      title: 'Test Article',
      text: 'Test content',
      url: 'https://example.com',
    };

    await act(async () => {
      const success = await result.current.share(shareData);
      expect(success).toBe(true);
    });

    expect(mockNavigatorShare).toHaveBeenCalledWith(shareData);
    expect(mockOnShare).toHaveBeenCalledWith(shareData);
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('should handle Web Share API errors', async () => {
    const error = new Error('Share failed');
    mockNavigatorShare.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useSharing({
        onShare: mockOnShare,
        onError: mockOnError,
      })
    );

    const shareData = {
      title: 'Test Article',
      text: 'Test content',
      url: 'https://example.com',
    };

    await act(async () => {
      const success = await result.current.share(shareData);
      expect(success).toBe(false);
    });

    expect(mockOnError).toHaveBeenCalledWith(error);
    expect(mockOnShare).not.toHaveBeenCalled();
  });

  it('should fallback to clipboard when Web Share API is not available', async () => {
    // Remove Web Share API
    const originalShare = navigator.share;
    delete (navigator as any).share;

    mockClipboardWriteText.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useSharing({
        onShare: mockOnShare,
        onError: mockOnError,
      })
    );

    const shareData = {
      title: 'Test Article',
      text: 'Test content',
      url: 'https://example.com',
    };

    await act(async () => {
      const success = await result.current.shareWithFallback(shareData);
      expect(success).toBe(true);
    });

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      'Test Article\n\nTest content\n\nhttps://example.com'
    );
    expect(mockOnShare).toHaveBeenCalledWith(shareData);
    expect(mockOnError).not.toHaveBeenCalled();

    // Restore
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: originalShare,
    });
  });

  it('should use legacy clipboard fallback for older browsers', async () => {
    // Remove modern clipboard API
    delete (navigator as any).clipboard;

    mockExecCommand.mockReturnValue(true);

    const { result } = renderHook(() =>
      useSharing({
        onShare: mockOnShare,
        onError: mockOnError,
      })
    );

    const success = await act(async () => {
      return await result.current.copyToClipboard('Test text');
    });

    expect(success).toBe(true);
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
  });

  it('should handle clipboard errors gracefully', async () => {
    const error = new Error('Clipboard failed');
    mockClipboardWriteText.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useSharing({
        onShare: mockOnShare,
        onError: mockOnError,
      })
    );

    const success = await act(async () => {
      return await result.current.copyToClipboard('Test text');
    });

    expect(success).toBe(false);
  });

  it('should not call onShare when share is aborted by user', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    mockNavigatorShare.mockRejectedValue(abortError);

    const { result } = renderHook(() =>
      useSharing({
        onShare: mockOnShare,
        onError: mockOnError,
      })
    );

    const shareData = {
      title: 'Test Article',
      text: 'Test content',
      url: 'https://example.com',
    };

    await act(async () => {
      const success = await result.current.share(shareData);
      expect(success).toBe(false);
    });

    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockOnShare).not.toHaveBeenCalled();
  });
});
