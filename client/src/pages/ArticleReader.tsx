import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Article } from '../types';
import { articlesAPI } from '../utils/api';
import { ArrowLeft, ExternalLink, Heart, Check, Type, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ArticleReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    if (id) {
      fetchArticle(parseInt(id));
    }
  }, [id]);

  const fetchArticle = async (articleId: number) => {
    try {
      const response = await articlesAPI.getArticle(articleId);
      setArticle(response.data);
      
      // Mark as read when viewing
      if (!response.data.is_read) {
        handleMarkAsRead(response.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Article not found');
      } else {
        toast.error('Failed to load article');
      }
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (article: Article) => {
    try {
      const response = await articlesAPI.updateArticle(article.id, { is_read: true });
      setArticle(response.data);
    } catch (error) {
      // Silent fail for read status
    }
  };

  const handleToggleFavorite = async () => {
    if (!article) return;
    
    try {
      const response = await articlesAPI.updateArticle(article.id, {
        is_favorite: !article.is_favorite
      });
      setArticle(response.data);
      toast.success(article.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update article');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const adjustFontSize = (change: number) => {
    const newSize = Math.max(12, Math.min(24, fontSize + change));
    setFontSize(newSize);
  };

  const formatContent = (content: string) => {
    if (!content) return null;

    // Clean up the content
    let cleanContent = content
      .trim()
      // Remove excessive whitespace
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Normalize line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Remove leading/trailing whitespace from lines
      .split('\n')
      .map(line => line.trim())
      .join('\n');

    // Split into blocks (paragraphs, headings, etc.)
    const blocks = cleanContent.split(/\n\s*\n/).filter(block => block.trim());

    return blocks.map((block, index) => {
      const trimmedBlock = block.trim();
      
      // Skip empty blocks
      if (!trimmedBlock) return null;

      // Check if it's a heading (starts with common heading patterns)
      if (isHeading(trimmedBlock)) {
        const level = getHeadingLevel(trimmedBlock);
        const headingText = trimmedBlock.replace(/^#{1,6}\s*/, '').trim();
        
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          1: 'text-2xl font-bold text-gray-900 mt-8 mb-4',
          2: 'text-xl font-semibold text-gray-900 mt-6 mb-3',
          3: 'text-lg font-semibold text-gray-900 mt-5 mb-2',
          4: 'text-base font-semibold text-gray-900 mt-4 mb-2',
          5: 'text-sm font-semibold text-gray-900 mt-3 mb-1',
          6: 'text-sm font-medium text-gray-900 mt-2 mb-1'
        };

        return (
          <HeadingTag key={index} className={headingClasses[level as keyof typeof headingClasses]}>
            {headingText}
          </HeadingTag>
        );
      }

      // Check if it's a list
      if (isList(trimmedBlock)) {
        return formatList(trimmedBlock, index);
      }

      // Check if it's a quote
      if (isQuote(trimmedBlock)) {
        const quoteText = trimmedBlock.replace(/^>\s*/, '').trim();
        return (
          <blockquote key={index} className="border-l-4 border-primary-200 pl-4 italic text-gray-700 my-6">
            {formatInlineContent(quoteText)}
          </blockquote>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {formatInlineContent(trimmedBlock)}
        </p>
      );
    }).filter(Boolean);
  };

  const isHeading = (text: string): boolean => {
    // Check for markdown-style headings or text that looks like a heading
    return /^#{1,6}\s/.test(text) || 
           (text.length < 100 && text.length > 5 && 
            !text.includes('.') && 
            /^[A-Z]/.test(text) &&
            text === text.toUpperCase());
  };

  const getHeadingLevel = (text: string): number => {
    const match = text.match(/^(#{1,6})\s/);
    if (match) return match[1].length;
    
    // Determine level based on text characteristics
    if (text.length < 30) return 2;
    if (text.length < 50) return 3;
    return 4;
  };

  const isList = (text: string): boolean => {
    const lines = text.split('\n');
    return lines.length > 1 && lines.every(line => 
      /^\s*[-*+•]\s/.test(line) || /^\s*\d+\.\s/.test(line)
    );
  };

  const formatList = (text: string, key: number) => {
    const lines = text.split('\n').filter(line => line.trim());
    const isOrdered = /^\s*\d+\.\s/.test(lines[0]);
    
    const ListTag = isOrdered ? 'ol' : 'ul';
    const listClass = isOrdered ? 'list-decimal list-inside mb-4 pl-4' : 'list-disc list-inside mb-4 pl-4';

    return (
      <ListTag key={key} className={listClass}>
        {lines.map((line, lineIndex) => {
          const cleanLine = line.replace(/^\s*[-*+•]\s/, '').replace(/^\s*\d+\.\s/, '').trim();
          return (
            <li key={lineIndex} className="mb-1">
              {formatInlineContent(cleanLine)}
            </li>
          );
        })}
      </ListTag>
    );
  };

  const isQuote = (text: string): boolean => {
    return text.startsWith('>') || 
           (text.startsWith('"') && text.endsWith('"')) ||
           (text.startsWith('"') && text.endsWith('"'));
  };

  const formatInlineContent = (text: string) => {
    // Handle basic inline formatting like bold, italic, links
    return text
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|https?:\/\/[^\s]+)/g)
      .map((part, index) => {
        // Bold text
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        // Italic text
        if ((part.startsWith('*') && part.endsWith('*')) || 
            (part.startsWith('_') && part.endsWith('_'))) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        // Links
        if (part.startsWith('http')) {
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" 
               className="text-primary-600 underline hover:text-primary-700">
              {part}
            </a>
          );
        }
        return part;
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Font Size Controls */}
              <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
                <Type className="h-4 w-4 text-gray-500" />
                <button
                  onClick={() => adjustFontSize(-2)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Decrease font size"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm text-gray-500 min-w-[2rem] text-center">
                  {fontSize}px
                </span>
                <button
                  onClick={() => adjustFontSize(2)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Increase font size"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  article.is_favorite
                    ? 'text-red-600 hover:text-red-700 bg-red-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
                title={article.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-5 w-5 ${article.is_favorite ? 'fill-current' : ''}`} />
              </button>
              
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                title="View original article"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="prose prose-lg max-w-none">
          {/* Article Header */}
          <header className="mb-8">
            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            
            {article.description && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {article.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <span>Saved on {formatDate(article.created_at)}</span>
                {article.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {article.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {article.is_read && (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  Read
                </div>
              )}
            </div>
          </header>

          {/* Article Body */}
          <div 
            className="article-content leading-relaxed"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.7' }}
          >
            {article.content ? (
              <div className="text-gray-800">
                {formatContent(article.content)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8">
                  <p className="text-gray-600 mb-4">
                    Article content is not available for reading.
                  </p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read on original site
                  </a>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Source: <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                {new URL(article.url).hostname}
              </a>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Back to Articles
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default ArticleReader; 