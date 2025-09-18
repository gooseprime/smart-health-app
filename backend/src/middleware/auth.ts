import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { createError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: any
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError('Access denied. No token provided.', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      throw createError('Invalid token.', 401)
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('Access denied. User not authenticated.', 401)
    }

    if (!roles.includes(req.user.role)) {
      throw createError('Access denied. Insufficient permissions.', 403)
    }

    next()
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      const user = await User.findById(decoded.id).select('-password')
      req.user = user
    }

    next()
  } catch (error) {
    // Optional auth - don't throw error, just continue without user
    next()
  }
}
