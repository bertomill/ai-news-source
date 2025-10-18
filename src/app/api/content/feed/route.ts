import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/content-service';
import { ContentFilter } from '@/types/content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // const userId = searchParams.get('userId'); // TODO: Implement user-specific filtering
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const timeRange = searchParams.get('timeRange') as 'last_hour' | 'today' | 'this_week' | 'all' || 'all';
    const relevance = parseFloat(searchParams.get('relevance') || '0.5');

    // Create filter from query parameters
    const filter: ContentFilter = {
      categories: category ? [category] : undefined,
      timeRange,
      relevance,
    };

    // Fetch content from all sources
    const result = await contentService.fetchAllContent();
    
    // Apply filters
    let filteredArticles = result.articles;

    // Filter by category
    if (filter.categories && filter.categories.length > 0) {
      filteredArticles = filteredArticles.filter(article =>
        filter.categories!.includes(article.aiAnalysis.category)
      );
    }

    // Filter by time range
    if (filter.timeRange && filter.timeRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filter.timeRange) {
        case 'last_hour':
          cutoff.setHours(now.getHours() - 1);
          break;
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'this_week':
          cutoff.setDate(now.getDate() - 7);
          break;
      }
      
      filteredArticles = filteredArticles.filter(article =>
        new Date(article.publishedAt) >= cutoff
      );
    }

    // Filter by relevance
    if (filter.relevance !== undefined) {
      filteredArticles = filteredArticles.filter(article =>
        article.aiAnalysis.relevance >= filter.relevance!
      );
    }

    // Sort by relevance and date
    filteredArticles.sort((a, b) => {
      const relevanceDiff = b.aiAnalysis.relevance - a.aiAnalysis.relevance;
      if (Math.abs(relevanceDiff) > 0.1) {
        return relevanceDiff;
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    // Apply limit
    const limitedArticles = filteredArticles.slice(0, limit);

    return NextResponse.json({
      articles: limitedArticles,
      totalCount: filteredArticles.length,
      hasMore: filteredArticles.length > limit,
      nextCursor: limitedArticles.length > 0 ? 
        limitedArticles[limitedArticles.length - 1].id : undefined,
      lastFetch: result.lastFetch,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Content feed API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content feed' },
      { status: 500 }
    );
  }
}
