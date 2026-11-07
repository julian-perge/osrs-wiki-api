/**
 * osrs-wiki-api
 *
 * Flat function exports for the Old School RuneScape Wiki MediaWiki API.
 * Mirrors the SDK interface with standalone functions backed by a shared client.
 *
 * @example
 * import { search, getPage } from '@deansasek/osrs-wiki-api';
 *
 * const results = await search('dragon slayer');
 * const page = await getPage('Dragon Slayer');
 */

import { OSRSWikiClient, type OSRSWikiClientOptions } from './sdk/index.js';

// Default shared client instance used by all exported functions
const defaultClient = new OSRSWikiClient();

export { OSRSWikiClient };
export type { OSRSWikiClientOptions };

// ── Search ───────────────────────────────────────────────────────────────────

/**
 * Full-text wiki search with structured results and HTML snippets.
 *
 * @param query - Search query string
 * @param options - Optional search options
 * @param options.limit - Max number of results (default: 10)
 * @param options.offset - Pagination offset (default: 0)
 * @param options.what - Search scope: 'all' (default), 'text', or 'title'
 * @returns Search response with results array and total hit count
 *
 * @example
 * const { results } = await search('goblin diplomacy');
 * for (const r of results) {
 *   console.log(r.title, r.pageid);
 * }
 */
export async function search(
  query: string,
  options?: { limit?: number; offset?: number; what?: 'text' | 'title' }
) {
  return defaultClient.search.query({ query, ...options });
}

/**
 * Fast autocomplete/typeahead suggestions as you type.
 *
 * @param query - Partial search query
 * @param options - Optional options
 * @param options.limit - Max number of suggestions (default: 10)
 * @returns Autocomplete response with title and optional description
 *
 * @example
 * const { results } = await autocomplete(' abys');
 * // results[0].title === 'Abyssal knot'
 */
export async function autocomplete(
  query: string,
  options?: { limit?: number }
) {
  return defaultClient.search.autocomplete({ query, ...options });
}

// ── Page ─────────────────────────────────────────────────────────────────────

/**
 * Fetch a wiki page with full parsed content.
 *
 * @param title - Page title (e.g. 'Dragon Slayer II')
 * @returns Page content including HTML, wikitext, categories, links, and image filenames
 * @throws {OSRSWikiError} If the page does not exist
 *
 * @example
 * const page = await getPage('Abyssal whip');
 * console.log(page.html);      // Full parsed HTML
 * console.log(page.images);    // ['Abyssal_whip.png', ...]
 * console.log(page.categories); // ['Melee weapons', 'Level 70 weapons', ...]
 */
export async function getPage(title: string) {
  return defaultClient.page.getPage(title);
}

/**
 * Fetch the plain-text intro/extract of a wiki page.
 * Returns only the opening paragraphs before the first section heading.
 *
 * @param title - Page title
 * @returns Plain-text intro string
 *
 * @example
 * const extract = await getExtract('Abyssal whip');
 * // 'The abyssal whip is a level 70 melee weapon...'
 */
export async function getExtract(title: string) {
  return defaultClient.page.getExtract(title);
}

/**
 * Get the CDN URL for an image file on the wiki.
 *
 * @param filename - Raw image filename as returned by getPage().images
 * @returns Full CDN URL to the image
 * @throws {OSRSWikiError} If the image does not exist
 *
 * @example
 * const page = await getPage('Abyssal whip');
 * const url = await defaultClient.page.getImageUrl(page.images[0]);
 * // 'https://oldschool.runescape.wiki/images/Abyssal_whip.png'
 */
export async function getImageUrl(filename: string) {
  return defaultClient.page.getImageUrl(filename);
}

/**
 * Render a wiki page's first image as ASCII art.
 *
 * @param title - Page title to render (e.g. 'Abyssal whip')
 * @param width - Output width in characters (default: 64)
 * @returns ASCII art string with a header line and the image rendered using ░▒▓█
 * @throws {OSRSWikiError} If the page has no images or the image cannot be fetched
 *
 * @example
 * const ascii = await renderImage('Abyssal whip', 64);
 * // Abyssal whip
 * // ════════════════════════════════════════════════════════
 * //   ░░▒▒▓▓████▒▒░░  ...
 */
export async function renderImage(title: string, width = 64) {
  return defaultClient.page.renderImage(title, width);
}

// ── Factory for custom client ────────────────────────────────────────────────

/**
 * Create a custom client with non-default options.
 *
 * @param options - Client configuration options
 * @param options.baseUrl - Override the wiki base URL (default: https://oldschool.runescape.wiki)
 * @param options.timeout - Request timeout in ms (default: 10000)
 * @param options.userAgent - Custom User-Agent string
 * @returns New OSRSWikiClient instance
 *
 * @example
 * const client = createClient({ timeout: 30000 });
 * const page = await client.page.getPage('Zulrah');
 */
export function createClient(options?: OSRSWikiClientOptions) {
  return new OSRSWikiClient(options);
}
