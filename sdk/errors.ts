export class OSRSWikiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'OSRSWikiError';
  }
}

export class ValidationError extends OSRSWikiError {
  constructor(param: string, message: string) {
    super(`Validation failed for "${param}": ${message}`, 'VALIDATION', 0);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends OSRSWikiError {
  constructor(title: string) {
    super(`Page not found: ${title}`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}
