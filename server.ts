/**
 * osrs-wiki-api
 * Flat function exports — mirrors the TCGplayer / PriceCharting pattern.
 * Main entry point for the OSRS Wiki TypeScript API wrapper.
 */

import { OSRSWikiClient, OSRSWikiClientOptions } from './sdk';

// Default shared client instance
const defaultClient = new OSRSWikiClient();

export { OSRSWikiClient, OSRSWikiClientOptions };

// ── Search ───────────────────────────────────────────────────────────────────

export async function search(
  query: string,
  options?: { limit?: number; offset?: number; what?: 'text' | 'title' | 'all' }
) {
  return defaultClient.search.query({ query, ...options });
}

export async function autocomplete(
  query: string,
  options?: { limit?: number }
) {
  return defaultClient.search.autocomplete({ query, ...options });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export async function getPage(title: string) {
  return defaultClient.page.getPage(title);
}

export async function getExtract(title: string) {
  return defaultClient.page.getExtract(title);
}

// ── Factory for custom client ────────────────────────────────────────────────

export function createClient(options?: OSRSWikiClientOptions) {
  return new OSRSWikiClient(options);
}
