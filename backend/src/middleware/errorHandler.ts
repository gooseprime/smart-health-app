import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message } = error

  // Log error
  logger.error(`Error ${statusCode}: ${message}`, {
    error: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409
    message = 'Duplicate field value'
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error'
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  })
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  return error
}
