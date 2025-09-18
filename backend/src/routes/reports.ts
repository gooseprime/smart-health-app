import express from 'express'
import { body, query, param } from 'express-validator'
import { reportController } from '../controllers/ReportController'
import { validateRequest } from '../middleware/validateRequest'
import { authenticate, authorize } from '../middleware/auth'

const router = express.Router()

// Validation rules
const createReportValidation = [
  body('patientName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Patient name must be between 2 and 100 characters'),
  body('age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('symptoms')
    .isArray({ min: 1 })
    .withMessage('At least one symptom is required'),
  body('symptoms.*')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each symptom must be between 1 and 100 characters'),
  body('severity')
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Severity must be mild, moderate, or severe'),
  body('village')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Village name must be between 1 and 100 characters'),
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('location.address')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Address must be between 1 and 200 characters'),
  body('waterTestResults.phLevel')
    .optional()
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH level must be between 0 and 14'),
  body('waterTestResults.contaminationLevel')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Contamination level must be low, medium, or high'),
  body('waterTestResults.bacteriaCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bacteria count must be a non-negative integer'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
]

const updateReportValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid report ID'),
  body('status')
    .optional()
    .isIn(['pending', 'reviewed', 'flagged', 'resolved'])
    .withMessage('Status must be pending, reviewed, flagged, or resolved'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
]

const getReportsValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'reviewed', 'flagged', 'resolved'])
    .withMessage('Invalid status filter'),
  query('severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Invalid severity filter'),
  query('village')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Village filter cannot exceed 100 characters'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid dateFrom format'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid dateTo format'),
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
router.post('/', authenticate, createReportValidation, validateRequest, reportController.createReport)
router.get('/', authenticate, getReportsValidation, validateRequest, reportController.getReports)
router.get('/stats', authenticate, authorize('admin', 'supervisor'), reportController.getReportStats)
router.get('/export', authenticate, authorize('admin', 'supervisor'), reportController.exportReports)
router.get('/:id', authenticate, param('id').isMongoId().withMessage('Invalid report ID'), validateRequest, reportController.getReportById)
router.put('/:id', authenticate, authorize('admin', 'supervisor'), updateReportValidation, validateRequest, reportController.updateReport)
router.delete('/:id', authenticate, authorize('admin'), param('id').isMongoId().withMessage('Invalid report ID'), validateRequest, reportController.deleteReport)

export default router
