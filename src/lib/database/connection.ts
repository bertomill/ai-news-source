/**
 * Database connection and configuration utilities
 */

import { createClient } from '@supabase/supabase-js';

// Database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client with performance optimizations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'ai-news-tap@1.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database schema types
export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: string;
  url: string;
  published_at: string;
  category: string;
  relevance_score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  category_preferences: Record<string, number>;
  source_preferences: Record<string, number>;
  time_preferences: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  notification_settings: {
    enabled: boolean;
    frequency: 'realtime' | 'hourly' | 'daily';
  };
  created_at: string;
  updated_at: string;
}

export interface UserInteraction {
  id: string;
  user_id: string;
  article_id: string;
  interaction_type: 'view' | 'click' | 'share' | 'bookmark' | 'like' | 'dislike';
  duration?: number; // Time spent reading in seconds
  created_at: string;
}

// Database queries with performance optimization
export class DatabaseService {
  private static instance: DatabaseService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Cache management
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // Article queries
  async getArticles(params: {
    limit?: number;
    offset?: number;
    category?: string;
    timeRange?: 'hour' | 'day' | 'week' | 'month';
    minRelevance?: number;
  } = {}): Promise<Article[]> {
    const { limit = 20, offset = 0, category, timeRange = 'day', minRelevance = 0.5 } = params;
    
    const cacheKey = `articles_${JSON.stringify(params)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    let query = supabase
      .from('articles')
      .select('*')
      .gte('relevance_score', minRelevance)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (timeRange !== 'day' && timeRange !== 'week' && timeRange !== 'month' && timeRange !== 'hour') {
      const timeMap = {
        hour: new Date(Date.now() - 60 * 60 * 1000),
        day: new Date(Date.now() - 24 * 60 * 60 * 1000),
        week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
      query = query.gte('published_at', (timeMap[timeRange] as Date).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Failed to fetch articles');
    }

    this.setCachedData(cacheKey, data);
    return data || [];
  }

  async getArticleById(id: string): Promise<Article | null> {
    const cacheKey = `article_${id}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching article:', error);
      return null;
    }

    this.setCachedData(cacheKey, data);
    return data;
  }

  // User preference queries
  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    const cacheKey = `preferences_${userId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user preferences:', error);
      return null;
    }

    this.setCachedData(cacheKey, data);
    return data;
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreference>): Promise<UserPreference> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating user preferences:', error);
      throw new Error('Failed to update preferences');
    }

    // Clear related cache
    this.cache.delete(`preferences_${userId}`);
    return data;
  }

  // User interaction tracking
  async trackInteraction(interaction: Omit<UserInteraction, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('user_interactions')
      .insert({
        ...interaction,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking interaction:', error);
      // Don't throw error for tracking failures
    }
  }

  // Analytics queries
  async getUserAnalytics(userId: string, timeRange: 'day' | 'week' | 'month' = 'week') {
    const timeMap = {
      day: new Date(Date.now() - 24 * 60 * 60 * 1000),
      week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    };

    const { data, error } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', timeMap[timeRange].toISOString());

    if (error) {
      console.error('Error fetching user analytics:', error);
      return null;
    }

    return data;
  }

  // Performance monitoring
  async getPerformanceMetrics(): Promise<{
    totalArticles: number;
    avgRelevanceScore: number;
    topCategories: Array<{ category: string; count: number }>;
    recentActivity: number;
  }> {
    const cacheKey = 'performance_metrics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const [
      { count: totalArticles },
      { data: articles },
      { data: interactions },
    ] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('relevance_score, category'),
      supabase
        .from('user_interactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const avgRelevanceScore = articles
      ? articles.reduce((sum, article) => sum + article.relevance_score, 0) / articles.length
      : 0;

    const categoryCount = articles?.reduce((acc: Record<string, number>, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const metrics = {
      totalArticles: totalArticles || 0,
      avgRelevanceScore,
      topCategories,
      recentActivity: interactions?.length || 0,
    };

    this.setCachedData(cacheKey, metrics);
    return metrics;
  }

  // Cache management methods
  invalidateCache(pattern?: string): void {
    if (pattern) {
      Array.from(this.cache.keys()).forEach(key => {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.clearCache();
    }
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();
