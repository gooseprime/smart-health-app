import express from 'express'
import { body, query, param } from 'express-validator'
import { userController } from '../controllers/UserController'
import { validateRequest } from '../middleware/validateRequest'
import { authenticate, authorize } from '../middleware/auth'

const router = express.Router()

// Validation rules
const createUserValidation = [
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

const updateUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
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
    .withMessage('Please provide a valid phone number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be boolean')
]

const getUsersValidation = [
  query('role')
    .optional()
    .isIn(['admin', 'health_worker', 'supervisor'])
    .withMessage('Invalid role filter'),
  query('village')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Village filter cannot exceed 100 characters'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be boolean'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
]

// Routes
router.get('/', authenticate, authorize('admin', 'supervisor'), getUsersValidation, validateRequest, userController.getUsers)
router.get('/:id', authenticate, param('id').isMongoId().withMessage('Invalid user ID'), validateRequest, userController.getUserById)

export default router
