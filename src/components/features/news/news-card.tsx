'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Article } from '@/types/content';
import { ExternalLink, Heart, Share2, Clock, Tag, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSharing } from '@/hooks/useSharing';
import Link from 'next/link';

interface NewsCardProps {
  article: Article;
  onInteraction?: (type: 'view' | 'like' | 'dislike' | 'share') => void;
  className?: string;
}

export function NewsCard({ article, onInteraction, className }: NewsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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
    onInteraction?.('view');
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return 'text-green-600';
    if (relevance >= 0.6) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getRelevanceLabel = (relevance: number) => {
    if (relevance >= 0.8) return 'High';
    if (relevance >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <Link href={`/article/${article.id}`} className="block">
      <Card 
        className={cn(
          'notion-card transition-all duration-200 hover:shadow-notion-lg cursor-pointer group',
          className
        )}
        onClick={handleView}
        role="article"
        aria-label={`Article: ${article.title}`}
      >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="font-medium">{article.source}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(article.publishedAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              getRelevanceColor(article.aiAnalysis.relevance),
              'bg-muted'
            )}>
              <TrendingUp className="h-3 w-3" />
              {getRelevanceLabel(article.aiAnalysis.relevance)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="text-sm leading-relaxed line-clamp-3">
          {article.summary}
        </CardDescription>

        {/* Category and Key Points */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground capitalize">
              {article.aiAnalysis.category}
            </span>
          </div>
          
          {isExpanded && article.aiAnalysis.keyPoints.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Key Points:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {article.aiAnalysis.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-primary">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                'h-8 w-8 p-0',
                isLiked && 'text-red-500 hover:text-red-600'
              )}
            >
              <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
              className="h-8 w-8 p-0"
              aria-label={`Share article: ${article.title}`}
            >
              <Share2 className={cn('h-4 w-4', isSharing && 'animate-pulse')} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-xs"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExternalView}
              className="gap-1 text-xs"
              aria-label="Open original article in new tab"
            >
              <ExternalLink className="h-3 w-3" />
              Read Original
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
