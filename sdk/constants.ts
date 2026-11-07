/**
 * API constants for the OSRS Wiki MediaWiki API.
 */

/**
 * The base URL of the Old School RuneScape Wiki.
 */
export const BASE_URL = 'https://oldschool.runescape.wiki';

/**
 * Default request timeout in milliseconds (10 seconds).
 */
export const DEFAULT_TIMEOUT = 10000;

/**
 * Default User-Agent sent with every API request.
 * The OSRS Wiki API policy asks for a User-Agent that names the project and
 * gives a way to contact its maintainer, so this points at the repository.
 * Applications should pass their own userAgent with their own contact details.
 */
export const DEFAULT_USER_AGENT = 'osrs-wiki-api/0.1 (+https://github.com/deansasek/osrs-wiki-api)';
