import axios from 'axios';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

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

    // Extract main content using Mozilla Readability
    const content = await extractReadableContent(response.data, url);

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

async function extractReadableContent(html: string, baseUrl: string): Promise<string> {
  try {
    // Create a JSDOM instance with the HTML
    const dom = new JSDOM(html, { url: baseUrl });
    const document = dom.window.document;

    // Use Mozilla Readability to extract the main article content
    const reader = new Readability(document, {
      // Keep images and maintain some formatting
      keepClasses: false,
    });

    const article = reader.parse();

    if (!article || !article.content) {
      console.warn('Readability could not extract article content');
      return '';
    }

    // Load the extracted content into Cheerio for further processing
    const $ = cheerio.load(article.content);

    // Convert relative URLs to absolute URLs for images and links
    $('img').each((_, imgElem) => {
      const img = $(imgElem);
      let src = img.attr('src');
      if (src) {
        try {
          const absoluteSrc = new URL(src, baseUrl).href;
          img.attr('src', absoluteSrc);
        } catch (e) {
          console.warn(`Could not resolve image src: ${src} against base ${baseUrl}`);
        }
      }
      img.attr('loading', 'lazy'); // Add lazy loading
    });

    $('a').each((_, anchorElem) => {
      const anchor = $(anchorElem);
      let href = anchor.attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        try {
          const absoluteHref = new URL(href, baseUrl).href;
          anchor.attr('href', absoluteHref);
          anchor.attr('target', '_blank');
          anchor.attr('rel', 'noopener noreferrer');
        } catch (e) {
          console.warn(`Could not resolve anchor href: ${href} against base ${baseUrl}`);
        }
      }
    });

    let finalHtml = $.html();

    // Sanitize the HTML content
    if (finalHtml) {
      finalHtml = sanitizeHtml(finalHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 
          'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'figcaption', 'iframe' 
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          'img': [ 'src', 'srcset', 'alt', 'title', 'width', 'height', 'loading' ],
          'a': [ 'href', 'name', 'target', 'rel' ],
          'iframe': [ 'src', 'width', 'height', 'frameborder', 'allowfullscreen', 'sandbox' ] 
        },
        // Allow common inline styling for things like text alignment, but be cautious
        allowedStyles: {
          '*': {
            'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
            'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
            'font-weight': [/^bold$/, /^normal$/],
            'font-style': [/^italic$/, /^normal$/],
            'text-decoration': [/^underline$/, /^line-through$/, /^none$/]
          }
        },
        // Allow iframes from trusted sources like YouTube, Vimeo etc.
        allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
      });
    }

    return finalHtml ? finalHtml.trim() : '';

  } catch (error) {
    console.error('Error extracting readable content:', error);
    return '';
  }
} 