/**
 * AI Service for content analysis and curation
 * Integrates with OpenAI API for intelligent content processing
 */

import { ContentAnalysisRequest, ContentAnalysisResponse } from '@/types/content';

export class AIService {
  private apiKey: string;
  private baseUrl: string;
  private rateLimitDelay: number = 1000; // 1 second between requests
  private lastRequestTime: number = 0;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Analyze content for relevance, category, and key points
   */
  async analyzeContent(request: ContentAnalysisRequest): Promise<ContentAnalysisResponse> {
    // Check if service is configured
    if (!this.isConfigured()) {
      console.warn('OpenAI API not configured, returning fallback analysis');
      return this.getFallbackAnalysis(request);
    }

    await this.enforceRateLimit();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI content analyst for a news aggregation service. 
              Analyze the provided content and return a JSON response with:
              - relevance: number (0-1, how relevant to AI/tech news)
              - category: string (technology, business, science, etc.)
              - keyPoints: array of 3-5 key points
              - summary: brief 2-3 sentence summary
              
              Focus on AI, technology, and innovation news.`
            },
            {
              role: 'user',
              content: `Title: ${request.title}\n\nContent: ${request.content}\n\nSource: ${request.source}`
            }
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      // Parse JSON response
      const analysis = JSON.parse(content);
      
      return {
        relevance: Math.max(0, Math.min(1, analysis.relevance || 0)),
        category: analysis.category || 'general',
        keyPoints: analysis.keyPoints || [],
        summary: analysis.summary || '',
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackAnalysis(request);
    }
  }

  /**
   * Batch analyze multiple articles
   */
  async batchAnalyzeContent(requests: ContentAnalysisRequest[]): Promise<ContentAnalysisResponse[]> {
    const results: ContentAnalysisResponse[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.analyzeContent(request);
        results.push(result);
      } catch (error) {
        console.error(`Batch analysis failed for article: ${request.title}`, error);
        results.push({
          relevance: 0.5,
          category: 'general',
          keyPoints: ['Analysis failed'],
          summary: 'Content analysis unavailable',
        });
      }
    }
    
    return results;
  }

  /**
   * Enforce rate limiting to avoid API quota issues
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Get fallback analysis when AI service is unavailable
   */
  private getFallbackAnalysis(request: ContentAnalysisRequest): ContentAnalysisResponse {
    // Simple keyword-based analysis as fallback
    const content = (request.title + ' ' + request.content).toLowerCase();
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'neural', 'algorithm', 'automation'];
    const techKeywords = ['technology', 'software', 'programming', 'development', 'startup', 'innovation'];
    
    const aiScore = aiKeywords.filter(keyword => content.includes(keyword)).length / aiKeywords.length;
    const techScore = techKeywords.filter(keyword => content.includes(keyword)).length / techKeywords.length;
    const relevance = Math.min(0.9, (aiScore + techScore) / 2);
    
    return {
      relevance: Math.max(0.3, relevance),
      category: aiScore > techScore ? 'ai' : 'technology',
      keyPoints: [
        'Content analysis via fallback method',
        'AI analysis temporarily unavailable',
        'Basic keyword matching applied'
      ],
      summary: request.content.substring(0, 200) + '...',
    };
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Singleton instance
export const aiService = new AIService();
