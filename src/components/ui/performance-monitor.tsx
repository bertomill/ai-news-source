/**
 * Performance monitoring component for development and debugging
 */

'use client';

import React, { useEffect, useState } from 'react';
import { usePerformance } from '@/hooks/usePerformance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Activity, Zap, Wifi, WifiOff } from 'lucide-react';

interface PerformanceMonitorProps {
  showInProduction?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceMonitor({ 
  showInProduction = false, 
  position = 'bottom-right' 
}: PerformanceMonitorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const {
    metrics,
    isSlowConnection,
    connectionType,
    getPerformanceScore,
    isPerformanceGood,
  } = usePerformance({
    trackCoreWebVitals: true,
    trackCustomMetrics: true,
  });

  // Only show in development or if explicitly enabled
  useEffect(() => {
    setIsVisible(
      process.env.NODE_ENV === 'development' || showInProduction
    );
  }, [showInProduction]);

  if (!isVisible) return null;

  const performanceScore = getPerformanceScore();
  const isGood = isPerformanceGood();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const formatMetric = (value: number | null, suffix = 'ms') => {
    if (value === null) return 'N/A';
    return `${Math.round(value)}${suffix}`;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-500';
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-sm`}>
      <Card className="bg-card/95 backdrop-blur-sm border-border shadow-lg">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <CardTitle className="text-sm">Performance</CardTitle>
              <div className={`w-2 h-2 rounded-full ${getScoreColor(performanceScore)}`} />
            </div>
            <div className="flex items-center gap-2">
              {isSlowConnection ? (
                <WifiOff className="w-4 h-4 text-red-500" />
              ) : (
                <Wifi className="w-4 h-4 text-green-500" />
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CardHeader>

        {isOpen && (
            <CardContent className="space-y-4">
              {/* Performance Score */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Score</span>
                <Badge variant={isGood ? 'default' : 'destructive'}>
                  {performanceScore ? Math.round(performanceScore) : 'N/A'}
                </Badge>
              </div>

              {/* Core Web Vitals */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Core Web Vitals
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>FCP:</span>
                    <span className={metrics.fcp && metrics.fcp < 1800 ? 'text-green-600' : 'text-red-600'}>
                      {formatMetric(metrics.fcp)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>LCP:</span>
                    <span className={metrics.lcp && metrics.lcp < 2500 ? 'text-green-600' : 'text-red-600'}>
                      {formatMetric(metrics.lcp)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>FID:</span>
                    <span className={metrics.fid && metrics.fid < 100 ? 'text-green-600' : 'text-red-600'}>
                      {formatMetric(metrics.fid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>CLS:</span>
                    <span className={metrics.cls && metrics.cls < 0.1 ? 'text-green-600' : 'text-red-600'}>
                      {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connection Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Connection
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span>Type:</span>
                  <Badge variant={isSlowConnection ? 'destructive' : 'secondary'}>
                    {connectionType}
                  </Badge>
                </div>
                {isSlowConnection && (
                  <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    <Zap className="w-3 h-3 inline mr-1" />
                    Optimizations active for slow connection
                  </div>
                )}
              </div>

              {/* Additional Metrics */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Additional
                </h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>TTFB:</span>
                    <span>{formatMetric(metrics.ttfb)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Navigation:</span>
                    <span>{formatMetric(metrics.navigationStart)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Reload page to retest
                    window.location.reload();
                  }}
                  className="flex-1 text-xs"
                >
                  Retest
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Copy metrics to clipboard
                    const metricsText = `
Performance Metrics:
FCP: ${formatMetric(metrics.fcp)}
LCP: ${formatMetric(metrics.lcp)}
FID: ${formatMetric(metrics.fid)}
CLS: ${metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
TTFB: ${formatMetric(metrics.ttfb)}
Score: ${performanceScore ? Math.round(performanceScore) : 'N/A'}
Connection: ${connectionType}
                    `.trim();
                    
                    navigator.clipboard.writeText(metricsText);
                  }}
                  className="flex-1 text-xs"
                >
                  Copy
                </Button>
              </div>
            </CardContent>
        )}
      </Card>
    </div>
  );
}

// Development-only performance overlay
export function PerformanceOverlay() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <PerformanceMonitor position="bottom-right" />
    </>
  );
}
