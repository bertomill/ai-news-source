import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { NewsFeed } from '@/components/features/news/news-feed';
import { NewsCard } from '@/components/features/news/news-card';
import { Article } from '@/types/content';

// Mock fetch
global.fetch = jest.fn();

// Mock article data
const mockArticle: Article = {
  id: 'test-article-1',
  title: 'AI Breakthrough in Natural Language Processing',
  content: 'Recent advances in transformer models have shown significant improvements...',
  summary: 'New AI models show improved language understanding capabilities.',
  url: 'https://example.com/article-1',
  source: 'TechCrunch',
  publishedAt: new Date().toISOString(),
  aiAnalysis: {
    relevance: 0.9,
    category: 'technology',
    keyPoints: ['AI advancement', 'NLP improvement', 'Transformer models'],
  },
};

describe('NewsFeed', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: [],
        totalCount: 0,
        hasMore: false,
        lastFetch: new Date().toISOString(),
        errors: [],
      }),
    });

    render(<NewsFeed />);
    
    expect(screen.getByText('AI News Feed')).toBeInTheDocument();
    expect(screen.getByText('Curated AI and technology news')).toBeInTheDocument();
  });

  it('renders articles when data is loaded', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: [mockArticle],
        totalCount: 1,
        hasMore: false,
        lastFetch: new Date().toISOString(),
        errors: [],
      }),
    });

    render(<NewsFeed />);
    
    await waitFor(() => {
      expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
      expect(screen.getByText(mockArticle.summary)).toBeInTheDocument();
      expect(screen.getByText(mockArticle.source)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<NewsFeed />);
    
    await waitFor(() => {
      expect(screen.getByText(/Connection Error|Something went wrong/)).toBeInTheDocument();
    });
  });
});

describe('NewsCard', () => {
  it('renders article information correctly', () => {
    render(<NewsCard article={mockArticle} />);
    
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    expect(screen.getByText(mockArticle.summary)).toBeInTheDocument();
    expect(screen.getByText(mockArticle.source)).toBeInTheDocument();
    expect(screen.getByText(mockArticle.aiAnalysis.category)).toBeInTheDocument();
  });

  it('shows key points when expanded', () => {
    render(<NewsCard article={mockArticle} />);
    
    // Click show more button
    const showMoreButton = screen.getByText('Show More');
    showMoreButton.click();
    
    expect(screen.getByText('Key Points:')).toBeInTheDocument();
    expect(screen.getByText('AI advancement')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const mockOnInteraction = jest.fn();
    render(<NewsCard article={mockArticle} onInteraction={mockOnInteraction} />);
    
    // Click like button
    const likeButton = screen.getByRole('button', { name: /like/i });
    likeButton.click();
    
    expect(mockOnInteraction).toHaveBeenCalledWith('like');
  });
});
