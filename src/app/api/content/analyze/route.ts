import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/ai-service';
import { ContentAnalysisRequest } from '@/types/content';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.content || !body.title || !body.source) {
      return NextResponse.json(
        { error: 'Missing required fields: content, title, source' },
        { status: 400 }
      );
    }

    const analysisRequest: ContentAnalysisRequest = {
      content: body.content,
      title: body.title,
      source: body.source,
    };

    // Analyze content using AI service
    const analysis = await aiService.analyzeContent(analysisRequest);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Content analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}
