import express from 'express';
import db from '../database/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { CreateArticleRequest, UpdateArticleRequest } from '../types';
import { scrapeArticle } from '../utils/scraper';

const router = express.Router();

// Get all articles for a user
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { search, tags, is_read, is_favorite } = req.query;

    let query = 'SELECT * FROM articles WHERE user_id = ?';
    const params: any[] = [userId];

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (tags) {
      query += ' AND tags LIKE ?';
      params.push(`%${tags}%`);
    }

    if (is_read !== undefined) {
      query += ' AND is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }

    if (is_favorite !== undefined) {
      query += ' AND is_favorite = ?';
      params.push(is_favorite === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    const articles = db.prepare(query).all(params);
    
    // Parse tags for each article
    const articlesWithTags = articles.map((article: any) => ({
      ...article,
      tags: article.tags ? article.tags.split(',').filter((tag: string) => tag.trim()) : []
    }));

    res.json(articlesWithTags);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new article
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { url, tags = [] }: CreateArticleRequest = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Check if article already exists for this user
    const existingArticle = db.prepare('SELECT id FROM articles WHERE user_id = ? AND url = ?').get(userId, url);
    if (existingArticle) {
      return res.status(400).json({ error: 'Article already saved' });
    }

    // Scrape article metadata
    const metadata = await scrapeArticle(url);

    // Insert article
    const insertArticle = db.prepare(`
      INSERT INTO articles (user_id, url, title, description, content, image_url, tags) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const tagsString = tags.join(',');
    const result = insertArticle.run(
      userId,
      url,
      metadata.title,
      metadata.description || '',
      metadata.content || '',
      metadata.image_url || '',
      tagsString
    );

    const articleId = result.lastInsertRowid as number;
    
    // Get the created article
    const newArticle = db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId) as any;
    
    res.status(201).json({
      ...newArticle,
      tags: tags
    });
  } catch (error) {
    console.error('Error adding article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update article
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const articleId = parseInt(req.params.id);
    const { is_read, is_favorite, tags }: UpdateArticleRequest = req.body;

    // Check if article belongs to user
    const article = db.prepare('SELECT id FROM articles WHERE id = ? AND user_id = ?').get(articleId, userId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (is_read !== undefined) {
      updates.push('is_read = ?');
      params.push(is_read ? 1 : 0);
    }

    if (is_favorite !== undefined) {
      updates.push('is_favorite = ?');
      params.push(is_favorite ? 1 : 0);
    }

    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(tags.join(','));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(articleId);

    const updateQuery = `UPDATE articles SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(updateQuery).run(params);

    // Get updated article
    const updatedArticle = db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId) as any;
    
    res.json({
      ...updatedArticle,
      tags: updatedArticle.tags ? updatedArticle.tags.split(',').filter((tag: string) => tag.trim()) : []
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete article
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const articleId = parseInt(req.params.id);

    // Check if article belongs to user
    const article = db.prepare('SELECT id FROM articles WHERE id = ? AND user_id = ?').get(articleId, userId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    db.prepare('DELETE FROM articles WHERE id = ?').run(articleId);
    
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 