import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain, body, param } from 'express-validator'
import { createError } from './errorHandler'
import { logger } from '../utils/logger'

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : error.param,
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : error.value,
      location: error.location
    }))
    
    logger.warn('Validation failed:', {
      errors: errorMessages,
      url: req.url,
      method: req.method,
      userId: (req as any).user?._id
    })
    
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        type: 'validation',
        details: errorMessages
      }
    })
    return
  }
  
  next()
}

// Helper function to create validation middleware
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)))
    
    // Check for errors
    validateRequest(req, res, next)
  }
}

// Common validation patterns
export const commonValidations = {
  email: (field: string = 'email') => [
    body(field)
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],
  
  password: (field: string = 'password') => [
    body(field)
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
  ],
  
  objectId: (field: string = 'id') => [
    param(field)
      .isMongoId()
      .withMessage('Invalid ID format')
  ],
  
  required: (field: string, message?: string) => [
    body(field)
      .notEmpty()
      .withMessage(message || `${field} is required`)
  ],
  
  optional: (field: string) => [
    body(field)
      .optional()
  ]
}
