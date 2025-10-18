/**
 * Article Detail Page
 * Displays full article content with clean typography and mobile-optimized layout
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Container } from '@/components/layout/container';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Clock, 
  Tag, 
  ExternalLink, 
  TrendingUp,
  Bookmark,
  Print
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Article } from '@/types/content';
import { useSharing } from '@/hooks/useSharing';
import { useAccessibility } from '@/hooks/useAccessibility';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const { shareWithFallback, isSharing } = useSharing({
    onShare: () => {
      console.log('Article shared:', article?.id);
    },
    onError: (error) => {
      console.error('Sharing failed:', error);
    },
  });

  const { announce } = useAccessibility({
    announceChanges: true,
    enableKeyboardNavigation: true,
  });

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/content/article/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch article: ${response.status}`);
        }
        
        const articleData = await response.json();
        setArticle(articleData);
        announce(`Loaded article: ${articleData.title}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
        announce('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id, announce]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const articleElement = document.querySelector('[data-article-content]');
      if (!articleElement) return;

      const rect = articleElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(100, 
        ((rect.top * -1) / (rect.height - windowHeight)) * 100
      ));
      
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  const handleShare = async () => {
    if (!article) return;
    
    await shareWithFallback({
      title: article.title,
      text: article.summary,
      url: article.url,
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    announce(isLiked ? 'Article unliked' : 'Article liked');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    announce(isBookmarked ? 'Article bookmark removed' : 'Article bookmarked');
  };

  const handlePrint = () => {
    window.print();
    announce('Print dialog opened');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (relevance >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <Container size="lg" className="py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container size="lg" className="py-8">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <ExternalLink className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Article not found</h3>
                <p className="text-sm text-muted-foreground">
                  {error || 'The article you\'re looking for doesn\'t exist.'}
                </p>
              </div>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 gap-2"
          aria-label="Go back to news feed"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News Feed
        </Button>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground mb-4">
                {article.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{article.source}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(article.publishedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span className="capitalize">{article.aiAnalysis.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs', getRelevanceColor(article.aiAnalysis.relevance))}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {(article.aiAnalysis.relevance * 100).toFixed(0)}% Relevant
              </Badge>
            </div>
          </div>

          <Separator />
        </div>
      </div>

      {/* Article Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Article Summary
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className={cn(
                      'gap-2',
                      isBookmarked && 'text-primary'
                    )}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                  >
                    <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrint}
                    className="gap-2"
                    aria-label="Print article"
                  >
                    <Print className="h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                data-article-content
                className="prose prose-gray dark:prose-invert max-w-none"
              >
                <div className="text-lg leading-relaxed text-muted-foreground mb-6">
                  {article.summary}
                </div>

                {article.content && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="text-sm text-muted-foreground mb-4">
                      Full Content
                    </div>
                    <div 
                      className="whitespace-pre-wrap leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Key Points */}
          {article.aiAnalysis.keyPoints.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Key Points</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {article.aiAnalysis.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Actions</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={handleShare}
                disabled={isSharing}
                className="w-full gap-2"
                aria-label="Share article"
              >
                <Share2 className={cn('h-4 w-4', isSharing && 'animate-pulse')} />
                {isSharing ? 'Sharing...' : 'Share Article'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleLike}
                className={cn(
                  'w-full gap-2',
                  isLiked && 'text-red-500 border-red-200 hover:bg-red-50'
                )}
                aria-label={isLiked ? 'Unlike article' : 'Like article'}
              >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                className="w-full gap-2"
                aria-label="Open original article in new tab"
              >
                <ExternalLink className="h-4 w-4" />
                Read Original
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
