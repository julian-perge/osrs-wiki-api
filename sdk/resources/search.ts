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

export class SearchResource {
  constructor(private client: OSRSWikiClient) {}

  /**
   * Full MediaWiki search — returns structured results with snippets.
   * Endpoint: ?action=query&list=search
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
   * OpenSearch / autocomplete — fast suggestions as you type.
   * Endpoint: ?action=opensearch
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
