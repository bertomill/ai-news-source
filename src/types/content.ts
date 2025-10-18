/**
 * Content-related TypeScript definitions for AI News Tap
 * Based on solution architecture schema and API interfaces
 */

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  aiAnalysis: {
    relevance: number;
    category: string;
    keyPoints: string[];
  };
}

export interface UserPreferences {
  categories: string[];
  sources: string[];
  learningData: {
    totalInteractions: number;
    categoryWeights: Record<string, number>;
  };
}

export interface ContentSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'scraping';
  active: boolean;
  createdAt: string;
}

export interface UserInteraction {
  id: string;
  userId: string;
  articleId: string;
  interactionType: 'view' | 'like' | 'dislike' | 'share';
  createdAt: string;
}

export interface ContentFilter {
  categories?: string[];
  timeRange?: 'last_hour' | 'today' | 'this_week' | 'all';
  sources?: string[];
  relevance?: number;
}

export interface NewsFeedResponse {
  articles: Article[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ContentAnalysisRequest {
  content: string;
  title: string;
  source: string;
}

export interface ContentAnalysisResponse {
  relevance: number;
  category: string;
  keyPoints: string[];
  summary: string;
}

export interface RSSFeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid?: string;
}

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  publishedAt: string;
  author?: string;
}

export interface ContentFetchResult {
  articles: Article[];
  sources: ContentSource[];
  lastFetch: string;
  errors: string[];
}
