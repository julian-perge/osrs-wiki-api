# OSRS Wiki API

An SDK and REST API wrapper for the [Old School RuneScape Wiki](https://oldschool.runescape.wiki/) providing structured access to wiki content via the MediaWiki API, with an MCP server for Claude Code integration.

> **Disclaimer:** This SDK, REST API wrapper, and MCP server is an unofficial tool created for educational purposes only. It is not affiliated with, maintained, or endorsed by Jagex or the Old School RuneScape Wiki.

## Setup

This package is not published to npm. Use it from a local clone with [Bun](https://bun.sh):

```bash
git clone git@github.com:julian-perge/osrs-wiki-api.git
cd osrs-wiki-api
bun install
bun run typecheck
```

Bun runs the TypeScript source directly, so no build step is needed. The import examples below are written for a script at the root of the clone. From somewhere else, import from the absolute path of your clone instead, such as `/absolute/path/to/osrs-wiki-api/sdk`.

## SDK

The SDK provides a typed, class-based interface organized by resource.

```typescript
import { OSRSWikiClient } from './sdk';

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

The OSRS Wiki asks API clients to send a User-Agent that names the project and gives a way to contact its maintainer. Pass your own:

```typescript
const client = new OSRSWikiClient({ userAgent: 'my-app/1.0 (you@example.com)' });
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
import { search, autocomplete, getPage, getExtract, renderImage } from './server';
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

### Running the server

The server speaks MCP over stdio. After the [setup](#setup) steps, start it from the clone with:

```bash
bun run mcp
```

Inside this repo, Claude Code picks up the bundled `.mcp.json`. To use the server from another project, add it to that project's `.mcp.json` with the absolute path to your clone:

```json
{
  "mcpServers": {
    "osrs-wiki-api-mcp": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/osrs-wiki-api/mcp/server.ts"]
    }
  }
}
```

Or register it from the command line:

```bash
claude mcp add osrs-wiki-api-mcp -- bun run /absolute/path/to/osrs-wiki-api/mcp/server.ts
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

User: Give me a quick summary of the Kalphite Queen
Claude uses: osrs_get_extract with title="Kalphite Queen"

User: Show me the Abyssal whip as ASCII art
Claude uses: osrs_render_image with title="Abyssal whip", width=64
```

---

## Development

```bash
bun install          # Install dependencies
bun run typecheck    # Type check without emitting
bun run build        # Compile TypeScript to dist/
bun run clean        # Remove dist folder
bun run dev          # Run server.ts directly
bun run mcp          # Run MCP server directly
```

---

## Environment

- **Bun** 1.4+ to run from source and for development
- **Node.js** 18+ to run the compiled `dist/` output
- TypeScript with strict mode

---

## License

This project is dedicated to the public domain under the [Unlicense](./LICENSE).
