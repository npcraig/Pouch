import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Article } from '../types';
import { articlesAPI } from '../utils/api';
import { Plus, Search, Filter, BookOpen, ExternalLink, Heart, Check, Trash2, Tag, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');
  const [filterFavorite, setFilterFavorite] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [searchTerm, filterRead, filterFavorite]);

  const fetchArticles = async () => {
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterRead !== 'all') params.is_read = filterRead === 'read';
      if (filterFavorite) params.is_favorite = true;

      const response = await articlesAPI.getArticles(params);
      setArticles(response.data);
    } catch (error) {
      toast.error('Failed to fetch articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsAddingArticle(true);
    try {
      const response = await articlesAPI.addArticle(newUrl);
      setArticles([response.data, ...articles]);
      setNewUrl('');
      toast.success('Article saved!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save article');
    } finally {
      setIsAddingArticle(false);
    }
  };

  const handleToggleRead = async (article: Article) => {
    try {
      const response = await articlesAPI.updateArticle(article.id, {
        is_read: !article.is_read
      });
      setArticles(articles.map(a => a.id === article.id ? response.data : a));
      toast.success(article.is_read ? 'Marked as unread' : 'Marked as read');
    } catch (error) {
      toast.error('Failed to update article');
    }
  };

  const handleToggleFavorite = async (article: Article) => {
    try {
      const response = await articlesAPI.updateArticle(article.id, {
        is_favorite: !article.is_favorite
      });
      setArticles(articles.map(a => a.id === article.id ? response.data : a));
      toast.success(article.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update article');
    }
  };

  const handleDeleteArticle = async (articleId: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await articlesAPI.deleteArticle(articleId);
      setArticles(articles.filter(a => a.id !== articleId));
      toast.success('Article deleted');
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };

  const handleReadArticle = (articleId: number) => {
    navigate(`/article/${articleId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Articles</h1>
        <div className="mt-4 sm:mt-0 text-sm text-gray-500">
          {articles.length} article{articles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Add Article Form */}
      <div className="card p-6">
        <form onSubmit={handleAddArticle} className="flex gap-4">
          <div className="flex-1">
            <input
              type="url"
              placeholder="Paste a URL to save for later..."
              className="input-field"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              disabled={isAddingArticle}
            />
          </div>
          <button
            type="submit"
            disabled={isAddingArticle || !newUrl.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAddingArticle ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            className="input-field"
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}
          >
            <option value="all">All articles</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button
            onClick={() => setFilterFavorite(!filterFavorite)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              filterFavorite
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${filterFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No articles</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterRead !== 'all' || filterFavorite
              ? 'No articles match your current filters.'
              : 'Get started by saving your first article.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div key={article.id} className="article-card">
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer"
                  onClick={() => handleReadArticle(article.id)}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              
              <div className="space-y-3">
                <h3 
                  className="font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors"
                  onClick={() => handleReadArticle(article.id)}
                >
                  {article.title}
                </h3>
                
                {article.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {article.description}
                  </p>
                )}

                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Read Button */}
                <button
                  onClick={() => handleReadArticle(article.id)}
                  className="w-full btn-primary flex items-center justify-center mb-3"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Read Article
                </button>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(article.created_at)}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleRead(article)}
                      className={`p-1 rounded ${
                        article.is_read
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={article.is_read ? 'Mark as unread' : 'Mark as read'}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleToggleFavorite(article)}
                      className={`p-1 rounded ${
                        article.is_favorite
                          ? 'text-red-600 hover:text-red-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={article.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`h-4 w-4 ${article.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-gray-400 hover:text-gray-600"
                      title="Open original article"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-600"
                      title="Delete article"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 