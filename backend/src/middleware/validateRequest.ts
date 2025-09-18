import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { createError } from './errorHandler'

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined
    }))
    
    const error = createError('Validation failed', 400)
    ;(error as any).details = errorMessages
    next(error)
    return
  }
  
  next()
}
