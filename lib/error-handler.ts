export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429)
  }
}

// Error logger
export const logError = (error: Error | AppError, context?: Record<string, any>) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    ...(error instanceof AppError && {
      statusCode: error.statusCode,
      isOperational: error.isOperational,
    }),
  }

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo)
  }

  // In production, you would send to a logging service like Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: context })
    console.error('Production error:', errorInfo)
  }
}

// Async error wrapper
export const asyncHandler = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error as Error)
      throw error
    }
  }
}

// Database error handler
export const handleDatabaseError = (error: any): never => {
  if (error.code === 'P2002') {
    throw new ConflictError('A record with this unique field already exists')
  }
  
  if (error.code === 'P2025') {
    throw new NotFoundError('Record')
  }
  
  if (error.code === 'P2003') {
    throw new ValidationError('Invalid foreign key reference')
  }
  
  logError(error, { type: 'database_error' })
  throw new AppError('Database operation failed', 500)
}

// API error response formatter
export const formatErrorResponse = (error: Error | AppError) => {
  const isAppError = error instanceof AppError
  
  return {
    success: false,
    error: {
      message: error.message,
      ...(isAppError && { statusCode: error.statusCode }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        type: error.constructor.name,
      }),
    },
    timestamp: new Date().toISOString(),
  }
} 
