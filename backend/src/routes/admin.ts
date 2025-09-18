import express from 'express'
import { body, query, param } from 'express-validator'
import { adminController } from '../controllers/AdminController'
import { validateRequest } from '../middleware/validateRequest'
import { authenticate, authorize } from '../middleware/auth'

const router = express.Router()

// All admin routes require admin authentication
router.use(authenticate)
router.use(authorize('admin'))

// Validation rules
const createAlertRuleValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Rule name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('type')
    .isIn(['water_contamination', 'disease_outbreak', 'water_shortage', 'infrastructure', 'system'])
    .withMessage('Invalid alert type'),
  body('severity')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('conditions')
    .isArray({ min: 1 })
    .withMessage('At least one condition is required'),
  body('conditions.*.field')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Condition field is required'),
  body('conditions.*.operator')
    .isIn(['equals', 'greater_than', 'less_than', 'contains', 'between'])
    .withMessage('Invalid operator'),
  body('conditions.*.value')
    .notEmpty()
    .withMessage('Condition value is required'),
  body('villages')
    .optional()
    .isArray()
    .withMessage('Villages must be an array'),
  body('notificationSettings.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification setting must be boolean'),
  body('notificationSettings.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification setting must be boolean'),
  body('notificationSettings.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification setting must be boolean')
]

const updateAlertRuleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid rule ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Rule name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be boolean')
]

const createVillageSettingsValidation = [
  body('villageName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Village name must be between 2 and 100 characters'),
  body('population')
    .isInt({ min: 1 })
    .withMessage('Population must be a positive integer'),
  body('coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('healthFacilities')
    .optional()
    .isArray()
    .withMessage('Health facilities must be an array'),
  body('waterSources')
    .optional()
    .isArray()
    .withMessage('Water sources must be an array'),
  body('emergencyContacts')
    .optional()
    .isArray()
    .withMessage('Emergency contacts must be an array')
]

const updateVillageSettingsValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid village settings ID'),
  body('population')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Population must be a positive integer'),
  body('coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
]

// Alert Rules Routes
router.get('/alert-rules', adminController.getAlertRules)
router.post('/alert-rules', createAlertRuleValidation, validateRequest, adminController.createAlertRule)
router.get('/alert-rules/:id', param('id').isMongoId().withMessage('Invalid rule ID'), validateRequest, adminController.getAlertRuleById)
router.put('/alert-rules/:id', updateAlertRuleValidation, validateRequest, adminController.updateAlertRule)
router.delete('/alert-rules/:id', param('id').isMongoId().withMessage('Invalid rule ID'), validateRequest, adminController.deleteAlertRule)

// Village Settings Routes
router.get('/village-settings', adminController.getVillageSettings)
router.post('/village-settings', createVillageSettingsValidation, validateRequest, adminController.createVillageSettings)
router.get('/village-settings/:id', param('id').isMongoId().withMessage('Invalid village settings ID'), validateRequest, adminController.getVillageSettingsById)
router.put('/village-settings/:id', updateVillageSettingsValidation, validateRequest, adminController.updateVillageSettings)
router.delete('/village-settings/:id', param('id').isMongoId().withMessage('Invalid village settings ID'), validateRequest, adminController.deleteVillageSettings)

// System Settings Routes
router.get('/system-settings', adminController.getSystemSettings)
router.put('/system-settings', adminController.updateSystemSettings)

// Analytics Routes
router.get('/analytics/overview', adminController.getAnalyticsOverview)
router.get('/analytics/reports', adminController.getReportAnalytics)
router.get('/analytics/alerts', adminController.getAlertAnalytics)
router.get('/analytics/villages', adminController.getVillageAnalytics)

// Export Routes
router.get('/export/alert-rules', adminController.exportAlertRules)
router.get('/export/village-settings', adminController.exportVillageSettings)
router.get('/export/system-data', adminController.exportSystemData)

export default router
