// Shared TypeScript interfaces for OSRS Wiki API

export interface OSRSWikiClientOptions {
  baseUrl?: string;
  timeout?: number;
  userAgent?: string;
}

// ============================================================
// Search
// ============================================================

export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  what?: 'text' | 'title' | 'all';
}

export interface SearchResult {
  pageid: number;
  title: string;
  snippet: string;
  size?: number;
  wordcount?: number;
  timestamp?: string;
  ns?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalhits?: number;
  query?: string;
}

// ============================================================
// Page
// ============================================================

export interface PageOptions {
  title: string;
  redirect?: boolean;
}

export interface PageContent {
  pageid: number;
  title: string;
  html: string;
  wikitext?: string;
  categories?: string[];
  links?: string[];
  images?: string[];
  timestamp?: string;
}

export interface PageParseResponse {
  page: PageContent;
}

// ============================================================
// OpenSearch (autocomplete)
// ============================================================

export interface OpenSearchOptions {
  query: string;
  limit?: number;
}

export interface OpenSearchResult {
  title: string;
  description?: string;
  url?: string;
}

export interface OpenSearchResponse {
  results: OpenSearchResult[];
  query: string;
}

// ============================================================
// Error
// ============================================================

export class OSRSWikiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'OSRSWikiError';
  }
}
