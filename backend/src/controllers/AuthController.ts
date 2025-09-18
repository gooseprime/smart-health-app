import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '../models/User'
import { createError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'
import { AuthRequest } from '../middleware/auth'

export class AuthController {
  // Generate JWT token
  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret'
    const expiresIn = process.env.JWT_EXPIRE || '7d'
    
    return jwt.sign(
      { id: userId },
      secret,
      { expiresIn }
    ) as string
  }

  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role = 'health_worker', village, phone } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw createError('User with this email already exists', 409)
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        role,
        village,
        phone
      })

      await user.save()

      // Generate token
      const token = this.generateToken(user._id)

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      logger.info(`New user registered: ${email}`)

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            village: user.village,
            phone: user.phone,
            isActive: user.isActive
          },
          token
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password')
      if (!user) {
        throw createError('Invalid email or password', 401)
      }

      // Check if user is active
      if (!user.isActive) {
        throw createError('Account is deactivated', 401)
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401)
      }

      // Generate token
      const token = this.generateToken(user._id)

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      logger.info(`User logged in: ${email}`)

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            village: user.village,
            phone: user.phone,
            isActive: user.isActive,
            lastLogin: user.lastLogin
          },
          token
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Logout user
  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a more sophisticated setup, you might want to blacklist the token
      // For now, we'll just return a success response
      logger.info(`User logged out: ${req.user?.email}`)

      res.json({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  // Refresh token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body

      if (!token) {
        throw createError('Token is required', 400)
      }

      // Verify token
      const decoded = jwt.verify(token, (process.env.JWT_SECRET || 'fallback-secret') as string) as any
      const user = await User.findById(decoded.id)

      if (!user || !user.isActive) {
        throw createError('Invalid token', 401)
      }

      // Generate new token
      const newToken = this.generateToken(user._id)

      res.json({
        success: true,
        data: {
          token: newToken
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body

      const user = await User.findOne({ email })
      if (!user) {
        // Don't reveal if email exists or not
        res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        })
        return
      }

      // Generate reset token (in a real app, you'd send this via email)
      const resetToken = jwt.sign(
        { id: user._id, type: 'password_reset' },
        (process.env.JWT_SECRET || 'fallback-secret') as string,
        { expiresIn: '1h' }
      )

      // TODO: Send email with reset link
      logger.info(`Password reset requested for: ${email}, token: ${resetToken}`)

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        // In development, return the token for testing
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      })
    } catch (error) {
      next(error)
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body

      if (!token || !newPassword) {
        throw createError('Token and new password are required', 400)
      }

      // Verify reset token
      const decoded = jwt.verify(token, (process.env.JWT_SECRET || 'fallback-secret') as string) as any
      if (decoded.type !== 'password_reset') {
        throw createError('Invalid reset token', 400)
      }

      const user = await User.findById(decoded.id)
      if (!user) {
        throw createError('Invalid reset token', 400)
      }

      // Update password
      user.password = newPassword
      await user.save()

      logger.info(`Password reset for user: ${user.email}`)

      res.json({
        success: true,
        message: 'Password reset successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  // Change password
  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body

      const user = await User.findById(req.user?._id).select('+password')
      if (!user) {
        throw createError('User not found', 404)
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword)
      if (!isCurrentPasswordValid) {
        throw createError('Current password is incorrect', 400)
      }

      // Update password
      user.password = newPassword
      await user.save()

      logger.info(`Password changed for user: ${user.email}`)

      res.json({
        success: true,
        message: 'Password changed successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  // Get current user
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?._id)
      if (!user) {
        throw createError('User not found', 404)
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            village: user.village,
            phone: user.phone,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          }
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Update user profile
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, village, phone } = req.body
      const allowedUpdates = { name, village, phone }

      // Remove undefined values
      Object.keys(allowedUpdates).forEach(key => 
        allowedUpdates[key as keyof typeof allowedUpdates] === undefined && 
        delete allowedUpdates[key as keyof typeof allowedUpdates]
      )

      const user = await User.findByIdAndUpdate(
        req.user?._id,
        allowedUpdates,
        { new: true, runValidators: true }
      )

      if (!user) {
        throw createError('User not found', 404)
      }

      logger.info(`Profile updated for user: ${user.email}`)

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            village: user.village,
            phone: user.phone,
            isActive: user.isActive,
            lastLogin: user.lastLogin
          }
        }
      })
    } catch (error) {
      next(error)
    }
  }
}

export const authController = new AuthController()
