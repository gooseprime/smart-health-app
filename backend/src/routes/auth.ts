import express from 'express'
import { body } from 'express-validator'
import { authController } from '../controllers/AuthController'
import { validateRequest } from '../middleware/validateRequest'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'health_worker', 'supervisor'])
    .withMessage('Invalid role'),
  body('village')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Village name cannot exceed 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
]

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
]

// Routes
router.post('/register', registerValidation, validateRequest, authController.register)
router.post('/login', loginValidation, validateRequest, authController.login)
router.post('/logout', authenticate, authController.logout)
router.post('/refresh', authController.refreshToken)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)
router.post('/change-password', authenticate, changePasswordValidation, validateRequest, authController.changePassword)
router.get('/me', authenticate, authController.getCurrentUser)
router.put('/profile', authenticate, authController.updateProfile)

export default router
