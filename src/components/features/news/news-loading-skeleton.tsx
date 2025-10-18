import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NewsLoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function NewsLoadingSkeleton({ count = 6, className }: NewsLoadingSkeletonProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="notion-card">
          <CardHeader className="pb-3">
            <div className="space-y-2">
              {/* Title skeleton */}
              <div className="h-5 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              
              {/* Meta info skeleton */}
              <div className="flex items-center gap-2 mt-2">
                <div className="h-3 bg-muted rounded animate-pulse w-16" />
                <div className="h-3 bg-muted rounded animate-pulse w-12" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </div>
            
            {/* Category skeleton */}
            <div className="mt-3">
              <div className="h-3 bg-muted rounded animate-pulse w-20" />
            </div>
            
            {/* Actions skeleton */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <div className="flex items-center gap-1">
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 bg-muted rounded animate-pulse w-16" />
                <div className="h-6 bg-muted rounded animate-pulse w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
