import { OSRSWikiClient } from '../client';
import { PageContent } from '../types';

interface MediaWikiParseResponse {
  parse?: {
    pageid: number;
    title: string;
    text?: { '*': string };
    wikitext?: { '*': string };
    categories?: Array<{ '*': string }>;
    links?: Array<{ '*': string }>;
    images?: string[];
    timestamp?: string;
  };
}

interface MediaWikiQueryResponse {
  query?: {
    pages?: Record<string, {
      pageid?: number;
      title?: string;
      extract?: string;
      categories?: Array<{ title: string }>;
    }>;
  };
}

export class PageResource {
  constructor(private client: OSRSWikiClient) {}

  /**
   * Fetch a wiki page's parsed HTML content.
   * Endpoint: ?action=parse&page=...
   */
  async getPage(title: string): Promise<PageContent> {
    const raw = await this.client.get({ action: 'parse', page: title, redirect: true, prop: 'text|wikitext|categories|links|images' }) as MediaWikiParseResponse;

    const p = raw.parse;
    if (!p) {
      throw new Error(`Page not found: ${title}`);
    }

    return {
      pageid: p.pageid,
      title: p.title,
      html: p.text?.['*'] ?? '',
      wikitext: p.wikitext?.['*'],
      categories: p.categories?.map((c) => c['*']),
      links: p.links?.map((l) => l['*']),
      images: p.images,
      timestamp: p.timestamp,
    };
  }

  /**
   * Fetch page extract (intro text only, no full HTML).
   * Endpoint: ?action=query&prop=extracts
   */
  async getExtract(title: string): Promise<string> {
    const raw = await this.client.get({ action: 'query', titles: title, prop: 'extracts', exintro: true, explaintext: true }) as MediaWikiQueryResponse;

    const pages = raw.query?.pages;
    if (!pages) return '';

    const page = Object.values(pages)[0];
    return page?.extract ?? '';
  }
}
