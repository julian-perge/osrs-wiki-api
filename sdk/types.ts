/**
 * Shared TypeScript interfaces for the OSRS Wiki API.
 */

/**
 * Configuration options for OSRSWikiClient.
 */
export interface OSRSWikiClientOptions {
  /**
   * Override the wiki base URL.
   * @default 'https://oldschool.runescape.wiki'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 10000
   */
  timeout?: number;

  /**
   * Custom User-Agent string sent with every request.
   * @default 'osrs-wiki-api/0.1 (TypeScript API wrapper)'
   */
  userAgent?: string;
}

// ── Search ───────────────────────────────────────────────────────────────────

/**
 * Options for full-text search.
 */
export interface SearchOptions {
  /** Search query string */
  query: string;

  /**
   * Maximum number of results to return.
   * @default 10
   */
  limit?: number;

  /**
   * Pagination offset (skip this many results).
   * @default 0
   */
  offset?: number;

  /**
   * Search scope:
   * - 'all' (default): full-text search across page content and titles
   * - 'text': search page content only
   * - 'title': search page titles only
   */
  what?: 'text' | 'title';
}

/**
 * A single search result.
 */
export interface SearchResult {
  /** Wiki page ID */
  pageid: number;

  /** Page title */
  title: string;

  /** HTML snippet containing the matching text */
  snippet: string;

  /** Page size in bytes */
  size?: number;

  /** Word count */
  wordcount?: number;

  /** ISO timestamp of last edit */
  timestamp?: string;

  /** Namespace number (0 = main content) */
  ns?: number;
}

/**
 * Response from a full-text search.
 */
export interface SearchResponse {
  /** Array of matching results */
  results: SearchResult[];

  /** Total number of pages matching the query */
  totalhits?: number;

  /** The original query string */
  query?: string;
}

// ── Page ─────────────────────────────────────────────────────────────────────

/**
 * Full parsed page content from the wiki.
 */
export interface PageContent {
  /** Wiki page ID */
  pageid: number;

  /** Page title */
  title: string;

  /** Full parsed HTML of the page */
  html: string;

  /** Raw wikitext (unparsed wiki markup) */
  wikitext?: string;

  /** Category names (without 'Category:' prefix) */
  categories?: string[];

  /** All page links (internal wiki links) */
  links?: string[];

  /** All image filenames used on the page (raw, not CDN URLs) */
  images?: string[];

  /** ISO timestamp of when the page was last parsed */
  timestamp?: string;
}

// ── OpenSearch (autocomplete) ────────────────────────────────────────────────

/**
 * Options for autocomplete suggestions.
 */
export interface OpenSearchOptions {
  /** Partial search query */
  query: string;

  /**
   * Maximum number of suggestions.
   * @default 10
   */
  limit?: number;
}

/**
 * A single autocomplete suggestion.
 */
export interface OpenSearchResult {
  /** Page title suggestion */
  title: string;

  /** Optional description snippet from the page */
  description?: string;

  /** Full URL to the wiki page */
  url?: string;
}

/**
 * Response from autocomplete suggestions.
 */
export interface OpenSearchResponse {
  /** Array of suggestions */
  results: OpenSearchResult[];

  /** The original query string */
  query: string;
}
