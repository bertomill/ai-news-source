/**
 * Tests for Article Detail Page
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleDetailPage from '@/app/(main)/article/[id]/page';
import { useParams, useRouter } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock hooks
jest.mock('@/hooks/useSharing');
jest.mock('@/hooks/useAccessibility');

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockArticle = {
  id: 'test-article-1',
  title: 'Test Article Title',
  content: 'This is the full article content with detailed information.',
  summary: 'This is a summary of the test article.',
  url: 'https://example.com/test-article',
  source: 'Test Source',
  publishedAt: new Date().toISOString(),
  aiAnalysis: {
    relevance: 0.85,
    category: 'technology',
    keyPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
  },
};

describe('ArticleDetailPage', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseParams.mockReturnValue({ id: 'test-article-1' });
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
      refresh: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      replace: jest.fn(),
    });

    // Mock successful fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockArticle),
    });
  });

  it('should render loading state initially', () => {
    render(<ArticleDetailPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render article content after loading', async () => {
    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      expect(screen.getByText('This is a summary of the test article.')).toBeInTheDocument();
      expect(screen.getByText('Test Source')).toBeInTheDocument();
    });
  });

  it('should render key points section', async () => {
    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Key Points')).toBeInTheDocument();
      expect(screen.getByText('Key point 1')).toBeInTheDocument();
      expect(screen.getByText('Key point 2')).toBeInTheDocument();
      expect(screen.getByText('Key point 3')).toBeInTheDocument();
    });
  });

  it('should render action buttons', async () => {
    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Share Article')).toBeInTheDocument();
      expect(screen.getByText('Like')).toBeInTheDocument();
      expect(screen.getByText('Bookmark')).toBeInTheDocument();
      expect(screen.getByText('Read Original')).toBeInTheDocument();
      expect(screen.getByText('Print')).toBeInTheDocument();
    });
  });

  it('should handle back button click', async () => {
    render(<ArticleDetailPage />);

    await waitFor(() => {
      const backButton = screen.getByText('Back to News Feed');
      fireEvent.click(backButton);
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it('should handle like button click', async () => {
    render(<ArticleDetailPage />);

    await waitFor(() => {
      const likeButton = screen.getByText('Like');
      fireEvent.click(likeButton);
    });

    expect(screen.getByText('Liked')).toBeInTheDocument();
  });

  it('should handle bookmark button click', async () => {
    render(<ArticleDetailPage />);

    await waitFor(() => {
      const bookmarkButton = screen.getByText('Bookmark');
      fireEvent.click(bookmarkButton);
    });

    expect(screen.getByText('Bookmarked')).toBeInTheDocument();
  });

  it('should handle print button click', async () => {
    const mockPrint = jest.spyOn(window, 'print').mockImplementation(() => {});

    render(<ArticleDetailPage />);

    await waitFor(() => {
      const printButton = screen.getByText('Print');
      fireEvent.click(printButton);
    });

    expect(mockPrint).toHaveBeenCalled();
    mockPrint.mockRestore();
  });

  it('should handle external link click', async () => {
    const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null);

    render(<ArticleDetailPage />);

    await waitFor(() => {
      const readOriginalButton = screen.getByText('Read Original');
      fireEvent.click(readOriginalButton);
    });

    expect(mockOpen).toHaveBeenCalledWith(
      mockArticle.url,
      '_blank',
      'noopener,noreferrer'
    );
    mockOpen.mockRestore();
  });

  it('should render error state when article is not found', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Article not found')).toBeInTheDocument();
    });
  });

  it('should render error state when fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Article not found')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should display reading progress bar', async () => {
    render(<ArticleDetailPage />);

    await waitFor(() => {
      const progressBar = document.querySelector('[style*="width: 0%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  it('should display relevance badge with correct styling', async () => {
    render(<ArticleDetailPage />);

    await waitFor(() => {
      const relevanceBadge = screen.getByText('85% Relevant');
      expect(relevanceBadge).toBeInTheDocument();
    });
  });

  it('should format time ago correctly', async () => {
    const recentTime = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago
    const articleWithRecentTime = { ...mockArticle, publishedAt: recentTime };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(articleWithRecentTime),
    });

    render(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    });
  });
});
