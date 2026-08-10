/**
 * OSRS Wiki SDK
 *
 * Typed SDK for the Old School RuneScape Wiki MediaWiki API.
 *
 * @example
 * import { OSRSWikiClient } from './sdk/index.js';
 *
 * const client = new OSRSWikiClient();
 * const results = await client.search.query({ query: 'dragon' });
 * const page = await client.page.getPage('Dragon Slayer');
 */

export { OSRSWikiClient } from './client.js';
export type { OSRSWikiClientOptions } from './types.js';
export { OSRSWikiError, ValidationError, NotFoundError } from './errors.js';
export { SearchResource } from './resources/search.js';
export { PageResource } from './resources/page.js';
export * from './types.js';
