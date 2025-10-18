'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getTheme, setTheme, getResolvedTheme, type Theme } from '@/lib/theme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
} as const;

export function ThemeToggle({ 
  className, 
  showLabel = false, 
  variant = 'ghost',
  size = 'default'
}: ThemeToggleProps) {
  const [mounted, setMounted] = React.useState(false);

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const newTheme = getResolvedTheme() === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('w-9 h-9', className)}
        disabled
      >
        <Sun className="h-4 w-4" />
        {showLabel && <span className="ml-2">Theme</span>}
      </Button>
    );
  }

  const resolvedTheme = getResolvedTheme();
  const Icon = themeIcons[resolvedTheme];

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleToggle}
        className={cn(
          'transition-colors',
          className
        )}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <Icon className="h-4 w-4" />
        {showLabel && (
          <span className="ml-2">
            {themeLabels[resolvedTheme]}
          </span>
        )}
      </Button>
    </div>
  );
}

/**
 * Theme selector dropdown component
 */
interface ThemeSelectorProps {
  className?: string;
  trigger?: React.ReactNode;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>('system');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setCurrentTheme(getTheme());
  }, []);

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      {Object.entries(themeLabels).map(([theme, label]) => {
        const Icon = themeIcons[theme as Theme];
        const isActive = currentTheme === theme;
        
        return (
          <button
            key={theme}
            onClick={() => handleThemeChange(theme as Theme)}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
