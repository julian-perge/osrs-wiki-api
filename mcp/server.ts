/**
 * MCP server for OSRS Wiki API.
 * Exposes search and page-fetch as Model Context Protocol tools.
 */

import { OSRSWikiClient } from '../sdk/client';
import { SearchResource } from '../sdk/resources/search';
import { PageResource } from '../sdk/resources/page';

const client = new OSRSWikiClient();

export const tools = [
  {
    name: 'osrs_search',
    description: 'Search the Old School RuneScape Wiki',
    input: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Max results (default 10)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
      required: ['query'],
    },
    handler: async (opts: { query: string; limit?: number; offset?: number }) => {
      return client.search.query(opts);
    },
  },
  {
    name: 'osrs_autocomplete',
    description: 'Autocomplete suggestions from the OSRS Wiki',
    input: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Partial search query' },
        limit: { type: 'number', description: 'Max suggestions (default 10)' },
      },
      required: ['query'],
    },
    handler: async (opts: { query: string; limit?: number }) => {
      return client.search.autocomplete(opts);
    },
  },
  {
    name: 'osrs_get_page',
    description: 'Fetch a wiki page by title',
    input: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Page title' },
      },
      required: ['title'],
    },
    handler: async (opts: { title: string }) => {
      return client.page.getPage(opts.title);
    },
  },
];

// Simple handler for testing
async function main() {
  const results = await client.search.query({ query: 'dragon', limit: 3 });
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
