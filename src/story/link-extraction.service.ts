import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class LinkExtractionService {
  async extractTextFromLink(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      
      // Remove scripts, nav, footer, and other non-content elements
      $('script, style, nav, footer, header, aside, .nav, .footer, .header, .sidebar').remove();
      
      // Extract text from main content areas
      const content = $('main, article, .content, .post, .article, body').text();
      
      // Clean up whitespace
      const cleaned = content.replace(/\s+/g, ' ').trim();
      
      return this.truncateContent(cleaned, 10000);
    } catch (error) {
      console.error(`Failed to extract content from ${url}:`, error);
      return '';
    }
  }

  async extractTextFromLinks(urls: string[]): Promise<string> {
    const limitedUrls = urls.slice(0, 5);
    const results = await Promise.all(
      limitedUrls.map(url => this.extractTextFromLink(url))
    );
    
    return results.filter(text => text.length > 0).join('\n\n');
  }

  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength);
  }
}
