/**
 * Content Service for fetching and processing news content
 * Handles RSS feeds and web scraping for content sources
 */

import { Article, ContentSource, RSSFeedItem, ContentFetchResult } from '@/types/content';
import { aiService } from './ai-service';

export class ContentService {
  private sources: ContentSource[] = [];
  private cache: Map<string, Article[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeDefaultSources();
  }

  /**
   * Initialize default content sources
   */
  private initializeDefaultSources(): void {
    this.sources = [
      {
        id: 'techcrunch-rss',
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        type: 'rss',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'hacker-news',
        name: 'Hacker News',
        url: 'https://hnrss.org/frontpage',
        type: 'rss',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ai-news-scraping',
        name: 'AI News (Scraping)',
        url: 'https://www.artificialintelligence-news.com/',
        type: 'scraping',
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Fetch content from all active sources
   */
  async fetchAllContent(): Promise<ContentFetchResult> {
    const articles: Article[] = [];
    const errors: string[] = [];
    const lastFetch = new Date().toISOString();

    for (const source of this.sources.filter(s => s.active)) {
      try {
        const sourceArticles = await this.fetchFromSource(source);
        articles.push(...sourceArticles);
      } catch (error) {
        console.error(`Failed to fetch from ${source.name}:`, error);
        errors.push(`Failed to fetch from ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Sort by published date (newest first)
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return {
      articles,
      sources: this.sources,
      lastFetch,
      errors,
    };
  }

  /**
   * Fetch content from a specific source
   */
  private async fetchFromSource(source: ContentSource): Promise<Article[]> {
    const cacheKey = `source-${source.id}`;
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    let articles: Article[] = [];

    if (source.type === 'rss') {
      articles = await this.fetchFromRSS(source);
    } else if (source.type === 'scraping') {
      articles = await this.fetchFromScraping(source);
    }

    // Cache the results
    this.cache.set(cacheKey, articles);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

    return articles;
  }

  /**
   * Fetch content from RSS feed
   */
  private async fetchFromRSS(source: ContentSource): Promise<Article[]> {
    try {
      const response = await fetch(source.url);
      if (!response.ok) {
        throw new Error(`RSS fetch failed: ${response.status}`);
      }

      const xmlText = await response.text();
      const feedItems = this.parseRSSFeed(xmlText);
      
      const articles: Article[] = [];
      
      for (const item of feedItems.slice(0, 10)) { // Limit to 10 items per source
        try {
          const article = await this.createArticleFromRSS(item, source);
          articles.push(article);
        } catch (error) {
          console.error(`Failed to process RSS item: ${item.title}`, error);
        }
      }
      
      return articles;
    } catch (error) {
      console.error(`RSS fetch error for ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Fetch content from web scraping
   */
  private async fetchFromScraping(source: ContentSource): Promise<Article[]> {
    try {
      // For now, return mock data for scraping
      // In a real implementation, this would use a scraping service
      const mockArticles: Article[] = [
        {
          id: `scraped-${Date.now()}-1`,
          title: 'AI Breakthrough in Natural Language Processing',
          content: 'Recent advances in transformer models have shown significant improvements in understanding context and generating human-like text.',
          summary: 'New AI models show improved language understanding capabilities.',
          url: `${source.url}/article-1`,
          source: source.name,
          publishedAt: new Date().toISOString(),
          aiAnalysis: {
            relevance: 0.9,
            category: 'technology',
            keyPoints: ['AI advancement', 'NLP improvement', 'Transformer models'],
          },
        },
      ];
      
      return mockArticles;
    } catch (error) {
      console.error(`Scraping error for ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Parse RSS feed XML
   */
  private parseRSSFeed(xmlText: string): RSSFeedItem[] {
    // Simple RSS parsing - in production, use a proper RSS parser
    const items: RSSFeedItem[] = [];
    
    try {
      // Extract items using regex (simplified approach)
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      
      while ((match = itemRegex.exec(xmlText)) !== null) {
        const itemXml = match[1];
        
        const title = this.extractXmlValue(itemXml, 'title');
        const description = this.extractXmlValue(itemXml, 'description');
        const link = this.extractXmlValue(itemXml, 'link');
        const pubDate = this.extractXmlValue(itemXml, 'pubDate');
        const guid = this.extractXmlValue(itemXml, 'guid');
        
        if (title && link) {
          items.push({
            title: this.cleanText(title),
            description: this.cleanText(description),
            link,
            pubDate,
            guid,
          });
        }
      }
    } catch (error) {
      console.error('RSS parsing error:', error);
    }
    
    return items;
  }

  /**
   * Extract value from XML using regex
   */
  private extractXmlValue(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Clean HTML/text content
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Create Article from RSS item
   */
  private async createArticleFromRSS(item: RSSFeedItem, source: ContentSource): Promise<Article> {
    // Analyze content with AI
    const analysis = await aiService.analyzeContent({
      content: item.description,
      title: item.title,
      source: source.name,
    });

    return {
      id: `rss-${source.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title,
      content: item.description,
      summary: analysis.summary || item.description.substring(0, 200) + '...',
      url: item.link,
      source: source.name,
      publishedAt: item.pubDate || new Date().toISOString(),
      aiAnalysis: {
        relevance: analysis.relevance,
        category: analysis.category,
        keyPoints: analysis.keyPoints,
      },
    };
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  /**
   * Get all content sources
   */
  getSources(): ContentSource[] {
    return this.sources;
  }

  /**
   * Add a new content source
   */
  addSource(source: Omit<ContentSource, 'id' | 'createdAt'>): ContentSource {
    const newSource: ContentSource = {
      ...source,
      id: `source-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    this.sources.push(newSource);
    return newSource;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

// Singleton instance
export const contentService = new ContentService();
