import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ArticleMetadata {
  title: string;
  description?: string;
  image_url?: string;
  content?: string;
}

export async function scrapeArticle(url: string): Promise<ArticleMetadata> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Extract title
    let title = $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('title').text() ||
                'Untitled Article';

    // Extract description
    const description = $('meta[property="og:description"]').attr('content') ||
                       $('meta[name="twitter:description"]').attr('content') ||
                       $('meta[name="description"]').attr('content') ||
                       '';

    // Extract image
    let image_url = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content') ||
                    '';

    // Extract main content (simplified)
    $('script, style, nav, header, footer, aside').remove();
    const content = $('article, .content, .post, .entry, main, .article-body')
                    .first()
                    .text()
                    .trim()
                    .substring(0, 5000) || // Limit content length
                    $('p').slice(0, 5).text().trim();

    // Clean up title
    title = title.trim().substring(0, 200);

    // Ensure absolute URLs for images
    if (image_url && !image_url.startsWith('http')) {
      const urlObj = new URL(url);
      if (image_url.startsWith('//')) {
        image_url = urlObj.protocol + image_url;
      } else if (image_url.startsWith('/')) {
        image_url = urlObj.origin + image_url;
      } else {
        image_url = urlObj.origin + '/' + image_url;
      }
    }

    return {
      title,
      description: description.substring(0, 500),
      image_url: image_url || undefined,
      content: content.substring(0, 5000) || undefined
    };

  } catch (error) {
    console.error('Error scraping article:', error);
    // Fallback to URL as title
    const urlObj = new URL(url);
    return {
      title: urlObj.hostname + urlObj.pathname,
      description: 'Failed to fetch article content',
    };
  }
} 