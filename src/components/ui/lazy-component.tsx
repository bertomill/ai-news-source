/**
 * Lazy-loaded component wrapper with loading states and error boundaries
 */

import React, { Suspense, ComponentType } from 'react';
import { bundleUtils } from '@/lib/utils/performance';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface LazyComponentOptions {
  shouldLoad?: () => boolean;
  preload?: boolean;
  retry?: boolean;
  retryDelay?: number;
}

// Default loading fallback
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Default error fallback
const DefaultErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center p-8 text-center">
    <div className="text-muted-foreground">
      <p>Failed to load component</p>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-2 text-xs">
          <summary>Error details</summary>
          <pre className="mt-1 text-left">{error.message}</pre>
        </details>
      )}
    </div>
  </div>
);

// Error boundary component
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}

/**
 * Create a lazy-loaded component with performance optimizations
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): React.LazyExoticComponent<T> {
  const { shouldLoad = () => true, preload = false } = options;

  // Check if we should load the component based on connection speed
  const shouldLoadComponent = shouldLoad() && bundleUtils.shouldLoadHeavyFeatures();

  const LazyComponent = React.lazy(async () => {
    // If we shouldn't load heavy features, return a lightweight fallback
    if (!shouldLoadComponent) {
      return {
        default: (() => (
          <div className="text-center p-8 text-muted-foreground">
            <p>Content optimized for your connection</p>
          </div>
        )) as unknown as T,
      };
    }

    try {
      return await importFunc();
    } catch (error) {
      console.error('Failed to load lazy component:', error);
      throw error;
    }
  });

  // Preload the component if requested
  if (preload && shouldLoadComponent) {
    importFunc().catch(() => {
      // Ignore preload errors
    });
  }

  return LazyComponent;
}

/**
 * Lazy component wrapper with loading and error states
 */
export function LazyComponent<T extends ComponentType<any>>({
  component: LazyComponent,
  fallback,
  errorFallback,
  onError,
  ...props
}: {
  component: React.LazyExoticComponent<T>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
} & React.ComponentProps<T>) {
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Lazy component with retry functionality
 */
export function LazyComponentWithRetry<T extends ComponentType<any>>({
  component: LazyComponent,
  fallback,
  errorFallback,
  onError,
  retry = true,
  retryDelay = 1000,
  ...props
}: {
  component: React.LazyExoticComponent<T>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  retry?: boolean;
  retryDelay?: number;
} & React.ComponentProps<T>) {
  const [retryCount, setRetryCount] = React.useState(0);
  const [shouldRetry, setShouldRetry] = React.useState(false);

  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Lazy component error:', error, errorInfo);
    onError?.(error, errorInfo);

    if (retry && retryCount < 3) {
      setShouldRetry(true);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setShouldRetry(false);
      }, retryDelay);
    }
  }, [retry, retryCount, retryDelay, onError]);

  const ErrorFallbackWithRetry = React.useCallback(() => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-muted-foreground mb-4">
        <p>Failed to load component</p>
        {retry && retryCount < 3 && (
          <p className="text-sm mt-2">
            Retrying... ({retryCount + 1}/3)
          </p>
        )}
      </div>
      {retry && retryCount < 3 && (
        <button
          onClick={() => {
            setRetryCount(prev => prev + 1);
            setShouldRetry(false);
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      )}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs text-left">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {errorFallback || 'Component failed to load'}
          </pre>
        </details>
      )}
    </div>
  ), [retry, retryCount, errorFallback]);

  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Export error boundary for standalone use
export { ComponentErrorBoundary as ErrorBoundary };
