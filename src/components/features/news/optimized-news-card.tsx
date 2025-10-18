/**
 * Optimized NewsCard component with performance enhancements
 */

'use client';

import React, { useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Article } from '@/types/content';
import { ExternalLink, Heart, Share2, Clock, Tag, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSharing } from '@/hooks/useSharing';
import { useOptimizedImage } from '@/hooks/useOptimizedImage';
import { usePerformance } from '@/hooks/usePerformance';
import Image from 'next/image';
import Link from 'next/link';

interface OptimizedNewsCardProps {
  article: Article;
  onInteraction?: (type: 'view' | 'like' | 'dislike' | 'share') => void;
  className?: string;
  priority?: boolean; // For above-the-fold content
}

export const OptimizedNewsCard = memo(function OptimizedNewsCard({ 
  article, 
  onInteraction, 
  className,
  priority = false 
}: OptimizedNewsCardProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { measureRender } = usePerformance({
    trackCoreWebVitals: true,
    trackCustomMetrics: true,
  });

  // Optimized image loading
  const imageConfig = {
    src: (article as any).image_url || '/placeholder-news.jpg',
    alt: article.title,
    width: 400,
    height: 200,
    priority,
    placeholder: '/placeholder-news-blur.jpg',
    fallback: '/placeholder-news.jpg',
    quality: 80,
  };

  const { getImageProps, getPlaceholderProps, isLoaded: imageLoaded } = useOptimizedImage(imageConfig);

  const { shareWithFallback, isSharing } = useSharing({
    onShare: () => {
      onInteraction?.('share');
    },
    onError: (error) => {
      console.error('Sharing failed:', error);
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onInteraction?.(isLiked ? 'dislike' : 'like');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await shareWithFallback({
      title: article.title,
      text: article.summary,
      url: article.url,
    });
  };

  const handleView = () => {
    onInteraction?.('view');
  };

  const handleExternalView = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(article.url, '_blank', 'noopener,noreferrer');
    onInteraction?.('view');
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Render the component
  return (
    <Card 
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
        'border border-border bg-card text-card-foreground',
        className
      )}
      onClick={handleView}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {imageLoaded ? (
          <Image
            {...getImageProps()}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div {...getPlaceholderProps()} />
        )}
        
        {/* Overlay with metadata */}
        <div className="absolute top-2 left-2 flex gap-2">
          <span className="px-2 py-1 bg-black/70 text-white rounded-full text-xs">
            AI News
          </span>
        </div>

        {/* Relevance score */}
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-green-600">
            <TrendingUp className="w-3 h-3" />
            85%
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              'flex-shrink-0 p-1 h-auto',
              isLiked && 'text-red-500'
            )}
          >
            <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
          </Button>
        </div>
        
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {article.summary}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Source and timestamp */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>{article.source}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>

        {/* Tags */}
        {(article as any).tags && (article as any).tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(article as any).tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
            {(article as any).tags.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                +{(article as any).tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExternalView}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-3 h-3" />
            Read Full Article
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2"
          >
            <Share2 className="w-3 h-3" />
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// Export with display name for debugging
OptimizedNewsCard.displayName = 'OptimizedNewsCard';
