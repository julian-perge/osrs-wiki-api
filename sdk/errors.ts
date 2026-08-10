/**
 * Error classes for the OSRS Wiki API.
 */

/**
 * Base error class for all OSRS Wiki API errors.
 */
export class OSRSWikiError extends Error {
  /**
   * Machine-readable error code.
   * @example 'NOT_FOUND' | 'VALIDATION' | 'TIMEOUT'
   */
  public readonly code?: string;

  /**
   * HTTP status code, if available.
   * @example 404 | 429 | 500
   */
  public readonly statusCode?: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = 'OSRSWikiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Thrown when a request fails validation or an invalid parameter is provided.
 */
export class ValidationError extends OSRSWikiError {
  constructor(param: string, message: string) {
    super(`Validation failed for "${param}": ${message}`, 'VALIDATION', 0);
    this.name = 'ValidationError';
  }
}

/**
 * Thrown when a requested wiki page or image does not exist.
 */
export class NotFoundError extends OSRSWikiError {
  constructor(title: string) {
    super(`Page not found: ${title}`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}
