'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentFilter } from '@/types/content';
import { Filter, Clock, Tag, TrendingUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsFiltersProps {
  filters: ContentFilter;
  onFiltersChange: (filters: ContentFilter) => void;
  className?: string;
}

const TIME_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'last_hour', label: 'Last Hour' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
] as const;

const CATEGORIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'science', label: 'Science' },
  { value: 'ai', label: 'AI & ML' },
  { value: 'startup', label: 'Startups' },
] as const;

const RELEVANCE_LEVELS = [
  { value: 0.3, label: 'Low (0.3+)' },
  { value: 0.5, label: 'Medium (0.5+)' },
  { value: 0.7, label: 'High (0.7+)' },
  { value: 0.9, label: 'Very High (0.9+)' },
] as const;

export function NewsFilters({ filters, onFiltersChange, className }: NewsFiltersProps) {
  // Remove unused filters parameter warning by using it
  const _ = filters;
  const handleTimeRangeChange = (timeRange: string) => {
    onFiltersChange({
      ...filters,
      timeRange: timeRange as ContentFilter['timeRange'],
    });
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories?.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...(filters.categories || []), category];
    
    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const handleRelevanceChange = (relevance: number) => {
    onFiltersChange({
      ...filters,
      relevance: relevance,
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      timeRange: 'all',
      relevance: 0.5,
    });
  };

  const hasActiveFilters = 
    filters.timeRange !== 'all' || 
    filters.relevance !== 0.5 || 
    (filters.categories && filters.categories.length > 0);

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-1 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Time Range Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time Range</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TIME_RANGES.map((range) => (
                <Button
                  key={range.value}
                  variant={filters.timeRange === range.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeRangeChange(range.value)}
                  className="text-xs"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Categories</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category.value}
                  variant={filters.categories?.includes(category.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.value)}
                  className="text-xs"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Relevance Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Relevance</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RELEVANCE_LEVELS.map((level) => (
                <Button
                  key={level.value}
                  variant={filters.relevance === level.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRelevanceChange(level.value)}
                  className="text-xs"
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Active filters:</span>
              <div className="mt-1 space-y-1">
                {filters.timeRange !== 'all' && (
                  <div>• Time: {TIME_RANGES.find(r => r.value === filters.timeRange)?.label}</div>
                )}
                {filters.categories && filters.categories.length > 0 && (
                  <div>• Categories: {filters.categories.join(', ')}</div>
                )}
                {filters.relevance !== 0.5 && (
                  <div>• Relevance: {RELEVANCE_LEVELS.find(r => r.value === filters.relevance)?.label}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
