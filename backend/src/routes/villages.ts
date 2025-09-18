import express from 'express'
import { query, param } from 'express-validator'
import { villageController } from '../controllers/VillageController'
import { validateRequest } from '../middleware/validateRequest'
import { authenticate, authorize } from '../middleware/auth'

const router = express.Router()

// Validation rules
const getVillagesValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
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
router.get('/', authenticate, getVillagesValidation, validateRequest, villageController.getVillages)
router.get('/:id', authenticate, param('id').isMongoId().withMessage('Invalid village ID'), validateRequest, villageController.getVillageById)

export default router
