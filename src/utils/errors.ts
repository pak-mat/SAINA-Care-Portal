export class AppError extends Error {
  public readonly code: string;
  public readonly originalError?: unknown;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'DATABASE_ERROR', originalError);
    this.name = 'DatabaseError';
  }
}

export function handleSupabaseError(error: any, contextMessage: string): never {
  console.error(`[SainaCare Telemetry] ${contextMessage}`, error);
  throw new DatabaseError(`${contextMessage}: ${error.message || 'Unknown database error'}`, error);
}
