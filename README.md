# OSRS Wiki API

An SDK and REST API wrapper for the [Old School RuneScape Wiki](https://oldschool.runescape.wiki/) providing structured access to wiki content via the MediaWiki API — with an MCP server for Claude Code integration.

> **Disclaimer:** This SDK, REST API wrapper, and MCP server is an unofficial tool created for educational purposes only. It is not affiliated with, maintained, or endorsed by Jagex or the Old School RuneScape Wiki.

## Installation

```bash
npm install @deansasek/osrs-wiki-api
```

## SDK

The SDK provides a typed, class-based interface organized by resource.

```typescript
import { OSRSWikiClient } from '@deansasek/osrs-wiki-api/sdk';

const client = new OSRSWikiClient();

// Search
const results = await client.search.query({ query: 'dragon slayer' });

// Autocomplete
const suggestions = await client.search.autocomplete({ query: 'drag' });

// Fetch a wiki page
const page = await client.page.getPage('Dragon Slayer II');

// Plain-text intro
const extract = await client.page.getExtract('Abyssal whip');

// Render an image as ASCII art
const ascii = await client.page.renderImage('Abyssal whip', 64);
```

### SDK Resources

| Resource | Methods |
|----------|---------|
| `client.search` | `query()`, `autocomplete()` |
| `client.page` | `getPage()`, `getExtract()`, `getImageUrl()`, `renderImage()` |

---

## REST API (Backward Compatible)

Flat function exports for direct API access.

```typescript
import { search, autocomplete, getPage, getExtract, renderImage } from '@deansasek/osrs-wiki-api';
```

### search(query, options?)

Full-text wiki search with snippets.

```typescript
const results = await search('dragon slayer', { limit: 10, offset: 0 });
```

### autocomplete(query, options?)

Fast autocomplete/typeahead suggestions.

```typescript
const suggestions = await autocomplete('drag', { limit: 5 });
```

### getPage(title)

Fetch a wiki page with full HTML, wikitext, categories, and links.

```typescript
const page = await getPage('Dragon Slayer II');
// Returns: { pageid, title, html, wikitext, categories, links, images, timestamp }
```

### getExtract(title)

Fetch the plain-text intro of a wiki page.

```typescript
const extract = await getExtract('Abyssal whip');
// Returns: "The abyssal whip is a level 70 melee weapon..."
```

### renderImage(title, width?)

Render a wiki page's first image as ASCII art.

```typescript
const ascii = await renderImage('Abyssal whip', 64);
// Returns:
// Abyssal whip
// ════════════════════════════════════════════════════════
//   ░░▒▒▓▓████▒▒░░  ...
```

### Other Functions

| Function | Description |
|----------|-------------|
| `createClient(options?)` | Create a custom client with options |
| `getImageUrl(filename)` | Resolve a raw image filename to its CDN URL |

---

## MCP Server (Claude Code Integration)

The MCP server enables Claude Code to interact with the OSRS Wiki directly.

### Installation

Claude Code automatically detects `.mcp.json`:

```json
{
  "mcpServers": {
    "osrs-wiki-api-mcp": {
      "command": "node",
      "args": ["/Users/deansasek/Documents/Projects/osrs-wiki-api/dist/mcp/server.js"]
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `osrs_search` | Full-text wiki search with snippets |
| `osrs_autocomplete` | Fast typeahead suggestions |
| `osrs_get_page` | Fetch a wiki page (HTML, wikitext, categories, links) |
| `osrs_get_extract` | Plain-text page intro |
| `osrs_render_image` | Render a wiki page image as ASCII art |

### MCP Usage Examples

```
User: Search for dragon slayer quest on the OSRS wiki
Claude uses: osrs_search with query="dragon slayer"

User: What items are in the Fight Arena quest?
Claude uses: osrs_get_page with title="Fight Arena"

User: Give me a quick summary of the Kal'gerion demon
Claude uses: osrs_get_extract with title="Kalphite Queen"

User: Show me the Abyssal whip as ASCII art
Claude uses: osrs_render_image with title="Abyssal whip", width=64
```

---

## Development

```bash
npm run build    # Compile TypeScript
npm run clean    # Remove dist folder
npm run dev      # Run server.ts directly
npm run mcp      # Run MCP server directly
```

---

## Environment

- **Node.js** 18+ recommended
- TypeScript with strict mode

---

## License

This project is dedicated to the public domain under the [Unlicense](./LICENSE).
