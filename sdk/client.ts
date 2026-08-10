import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { OSRSWikiClientOptions } from './types';
import { OSRSWikiError } from './errors';
import { BASE_URL, DEFAULT_TIMEOUT, DEFAULT_USER_AGENT } from './constants';
import { SearchResource } from './resources/search';
import { PageResource } from './resources/page';

export class OSRSWikiClient {
  public readonly search: SearchResource;
  public readonly page: PageResource;

  protected readonly http: AxiosInstance;
  protected readonly baseUrl: string;

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
        const data = err.response?.data;
        const message = typeof data === 'string'
          ? data
          : JSON.stringify(data) ?? err.message;
        throw new OSRSWikiError(message, undefined, status);
      }
      throw err;
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
