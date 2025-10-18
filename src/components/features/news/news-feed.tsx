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
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchArticles(false);
    }
  };

  // Refresh articles
  const refresh = () => {
    fetchArticles(true);
  };

  // Apply filters
  const applyFilters = (newFilters: ContentFilter) => {
    setFilters(newFilters);
    fetchArticles(true);
  };

  // Initial load
  useEffect(() => {
    fetchArticles(true);
  }, []);

  // Refresh when filters change
  useEffect(() => {
    if (articles.length > 0) {
      fetchArticles(true);
    }
  }, [fetchArticles, articles.length]);

  if (error) {
    return (
      <NewsErrorBoundary 
        error={error} 
        onRetry={() => fetchArticles(true)}
      />
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">AI News Feed</h2>
          <p className="text-sm text-muted-foreground">
            Curated AI and technology news
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastFetch && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Updated {new Date(lastFetch).toLocaleTimeString()}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="gap-2"
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

      {/* Loading State */}
      {loading && articles.length === 0 && (
        <NewsLoadingSkeleton count={6} />
      )}

      {/* Articles Grid */}
      {articles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard 
              key={article.id} 
              article={article}
              onInteraction={(type) => {
                // TODO: Implement user interaction tracking
                console.log('User interaction:', type, article.id);
              }}
            />
          ))}
        </div>
      )}

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
      {hasMore && articles.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="gap-2"
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
  );
}
