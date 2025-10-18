import { NextRequest, NextResponse } from 'next/server';
import { Article } from '@/types/content';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articles } = body;

    if (!articles) {
      return NextResponse.json(
        { error: 'Articles data is required' },
        { status: 400 }
      );
    }

    // Process the articles from N8n
    console.log('Received articles from N8n:', articles);

    // Production implementation:
    // 1. Store articles in your database (Supabase)
    // 2. Update cache (Redis)
    // 3. Send real-time updates to connected clients (WebSocket)
    // 4. Trigger notifications for high-relevance content
    
    // TODO: Implement database storage
    // TODO: Implement cache updates
    // TODO: Implement real-time notifications
    
    // For now, log the received data
    if (Array.isArray(articles)) {
      articles.forEach((article: Article) => {
        console.log(`Processed article: ${article.title} (Relevance: ${article.aiAnalysis.relevance})`);
      });
    } else {
      console.log(`Processed single article: ${articles.title} (Relevance: ${articles.aiAnalysis.relevance})`);
    }

    return NextResponse.json({
      success: true,
      message: 'Articles processed successfully',
      count: Array.isArray(articles) ? articles.length : 1
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook data' },
      { status: 500 }
    );
  }
}
