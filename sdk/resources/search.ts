import { OSRSWikiClient } from '../client';
import {
  SearchOptions,
  SearchResponse,
  SearchResult,
  OpenSearchOptions,
  OpenSearchResponse,
  OpenSearchResult,
} from '../types';

interface MediaWikiSearchResponse {
  batchcomplete?: string;
  query?: {
    search?: Array<{
      pageid: number;
      title: string;
      snippet: string;
      size?: number;
      wordcount?: number;
      timestamp?: string;
    }>;
    'search-info'?: {
      totalhits?: number;
      suggestion?: string;
    };
  };
}

type MediaWikiOpenSearchResponse = [string, string[], string?, string?];

/**
 * Search and autocomplete for wiki pages.
 */
export class SearchResource {
  constructor(private client: OSRSWikiClient) {}

  /**
   * Full-text wiki search returning structured results with HTML snippets.
   *
   * Uses MediaWiki's `query+search` action for comprehensive content search.
   *
   * @param options - Search options
   * @param options.query - The search query string
   * @param options.limit - Max results to return (default: 10)
   * @param options.offset - Skip this many results for pagination (default: 0)
   * @param options.what - Search scope: 'text' (content only), 'title' (titles only), or omit (both)
   * @returns Search response with results array and total hit count
   * @throws {OSRSWikiError} On API error
   *
   * @example
   * const { results, totalhits } = await client.search.query({ query: 'zamorak', limit: 5 });
   * for (const r of results) {
   *   console.log(`${r.title} (pageid: ${r.pageid})`);
   *   console.log(r.snippet); // HTML snippet with match highlighted
   * }
   */
  async query(options: SearchOptions): Promise<SearchResponse> {
    const { query, limit = 10, offset = 0, what } = options;

    const params: Record<string, unknown> = {
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: limit,
      sroffset: offset,
    };
    // 'all' is the default (omit srwhat); only set when explicitly text or title
    if (what) {
      params.srwhat = what;
    }

    const raw = await this.client.get(params) as MediaWikiSearchResponse;

    const results: SearchResult[] = (raw.query?.search ?? []).map((r) => ({
      pageid: r.pageid,
      title: r.title,
      snippet: r.snippet,
      size: r.size,
      wordcount: r.wordcount,
      timestamp: r.timestamp,
    }));

    return {
      results,
      totalhits: raw.query?.['search-info']?.totalhits,
      query,
    };
  }

  /**
   * Fast autocomplete/typeahead suggestions as the user types.
   *
   * Uses MediaWiki's `opensearch` action — optimized for real-time suggestions.
   *
   * @param options - Autocomplete options
   * @param options.query - Partial query string (min 1 character)
   * @param options.limit - Max suggestions to return (default: 10)
   * @returns Autocomplete response with titles, descriptions, and URLs
   * @throws {OSRSWikiError} On API error
   *
   * @example
   * const { results } = await client.search.autocomplete({ query: 'zama' });
   * // results[0].title === 'Zamorak'
   */
  async autocomplete(options: OpenSearchOptions): Promise<OpenSearchResponse> {
    const { query, limit = 10 } = options;

    const raw = await this.client.get({ action: 'opensearch', search: query, limit, namespace: 0 }) as MediaWikiOpenSearchResponse;

    const results: OpenSearchResult[] = ((raw[1] as unknown as string[]) ?? []).map((title, i) => ({
      title,
      description: (raw[2] as unknown as string[])?.[i] ?? undefined,
      url: (raw[3] as unknown as string[])?.[i] ?? undefined,
    }));

    return { results, query: (raw[0] as string) ?? query };
  }
}
