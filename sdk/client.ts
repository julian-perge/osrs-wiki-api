import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { OSRSWikiClientOptions, OSRSWikiError } from './types';
import { SearchResource } from './resources/search';
import { PageResource } from './resources/page';

export class OSRSWikiClient {
  public readonly search: SearchResource;
  public readonly page: PageResource;

  protected readonly http: AxiosInstance;
  protected readonly baseUrl: string;

  constructor(options: OSRSWikiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? 'https://oldschool.runescape.wiki';
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: options.timeout ?? 10000,
      headers: {
        'User-Agent': options.userAgent ?? 'osrs-wiki-api/0.1 (TypeScript API wrapper)',
        'Accept': 'application/json',
      },
    });

    // Wire up resources with a reference to this client for shared fetch
    this.search = new SearchResource(this);
    this.page = new PageResource(this);
  }

  async get<T = unknown>(params: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.http.get<T>('/api.php', {
        params: { format: 'json', ...params },
        ...config,
      });
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.toString() ?? err.message;
        throw new OSRSWikiError(message, undefined, status);
      }
      throw err;
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
