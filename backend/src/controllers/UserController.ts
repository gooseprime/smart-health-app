import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

export class UserController {
  // Get all users
  async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Placeholder users
      const users = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'health_worker',
          village: 'Village A',
          isActive: true,
          lastLogin: new Date().toISOString()
        }
      ]

      res.json({
        success: true,
        data: { users }
      })
    } catch (error: any) {
      logger.error('Error fetching users:', error)
      next(error)
    }
  }

  // Get user by ID
  async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id
      
      // Placeholder user
      const user = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'health_worker',
        village: 'Village A',
        isActive: true,
        lastLogin: new Date().toISOString()
      }

      res.json({
        success: true,
        data: { user }
      })
    } catch (error: any) {
      logger.error('Error fetching user:', error)
      next(error)
    }
  }
}

export const userController = new UserController()
