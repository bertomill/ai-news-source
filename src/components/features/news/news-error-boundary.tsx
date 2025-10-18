import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsErrorBoundaryProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function NewsErrorBoundary({ error, onRetry, className }: NewsErrorBoundaryProps) {
  const isNetworkError = error.toLowerCase().includes('network') || 
                        error.toLowerCase().includes('fetch') ||
                        error.toLowerCase().includes('connection');

  return (
    <Card className={cn('p-8', className)}>
      <CardContent>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            {isNetworkError ? (
              <WifiOff className="h-6 w-6 text-destructive" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isNetworkError ? 'Connection Error' : 'Something went wrong'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {isNetworkError 
                ? 'Unable to fetch news content. Please check your internet connection and try again.'
                : 'We encountered an error while loading the news feed. Please try again.'
              }
            </p>
            {!isNetworkError && (
              <details className="text-xs text-muted-foreground mt-2">
                <summary className="cursor-pointer hover:text-foreground">
                  Technical details
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto">
                  {error}
                </pre>
              </details>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <Wifi className="h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
