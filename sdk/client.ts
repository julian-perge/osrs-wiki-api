import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { OSRSWikiClientOptions } from './types.js';
import { OSRSWikiError } from './errors.js';
import { BASE_URL, DEFAULT_TIMEOUT, DEFAULT_USER_AGENT } from './constants.js';
import { SearchResource } from './resources/search.js';
import { PageResource } from './resources/page.js';

/**
 * OSRS Wiki API Client
 *
 * Typed client for the Old School RuneScape Wiki MediaWiki API.
 * Manages HTTP communication and provides resource-based access to API endpoints.
 *
 * @example
 * import { OSRSWikiClient } from '@julian-perge/osrs-wiki-api/sdk';
 *
 * const client = new OSRSWikiClient();
 * const results = await client.search.query({ query: 'zulrah' });
 * const page = await client.page.getPage('Zulrah');
 */
export class OSRSWikiClient {
  /** Full-text search and autocomplete */
  public readonly search: SearchResource;

  /** Page content, extracts, and image rendering */
  public readonly page: PageResource;

  protected readonly http: AxiosInstance;
  protected readonly baseUrl: string;

  /**
   * Create a new OSRS Wiki API client.
   *
   * @param options - Configuration options
   * @param options.baseUrl - Wiki base URL (default: https://oldschool.runescape.wiki)
   * @param options.timeout - Request timeout in ms (default: 10000)
   * @param options.userAgent - User-Agent sent with every request
   */
  constructor(options: OSRSWikiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? BASE_URL;
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      headers: {
        'User-Agent': options.userAgent ?? DEFAULT_USER_AGENT,
        'Accept': 'application/json',
      },
    });

    this.search = new SearchResource(this);
    this.page = new PageResource(this);
  }

  /**
   * Make a GET request to the MediaWiki API.
   *
   * @param params - MediaWiki API parameters (action, prop, etc.)
   * @param config - Optional axios request config
   * @returns Parsed JSON response
   * @throws {OSRSWikiError} On network error, or when MediaWiki answers with an error object (code is the MediaWiki error code)
   */
  async get<T = unknown>(params: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.http.get<T>('/api.php', {
        params: { format: 'json', ...params },
        ...config,
      });
      const body = response.data as { error?: { code?: string; info?: string } } | null;
      if (body && typeof body === 'object' && body.error) {
        throw new OSRSWikiError(body.error.info ?? 'MediaWiki API error', body.error.code, response.status);
      }
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        const message = typeof data === 'string'
          ? data
          : JSON.stringify(data) ?? err.message;
        throw new OSRSWikiError(message, undefined, status);
      }
      throw err;
    }
  }

  /**
   * Download a file, such as an image URL from getImageUrl, with this client's User-Agent and timeout.
   *
   * @param url - Absolute URL to download
   * @returns Response body
   * @throws {OSRSWikiError} On network error or a non-2xx response
   */
  async getBuffer(url: string): Promise<Buffer> {
    try {
      const response = await this.http.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new OSRSWikiError(`Download failed for ${url}: ${err.message}`, undefined, err.response?.status);
      }
      throw err;
    }
  }

  /**
   * Get the configured base URL.
   *
   * @returns The base URL string (e.g. 'https://oldschool.runescape.wiki')
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
