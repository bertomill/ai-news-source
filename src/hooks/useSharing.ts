/**
 * Custom hook for content sharing functionality
 * Provides Web Share API integration with fallbacks
 */

import { useCallback, useState } from 'react';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface UseSharingOptions {
  onShare?: (data: ShareData) => void;
  onError?: (error: Error) => void;
}

interface UseSharingReturn {
  share: (data: ShareData) => Promise<boolean>;
  canShare: boolean;
  isSharing: boolean;
  shareWithFallback: (data: ShareData) => Promise<boolean>;
  copyToClipboard: (text: string) => Promise<boolean>;
}

export function useSharing({
  onShare,
  onError,
}: UseSharingOptions = {}): UseSharingReturn {
  const [isSharing, setIsSharing] = useState(false);

  // Check if Web Share API is supported
  const canShare = typeof navigator !== 'undefined' && 
                   'share' in navigator && 
                   typeof navigator.share === 'function';

  // Copy text to clipboard
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  // Share using Web Share API
  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    if (!canShare) {
      throw new Error('Web Share API not supported');
    }

    setIsSharing(true);
    
    try {
      const shareData: ShareData = {
        title: data.title || document.title,
        text: data.text || '',
        url: data.url || window.location.href,
      };

      await navigator.share(shareData);
      onShare?.(shareData);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        onError?.(error);
      }
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [canShare, onShare, onError]);

  // Share with fallback to clipboard
  const shareWithFallback = useCallback(async (data: ShareData): Promise<boolean> => {
    try {
      // Try Web Share API first
      if (canShare) {
        return await share(data);
      } else {
        // Fallback to clipboard
        const shareText = `${data.title || ''}\n\n${data.text || ''}\n\n${data.url || window.location.href}`;
        const success = await copyToClipboard(shareText);
        
        if (success) {
          onShare?.(data);
          return true;
        } else {
          throw new Error('Failed to copy to clipboard');
        }
      }
    } catch (error) {
      onError?.(error as Error);
      return false;
    }
  }, [canShare, share, copyToClipboard, onShare, onError]);

  return {
    share,
    canShare,
    isSharing,
    shareWithFallback,
    copyToClipboard,
  };
}
