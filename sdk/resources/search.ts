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
    const { query, limit = 10, offset = 0, what = 'all' } = options;

    const raw = await this.client.get({ action: 'query', list: 'search', srsearch: query, srlimit: limit, sroffset: offset, srwhat: what }) as MediaWikiSearchResponse;

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

    const data = await this.client.get<MediaWikiOpenSearchResponse>({
      action: 'opensearch',
      search: query,
      limit,
      namespace: 0,
    });

    // OpenSearch returns [query, titles[], descriptions[], urls[]]
    const results: OpenSearchResult[] = ((data[1] as unknown as string[]) ?? []).map((title, i) => ({
      title,
      description: (data[2] as unknown as string[])?.[i] ?? undefined,
      url: (data[3] as unknown as string[])?.[i] ?? undefined,
    }));

    return { results, query: (data[0] as string) ?? query };
  }
}
