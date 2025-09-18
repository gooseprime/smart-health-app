import express from 'express'
import { AlertController } from '../controllers/AlertController'
import { authenticate, authorize } from '../middleware/auth'

const router = express.Router()

// Routes with improved validation
router.get('/', 
  authenticate, 
  AlertController.validateGetAlerts, 
  AlertController.prototype.getAlerts.bind(new AlertController())
)

router.get('/stats', 
  authenticate, 
  authorize('admin', 'supervisor'), 
  AlertController.prototype.getAlertStats.bind(new AlertController())
)

router.get('/export', 
  authenticate, 
  authorize('admin', 'supervisor'), 
  AlertController.prototype.exportAlerts.bind(new AlertController())
)

router.get('/:id', 
  authenticate, 
  AlertController.validateAlertId, 
  AlertController.prototype.getAlertById.bind(new AlertController())
)

router.post('/:id/acknowledge', 
  authenticate, 
  authorize('admin', 'supervisor'), 
  AlertController.validateAcknowledgeAlert, 
  AlertController.prototype.acknowledgeAlert.bind(new AlertController())
)

router.post('/:id/resolve', 
  authenticate, 
  authorize('admin', 'supervisor'), 
  AlertController.validateResolveAlert, 
  AlertController.prototype.resolveAlert.bind(new AlertController())
)

router.delete('/:id', 
  authenticate, 
  authorize('admin'), 
  AlertController.validateAlertId, 
  AlertController.prototype.deleteAlert.bind(new AlertController())
)

export default router
