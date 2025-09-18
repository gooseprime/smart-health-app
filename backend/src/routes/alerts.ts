import express from 'express'
import { body, query, param } from 'express-validator'
import { alertController } from '../controllers/AlertController'
import { validateRequest } from '../middleware/validateRequest'
import { authenticate, authorize } from '../middleware/auth'

const router = express.Router()

// Validation rules
const acknowledgeAlertValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid alert ID')
]

const resolveAlertValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid alert ID'),
  body('resolutionNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Resolution notes cannot exceed 500 characters')
]

const getAlertsValidation = [
  query('type')
    .optional()
    .isIn(['water_contamination', 'disease_outbreak', 'water_shortage', 'infrastructure', 'system'])
    .withMessage('Invalid alert type'),
  query('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity filter'),
  query('village')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Village filter cannot exceed 100 characters'),
  query('acknowledged')
    .optional()
    .isBoolean()
    .withMessage('Acknowledged must be a boolean'),
  query('resolved')
    .optional()
    .isBoolean()
    .withMessage('Resolved must be a boolean'),
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
router.get('/', authenticate, getAlertsValidation, validateRequest, alertController.getAlerts)
router.get('/stats', authenticate, authorize('admin', 'supervisor'), alertController.getAlertStats)
router.get('/export', authenticate, authorize('admin', 'supervisor'), alertController.exportAlerts)
router.get('/:id', authenticate, param('id').isMongoId().withMessage('Invalid alert ID'), validateRequest, alertController.getAlertById)
router.post('/:id/acknowledge', authenticate, authorize('admin', 'supervisor'), acknowledgeAlertValidation, validateRequest, alertController.acknowledgeAlert)
router.post('/:id/resolve', authenticate, authorize('admin', 'supervisor'), resolveAlertValidation, validateRequest, alertController.resolveAlert)
router.delete('/:id', authenticate, authorize('admin'), param('id').isMongoId().withMessage('Invalid alert ID'), validateRequest, alertController.deleteAlert)

export default router
