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
  what?: 'text' | 'title';
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
