/**
 * Theme system utilities for AI News Tap
 * Provides theme switching functionality with localStorage persistence
 */

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  defaultTheme: Theme;
  storageKey: string;
  attribute: string;
}

const defaultConfig: ThemeConfig = {
  defaultTheme: 'system',
  storageKey: 'ai-news-tap-theme',
  attribute: 'class',
};

/**
 * Get the current theme from localStorage or system preference
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') {
    return defaultConfig.defaultTheme;
  }

  const stored = localStorage.getItem(defaultConfig.storageKey) as Theme;
  return stored || defaultConfig.defaultTheme;
}

/**
 * Set the theme and persist to localStorage
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(defaultConfig.storageKey, theme);
  applyTheme(theme);
}

/**
 * Apply the theme to the document
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') {
    return;
  }

  const root = window.document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): (() => void) | void {
  if (typeof window === 'undefined') {
    return;
  }

  const theme = getTheme();
  applyTheme(theme);

  // Listen for system theme changes when using 'system' theme
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    if (getTheme() === 'system') {
      applyTheme('system');
    }
  };

  mediaQuery.addEventListener('change', handleChange);
  
  // Cleanup function
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

/**
 * Get the resolved theme (actual light/dark, not 'system')
 */
export function getResolvedTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const theme = getTheme();
  
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  return theme;
}

/**
 * Check if the current theme is dark
 */
export function isDarkTheme(): boolean {
  return getResolvedTheme() === 'dark';
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): void {
  const currentTheme = getResolvedTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

/**
 * Theme configuration for components
 */
export const themeConfig = {
  light: {
    name: 'Light',
    icon: '☀️',
    description: 'Light mode with clean, minimal design',
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    description: 'Dark mode for comfortable viewing',
  },
  system: {
    name: 'System',
    icon: '💻',
    description: 'Follow system preference',
  },
} as const;
