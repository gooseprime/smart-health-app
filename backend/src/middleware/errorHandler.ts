import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { ValidationError } from 'express-validator'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
  code?: string
  keyValue?: any
  errors?: any
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message } = error

  // Log error with more context
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    code: error.code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?._id,
    timestamp: new Date().toISOString()
  })

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
    // Extract validation errors
    if (error.errors) {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
        value: err.value
      }))
      res.status(statusCode).json({
        success: false,
        error: {
          message,
          type: 'validation',
          details: validationErrors
        }
      })
      return
    }
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409
    message = 'Duplicate field value'
    // Extract duplicate field
    if (error.keyValue) {
      const duplicateField = Object.keys(error.keyValue)[0]
      message = `${duplicateField} already exists`
    }
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  } else if (error.name === 'MulterError') {
    statusCode = 400
    message = 'File upload error'
  }

  // Handle express-validator errors
  if (Array.isArray(error) && error.length > 0 && error[0].msg) {
    statusCode = 400
    message = 'Validation failed'
    const validationErrors = error.map((err: any) => ({
      field: err.param || err.path,
      message: err.msg || err.message,
      value: err.value
    }))
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        type: 'validation',
        details: validationErrors
      }
    })
    return
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error'
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      type: error.name || 'Error',
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        code: error.code 
      })
    }
  })
}

export const createError = (message: string, statusCode: number = 500, code?: string): AppError => {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  error.code = code
  return error
}
