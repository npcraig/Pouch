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

    // Extract main content with better formatting
    const content = extractFormattedContent($);

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
      content: content || undefined
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

function extractFormattedContent($: cheerio.CheerioAPI): string {
  // Remove unwanted elements
  $('script, style, nav, header, footer, aside, .ad, .advertisement, .social, .comments, .sidebar, .related, .menu, iframe, noscript').remove();
  
  // Try to find the main content area
  const selectors = [
    'article',
    '[role="main"]',
    '.post-content',
    '.entry-content', 
    '.article-content',
    '.content',
    '.post-body',
    '.article-body',
    'main',
    '.main-content',
    '#content',
    '#main',
    'body'
  ];
  
  let content = '';
  
  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const text = element.text().trim();
      if (text.length > 100) {
        content = text;
        break;
      }
    }
  }
  
  // If still no content, try getting paragraphs directly
  if (!content) {
    const paragraphs: string[] = [];
    $('p').each((_, elem) => {
      const text = $(elem).text().trim();
      if (text.length > 20) {
        paragraphs.push(text);
      }
    });
    content = paragraphs.join('\n\n');
  }
  
  // Clean up content
  return content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .trim();
} 