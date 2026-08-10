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

/**
 * Page content, extracts, and image operations.
 */
export class PageResource {
  constructor(private client: OSRSWikiClient) {}

  /**
   * Fetch a wiki page with full parsed content.
   *
   * Returns HTML, wikitext, categories, links, and a list of all images
   * used on the page. Use {@link getExtract} for a plain-text intro only.
   *
   * @param title - Page title as it appears on the wiki (e.g. 'Dragon Slayer II')
   * @returns Full page content object
   * @throws {OSRSWikiError} If the page does not exist or the API fails
   *
   * @example
   * const page = await client.page.getPage('Abyssal whip');
   * console.log(page.html);        // Full parsed HTML
   * console.log(page.categories);  // ['Melee weapons', 'Level 70 weapons', ...]
   * console.log(page.links);       // [' Weapon', 'Melee', ...]
   * console.log(page.images);     // ['Abyssal_whip.png', ...]
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
   * Fetch the plain-text intro/extract of a wiki page.
   *
   * Returns only the opening paragraphs before the first section heading —
   * suitable for item descriptions, quest summaries, and quick lookups.
   * Use {@link getPage} when you need full HTML, wikitext, or image filenames.
   *
   * @param title - Page title
   * @returns Plain-text intro string (no HTML, no wikitext markup)
   * @throws {OSRSWikiError} If the page does not exist or the API fails
   *
   * @example
   * const extract = await client.page.getExtract('Abyssal whip');
   * // 'The abyssal whip is a level 70 melee weapon that requires 70 Attack...'
   */
  async getExtract(title: string): Promise<string> {
    const raw = await this.client.get({ action: 'query', titles: title, prop: 'extracts', exintro: true, explaintext: true }) as MediaWikiQueryResponse;

    const pages = raw.query?.pages;
    if (!pages) return '';

    const page = Object.values(pages)[0];
    return page?.extract ?? '';
  }

  /**
   * Resolve a raw image filename to its full CDN URL.
   *
   * The MediaWiki API returns bare filenames in page content (e.g. 'Abyssal_whip.png').
   * This method queries the imageinfo API to resolve it to the actual CDN URL
   * usable in <img> tags or for fetching with HTTP.
   *
   * @param filename - Raw image filename from {@link PageContent.images}
   * @returns Full CDN URL (e.g. 'https://oldschool.runescape.wiki/images/Abyssal_whip.png')
   * @throws {OSRSWikiError} If the image does not exist
   *
   * @example
   * const page = await client.page.getPage('Abyssal whip');
   * const url = await client.page.getImageUrl(page.images[0]);
   * // 'https://oldschool.runescape.wiki/images/Abyssal_whip.png'
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
   *
   * Fetches the page, resolves its first image to a CDN URL, downloads the image,
   * and converts it to a text representation using Unicode block characters
   * (space, light shade, medium shade, dark shade, full block).
   *
   * The output is proportional to the source image's aspect ratio.
   *
   * @param title - Page title (e.g. 'Abyssal whip', 'Vorkath')
   * @param width - Output width in terminal characters (default: 64)
   * @returns ASCII art string with a title header line, a separator, and the rendered image
   * @throws {OSRSWikiError} If the page has no images or the image cannot be fetched
   *
   * @example
   * const ascii = await client.page.renderImage('Abyssal whip', 64);
   * // Abyssal whip
   * // ═══════════════════════════════════════════════════════════════════
   * //   ░░▒▒▓▓████▒▒░░
   * //   ...
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
