'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Article, ContentFilter } from '@/types/content';
import { NewsCard } from './news-card';
import { NewsFilters } from './news-filters';
import { NewsLoadingSkeleton } from './news-loading-skeleton';
import { NewsErrorBoundary } from './news-error-boundary';
import { ExternalLink, RefreshCw, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useAccessibility } from '@/hooks/useAccessibility';

interface NewsFeedProps {
  className?: string;
  initialLimit?: number;
}

export function NewsFeed({ className, initialLimit = 20 }: NewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContentFilter>({
    timeRange: 'all',
    relevance: 0.5,
  });

  // Initialize hooks
  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    loading,
    threshold: 100,
  });

  const { touchHandlers, pullToRefreshDistance, isPullingToRefresh } = useTouchGestures({
    onPullToRefresh: () => fetchArticles(true),
    pullToRefreshThreshold: 80,
  });

  const { announce, keyboardHandlers, announceRef } = useAccessibility({
    announceChanges: true,
    enableKeyboardNavigation: true,
  });

  // Fetch articles
  const fetchArticles = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: initialLimit.toString(),
        timeRange: filters.timeRange || 'all',
        relevance: (filters.relevance || 0.5).toString(),
      });

      if (filters.categories && filters.categories.length > 0) {
        params.append('category', filters.categories[0]);
      }

      const response = await fetch(`/api/content/simple-feed?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status}`);
      }

      const data = await response.json();
      
      if (reset) {
        setArticles(data.articles);
      } else {
        setArticles(prev => [...prev, ...data.articles]);
      }
      
      setHasMore(data.hasMore);
      setLastFetch(data.lastFetch);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [initialLimit, filters]);

  // Load more articles
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchArticles(false);
      announce(`Loading more articles. Currently showing ${articles.length} articles.`);
    }
  }, [loading, hasMore, fetchArticles, announce, articles.length]);

  // Refresh articles
  const refresh = useCallback(() => {
    fetchArticles(true);
    announce('Refreshing news feed');
  }, [fetchArticles, announce]);

  // Apply filters
  const applyFilters = useCallback((newFilters: ContentFilter) => {
    setFilters(newFilters);
    fetchArticles(true);
    announce('Filters applied, updating news feed');
  }, [fetchArticles, announce]);

  // Set up infinite scroll listener
  useEffect(() => {
    const handleLoadMore = () => {
      loadMore();
    };

    document.addEventListener('loadMore', handleLoadMore);
    return () => document.removeEventListener('loadMore', handleLoadMore);
  }, [loadMore]);

  // Initial load
  useEffect(() => {
    fetchArticles(true);
  }, [fetchArticles]);

  // Announce when articles are loaded
  useEffect(() => {
    if (articles.length > 0 && !loading) {
      announce(`Loaded ${articles.length} articles`);
    }
  }, [articles.length, loading, announce]);

  if (error) {
    return (
      <NewsErrorBoundary 
        error={error} 
        onRetry={() => fetchArticles(true)}
      />
    );
  }

  return (
    <div 
      className={cn('space-y-6', className)}
      {...touchHandlers}
      {...keyboardHandlers}
      role="main"
      aria-label="AI News Feed"
    >
      {/* Accessibility announcements */}
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {/* Content will be set dynamically by the announce function */}
      </div>

      {/* Pull to refresh indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pointer-events-none">
        {isPullingToRefresh && (
          <div className="bg-background border border-border rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                {pullToRefreshDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">AI News Feed</h2>
          <p className="text-sm text-muted-foreground">
            Curated AI and technology news
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {lastFetch ? `Updated ${new Date(lastFetch).toLocaleTimeString()}` : 'Loading...'}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="gap-2"
            aria-label="Refresh news feed"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <NewsFilters 
        filters={filters}
        onFiltersChange={applyFilters}
      />

      {/* Content Area */}
      <div className="min-h-[400px]">
        {/* Loading State */}
        {loading && articles.length === 0 ? (
          <NewsLoadingSkeleton count={6} />
        ) : articles.length > 0 ? (
          <div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            role="grid"
            aria-label="News articles"
          >
            {articles.map((article, index) => (
              <div
                key={article.id}
                role="gridcell"
                tabIndex={0}
                aria-label={`Article ${index + 1}: ${article.title}`}
              >
                <NewsCard 
                  article={article}
                  onInteraction={(type: 'view' | 'like' | 'dislike' | 'share') => {
                    // TODO: Implement user interaction tracking
                    console.log('User interaction:', type, article.id);
                    announce(`Interacted with article: ${article.title}`);
                  }}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <Card className="p-8 text-center">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No articles found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or check back later for new content.
                </p>
              </div>
              <Button variant="outline" onClick={refresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      <div className="flex justify-center">
        {hasMore && articles.length > 0 && (
          <div ref={loadMoreRef} className="w-full">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
              className="gap-2 w-full max-w-xs"
              aria-label={loading ? 'Loading more articles' : 'Load more articles'}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Load More
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
