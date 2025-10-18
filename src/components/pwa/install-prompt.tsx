'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { pwaManager, isPWAInstalled } from '@/lib/pwa';

interface InstallPromptProps {
  onDismiss?: () => void;
}

export function InstallPrompt({ onDismiss }: InstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Don't show prompt if already installed
    if (isPWAInstalled()) {
      return;
    }

    // Listen for install prompt availability
    const handleInstallPromptAvailable = () => {
      setShowPrompt(true);
    };

    window.addEventListener('pwa-install-prompt-available', handleInstallPromptAvailable);

    // Check if install prompt is already available
    if (pwaManager.canInstall()) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('pwa-install-prompt-available', handleInstallPromptAvailable);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await pwaManager.showInstallPrompt();
      if (success) {
        setShowPrompt(false);
        onDismiss?.();
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg">Install AI News Tap</CardTitle>
                <CardDescription className="text-sm">
                  Get quick access to personalized AI news
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Why install?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• One-tap access to AI news</li>
              <li>• Works offline with cached content</li>
              <li>• Faster loading and better performance</li>
              <li>• Native app-like experience</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1"
            >
              {isInstalling ? 'Installing...' : 'Install App'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
          
            <p className="text-xs text-muted-foreground text-center">
              You can install this app from your browser&apos;s menu anytime
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
