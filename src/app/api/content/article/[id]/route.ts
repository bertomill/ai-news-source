/**
 * API route for fetching individual articles
 * GET /api/content/article/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { Article } from '@/types/content';

// Mock article data - in production this would come from your database
const mockArticles: Article[] = [
  {
    id: 'article-1',
    title: 'OpenAI Releases GPT-5 with Revolutionary Capabilities',
    content: `
      <p>OpenAI has announced the release of GPT-5, their most advanced language model to date. This new model represents a significant leap forward in artificial intelligence capabilities, offering unprecedented understanding and generation of human-like text.</p>
      
      <h2>Key Features</h2>
      <p>The new GPT-5 model includes several groundbreaking features:</p>
      <ul>
        <li>Enhanced reasoning capabilities that rival human-level problem solving</li>
        <li>Improved multimodal understanding across text, images, and audio</li>
        <li>Better context retention for longer conversations</li>
        <li>Reduced hallucination rates by 60% compared to previous models</li>
      </ul>
      
      <h2>Performance Improvements</h2>
      <p>Early benchmarks show GPT-5 outperforming its predecessors across multiple domains:</p>
      <ul>
        <li>Code generation accuracy increased by 40%</li>
        <li>Mathematical reasoning improved by 55%</li>
        <li>Creative writing quality enhanced by 35%</li>
        <li>Factual accuracy improved by 70%</li>
      </ul>
      
      <h2>Applications and Impact</h2>
      <p>The release of GPT-5 is expected to have significant implications across various industries, from education and healthcare to software development and creative industries. The model's improved capabilities open up new possibilities for AI-assisted work and research.</p>
    `,
    summary: 'OpenAI announces GPT-5, their most advanced language model with revolutionary capabilities including enhanced reasoning, multimodal understanding, and significantly reduced hallucination rates.',
    url: 'https://example.com/openai-gpt5-release',
    source: 'AI News Daily',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    aiAnalysis: {
      relevance: 0.95,
      category: 'artificial-intelligence',
      keyPoints: [
        'GPT-5 represents a significant leap in AI capabilities',
        '60% reduction in hallucination rates compared to previous models',
        'Enhanced multimodal understanding across text, images, and audio',
        '40% improvement in code generation accuracy',
        'Expected to impact multiple industries including education and healthcare'
      ],
    },
  },
  {
    id: 'article-2',
    title: 'Google Unveils Next-Generation AI Search with Real-Time Information',
    content: `
      <p>Google has unveiled its next-generation AI-powered search engine, designed to provide real-time information and more accurate results through advanced machine learning algorithms.</p>
      
      <h2>Real-Time Information Processing</h2>
      <p>The new search engine can process and index information in real-time, providing users with the most current data available. This represents a major advancement over traditional search engines that rely on periodic crawling and indexing.</p>
      
      <h2>Enhanced AI Understanding</h2>
      <p>Google's new AI search incorporates advanced natural language processing capabilities, allowing it to better understand user intent and provide more relevant results. The system can also generate comprehensive summaries of complex topics.</p>
      
      <h2>Privacy and Security</h2>
      <p>The company has emphasized its commitment to user privacy, implementing new safeguards to protect user data while still providing personalized search experiences.</p>
    `,
    summary: 'Google announces next-generation AI search with real-time information processing and enhanced understanding capabilities.',
    url: 'https://example.com/google-ai-search',
    source: 'Tech Today',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    aiAnalysis: {
      relevance: 0.88,
      category: 'search-technology',
      keyPoints: [
        'Real-time information processing and indexing',
        'Advanced natural language processing for better user intent understanding',
        'Enhanced privacy and security measures',
        'Comprehensive topic summarization capabilities'
      ],
    },
  },
  {
    id: 'article-3',
    title: 'Microsoft Integrates AI Copilot Across All Office Applications',
    content: `
      <p>Microsoft has announced the integration of its AI Copilot across all Office applications, bringing intelligent assistance to Word, Excel, PowerPoint, and other productivity tools.</p>
      
      <h2>Universal AI Assistance</h2>
      <p>The AI Copilot will now be available across the entire Microsoft Office suite, providing context-aware suggestions and automation capabilities. Users can leverage AI assistance for writing, data analysis, presentation creation, and more.</p>
      
      <h2>Contextual Understanding</h2>
      <p>The AI system can understand the context of documents and provide relevant suggestions based on the content being worked on. This includes style recommendations, data insights, and formatting suggestions.</p>
      
      <h2>Productivity Enhancements</h2>
      <p>Early testing shows significant productivity improvements, with users reporting faster document creation and more accurate data analysis when using the AI-assisted features.</p>
    `,
    summary: 'Microsoft integrates AI Copilot across all Office applications, providing intelligent assistance for writing, data analysis, and presentation creation.',
    url: 'https://example.com/microsoft-ai-copilot-office',
    source: 'Productivity Weekly',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    aiAnalysis: {
      relevance: 0.82,
      category: 'productivity-software',
      keyPoints: [
        'Universal AI assistance across Microsoft Office suite',
        'Context-aware suggestions and automation capabilities',
        'Significant productivity improvements in early testing',
        'Enhanced document creation and data analysis features'
      ],
    },
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Find the article by ID
    const article = mockArticles.find(a => a.id === id);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Return the article
    return NextResponse.json(article, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}