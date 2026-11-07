import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { OSRSWikiClient } from '../sdk/client.js';

/**
 * OSRS Wiki MCP Server
 *
 * Provides Claude Code tools for searching, fetching, and rendering
 * content from the Old School RuneScape Wiki via the MediaWiki API.
 */
const server = new Server(
  {
    name: 'osrs-wiki-api-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/** SDK client shared across all tool calls */
const client = new OSRSWikiClient();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'osrs_search',
        description: 'Full-text search of the Old School RuneScape Wiki, returns structured results with snippets',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Max results (default 10)' },
            offset: { type: 'number', description: 'Pagination offset' },
            what: { type: 'string', enum: ['text', 'title', 'all'], description: 'Search scope (default: all)' },
          },
          required: ['query'],
        },
      },
      {
        name: 'osrs_autocomplete',
        description: 'Fast autocomplete/typeahead suggestions from the OSRS Wiki',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Partial search query' },
            limit: { type: 'number', description: 'Max suggestions (default 10)' },
          },
          required: ['query'],
        },
      },
      {
        name: 'osrs_get_page',
        description: 'Fetch a wiki page by title, returns full HTML, wikitext, categories, and links',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Page title (e.g. "Dragon Slayer II")' },
          },
          required: ['title'],
        },
      },
      {
        name: 'osrs_get_extract',
        description: 'Fetch the plain-text intro/extract of a wiki page',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Page title' },
          },
          required: ['title'],
        },
      },
      {
        name: 'osrs_render_image',
        description: 'Render a wiki page image as ASCII art',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Page title (e.g. "Abyssal whip")' },
            width: { type: 'number', description: 'ASCII art width in characters (default 64)' },
          },
          required: ['title'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'osrs_search': {
        const what = args.what === 'text' || args.what === 'title' ? args.what : undefined;
        const results = await client.search.query({
          query: args.query as string,
          limit: (args.limit as number) || 10,
          offset: (args.offset as number) || 0,
          ...(what ? { what } : {}),
        });
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
      }

      case 'osrs_autocomplete': {
        const results = await client.search.autocomplete({
          query: args.query as string,
          limit: (args.limit as number) || 10,
        });
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
      }

      case 'osrs_get_page': {
        const results = await client.page.getPage(args.title as string);
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
      }

      case 'osrs_get_extract': {
        const results = await client.page.getExtract(args.title as string);
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
      }

      case 'osrs_render_image': {
        const width = (args.width as number) || 64;
        const ascii = await client.page.renderImage(args.title as string, width);
        return { content: [{ type: 'text', text: ascii }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${(error as Error).message}` }], isError: true };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('OSRS Wiki MCP server started');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
