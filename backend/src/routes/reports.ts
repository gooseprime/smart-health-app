import express from 'express'
import { ReportController } from '../controllers/ReportController'
import { authenticate, authorize } from '../middleware/auth'

const router = express.Router()

// Routes with improved validation
router.post('/', 
  authenticate, 
  ReportController.validateCreateReport, 
  ReportController.prototype.createReport.bind(new ReportController())
)

router.get('/', 
  authenticate, 
  ReportController.validateGetReports, 
  ReportController.prototype.getReports.bind(new ReportController())
)

router.get('/stats', 
  authenticate, 
  authorize('admin', 'supervisor'), 
  ReportController.prototype.getReportStats.bind(new ReportController())
)

router.get('/export', 
  authenticate, 
  authorize('admin', 'supervisor'), 
  ReportController.prototype.exportReports.bind(new ReportController())
)

router.get('/:id', 
  authenticate, 
  ReportController.validateReportId, 
  ReportController.prototype.getReportById.bind(new ReportController())
)

router.put('/:id', 
  authenticate, 
  authorize('admin', 'supervisor'), 
  ReportController.validateUpdateReport, 
  ReportController.prototype.updateReport.bind(new ReportController())
)

router.delete('/:id', 
  authenticate, 
  authorize('admin'), 
  ReportController.validateReportId, 
  ReportController.prototype.deleteReport.bind(new ReportController())
)

export default router
