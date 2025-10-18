/**
 * Custom hook for accessibility features
 * Provides keyboard navigation, screen reader announcements, and focus management
 */

import { useCallback, useEffect, useRef } from 'react';

interface UseAccessibilityOptions {
  announceChanges?: boolean;
  enableKeyboardNavigation?: boolean;
}

interface UseAccessibilityReturn {
  announce: (message: string) => void;
  setFocus: (element: HTMLElement | null) => void;
  trapFocus: (container: HTMLElement | null) => void;
  releaseFocus: () => void;
  keyboardHandlers: {
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  announceRef: (node: HTMLElement | null) => void;
}

export function useAccessibility({
  announceChanges = true,
  enableKeyboardNavigation = true,
}: UseAccessibilityOptions = {}): UseAccessibilityReturn {
  const announceRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<HTMLElement[]>([]);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // Create announcement element
  const announceRefCallback = useCallback((node: HTMLElement | null) => {
    announceRef.current = node;
  }, []);

  // Announce messages to screen readers
  const announce = useCallback((message: string) => {
    if (!announceChanges || !announceRef.current) return;

    const announcement = message.trim();
    if (!announcement) return;

    // Update the announcement element content
    if (announceRef.current) {
      announceRef.current.textContent = announcement;
    }
  }, [announceChanges]);

  // Focus management
  const setFocus = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  }, []);

  // Focus trap for modals/drawers
  const trapFocus = useCallback((container: HTMLElement | null) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    focusTrapRef.current = Array.from(focusableElements);

    if (focusTrapRef.current.length > 0) {
      focusTrapRef.current[0].focus();
    }
  }, []);

  // Release focus trap
  const releaseFocus = useCallback(() => {
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus();
      lastFocusedElement.current = null;
    }
    focusTrapRef.current = [];
  }, []);

  // Keyboard navigation handler
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enableKeyboardNavigation) return;

    const { key, ctrlKey, metaKey } = e;

    // Handle focus trap navigation
    if (focusTrapRef.current.length > 0) {
      const currentIndex = focusTrapRef.current.findIndex(el => el === document.activeElement);
      
      if (key === 'Tab') {
        e.preventDefault();
        const nextIndex = e.shiftKey 
          ? (currentIndex - 1 + focusTrapRef.current.length) % focusTrapRef.current.length
          : (currentIndex + 1) % focusTrapRef.current.length;
        
        focusTrapRef.current[nextIndex]?.focus();
        return;
      }

      if (key === 'Escape') {
        releaseFocus();
        return;
      }
    }

    // Global keyboard shortcuts
    if (ctrlKey || metaKey) {
      switch (key) {
        case 'k':
          // Open search (Ctrl/Cmd + K)
          e.preventDefault();
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            announce('Search focused');
          }
          break;
        case '/':
          // Focus filters (Ctrl/Cmd + /)
          e.preventDefault();
          const filterButton = document.querySelector('[role="button"][aria-label*="filter" i]') as HTMLElement;
          if (filterButton) {
            filterButton.focus();
            announce('Filters focused');
          }
          break;
      }
    }

    // Arrow key navigation for grid/list items
    if (key.startsWith('Arrow') && !ctrlKey && !metaKey) {
      const currentElement = document.activeElement as HTMLElement;
      const isInGrid = currentElement.closest('[role="grid"], .grid');
      
      if (isInGrid) {
        const gridItems = Array.from(isInGrid.querySelectorAll('[role="gridcell"], [tabindex]')) as HTMLElement[];
        const currentIndex = gridItems.findIndex(item => item === currentElement);
        
        if (currentIndex !== -1) {
          let nextIndex = currentIndex;
          
          switch (key) {
            case 'ArrowRight':
              nextIndex = currentIndex + 1;
              break;
            case 'ArrowLeft':
              nextIndex = currentIndex - 1;
              break;
            case 'ArrowDown':
              nextIndex = currentIndex + Math.ceil(gridItems.length / 3); // Assuming 3 columns
              break;
            case 'ArrowUp':
              nextIndex = currentIndex - Math.ceil(gridItems.length / 3);
              break;
          }
          
          if (nextIndex >= 0 && nextIndex < gridItems.length) {
            e.preventDefault();
            gridItems[nextIndex].focus();
          }
        }
      }
    }
  }, [enableKeyboardNavigation, releaseFocus, announce]);

  // Store last focused element before modal opens
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!focusTrapRef.current.length) {
        lastFocusedElement.current = target;
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  return {
    announce,
    setFocus,
    trapFocus,
    releaseFocus,
    keyboardHandlers: {
      onKeyDown,
    },
    announceRef: announceRefCallback,
  };
}
