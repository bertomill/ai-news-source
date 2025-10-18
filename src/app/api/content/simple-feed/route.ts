import { NextRequest, NextResponse } from 'next/server';

// Mock data for now - in production this would come from your database
const mockArticles = [
  {
    id: 'article-1',
    title: 'AI Breakthrough in Natural Language Processing',
    content: 'Recent advances in transformer models have shown significant improvements in understanding context and generating human-like text.',
    summary: 'New AI models show improved language understanding capabilities.',
    url: 'https://example.com/article-1',
    source: 'TechCrunch',
    publishedAt: new Date().toISOString(),
    aiAnalysis: {
      relevance: 0.9,
      category: 'technology',
      keyPoints: ['AI advancement', 'NLP improvement', 'Transformer models']
    }
  },
  {
    id: 'article-2',
    title: 'Machine Learning Revolutionizes Healthcare',
    content: 'AI-powered diagnostic tools are transforming patient care and medical research.',
    summary: 'Healthcare AI shows promising results in diagnostic accuracy.',
    url: 'https://example.com/article-2',
    source: 'AI News',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    aiAnalysis: {
      relevance: 0.8,
      category: 'healthcare',
      keyPoints: ['Healthcare AI', 'Diagnostic tools', 'Medical research']
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const timeRange = searchParams.get('timeRange') || 'all';

    // Simple filtering logic
    let filteredArticles = mockArticles;

    // Filter by category
    if (category) {
      filteredArticles = filteredArticles.filter(article =>
        article.aiAnalysis.category === category
      );
    }

    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (timeRange) {
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

    // Apply limit
    const limitedArticles = filteredArticles.slice(0, limit);

    return NextResponse.json({
      articles: limitedArticles,
      totalCount: filteredArticles.length,
      hasMore: filteredArticles.length > limit,
      lastFetch: new Date().toISOString(),
      source: 'N8n Pipeline'
    });
  } catch (error) {
    console.error('Simple feed API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content feed' },
      { status: 500 }
    );
  }
}
