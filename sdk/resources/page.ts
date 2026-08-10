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
      imageinfo?: Array<{ url: string }>;
    }>;
  };
}

interface ImageInfoResponse {
  query?: {
    pages?: Record<string, {
      imageinfo?: Array<{ url: string }>;
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

  /**
   * Get the CDN URL for an image file on the wiki.
   * Uses MediaWiki's imageinfo API to resolve raw filenames to full URLs.
   */
  async getImageUrl(filename: string): Promise<string> {
    const cleanName = filename.replace(/ /g, '_');
    const raw = await this.client.get({
      action: 'query',
      titles: `File:${cleanName}`,
      prop: 'imageinfo',
      iiprop: 'url',
    }) as ImageInfoResponse;

    const pages = raw.query?.pages;
    if (!pages) throw new Error(`Image not found: ${filename}`);
    const page = Object.values(pages)[0];
    return page?.imageinfo?.[0]?.url ?? '';
  }

  /**
   * Render a wiki page's first image as ASCII art.
   */
  async renderImage(title: string, width = 64): Promise<string> {
    const page = await this.getPage(title);
    if (!page.images?.length) throw new Error(`No images on page: ${title}`);

    const imageUrl = await this.getImageUrl(page.images[0]);

    const { Jimp } = await import('jimp');
    const imageBuffer = await fetch(imageUrl).then((r) => r.arrayBuffer());
    const image = await Jimp.read(Buffer.from(imageBuffer));

    const aspectRatio = image.height / image.width;
    const scaledHeight = Math.round(width * aspectRatio * 0.5);
    const sampleX = image.width / width;
    const sampleY = image.height / scaledHeight;
    const chars = ' ░▒▓█';

    let ascii = '';
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < width; x++) {
        const px = Math.min(Math.floor(x * sampleX), image.width - 1);
        const py = Math.min(Math.floor(y * sampleY), image.height - 1);
        const idx = (py * image.width + px) * 4;
        const r = image.bitmap.data[idx];
        const g = image.bitmap.data[idx + 1];
        const b = image.bitmap.data[idx + 2];
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const charIndex = Math.min(Math.floor(brightness * chars.length), chars.length - 1);
        ascii += chars[charIndex];
      }
      ascii += '\n';
    }

    return `${page.title}\n${'═'.repeat(width)}\n${ascii}`;
  }
}
