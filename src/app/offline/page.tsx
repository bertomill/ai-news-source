'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/layout/container';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Check initial status
    handleOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Container size="sm">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">
              {isOnline ? 'Connection Restored' : 'You&apos;re Offline'}
            </CardTitle>
            <CardDescription>
              {isOnline 
                ? 'Great! Your connection is back. You can now access the latest AI news.'
                : 'It looks like you&apos;re not connected to the internet. Don&apos;t worry, you can still browse cached content.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isOnline && (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What you can do offline:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Browse previously loaded news articles</li>
                  <li>• Read cached content</li>
                  <li>• Access your saved preferences</li>
                </ul>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleRetry}
                variant={isOnline ? "default" : "outline"}
                className="w-full sm:w-auto"
              >
                {isOnline ? 'Refresh Page' : 'Check Connection'}
              </Button>
              
              <Button 
                onClick={handleGoHome}
                variant="ghost"
                className="w-full sm:w-auto"
              >
                Go to Home
              </Button>
            </div>

            {!isOnline && (
              <div className="text-xs text-muted-foreground">
                <p>This app works offline! Once you&apos;re back online, new content will automatically sync.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
