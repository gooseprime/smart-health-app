import { Request, Response, NextFunction } from 'express'
import { body, param, query } from 'express-validator'
import { Alert } from '../models/Alert'
import { createError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'
import { AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validateRequest'

export class AlertController {
  // Validation methods
  static validateGetAlerts = validate([
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
  ])

  static validateAlertId = validate([
    param('id')
      .isMongoId()
      .withMessage('Invalid alert ID format')
  ])

  static validateAcknowledgeAlert = validate([
    param('id')
      .isMongoId()
      .withMessage('Invalid alert ID format')
  ])

  static validateResolveAlert = validate([
    param('id')
      .isMongoId()
      .withMessage('Invalid alert ID format'),
    body('resolutionNotes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Resolution notes cannot exceed 500 characters')
  ])

  // Get alerts with filtering and pagination
  async getAlerts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        type,
        severity,
        village,
        acknowledged,
        resolved,
        page = 1,
        limit = 20
      } = req.query

      // Build filter object
      const filter: any = {}

      // Role-based filtering
      if (req.user?.role === 'health_worker') {
        // Health workers can only see alerts for their village
        if (req.user?.village) {
          filter.village = req.user.village
        }
      } else if (req.user?.role === 'supervisor' && req.user?.village) {
        filter.village = req.user.village
      }

      // Apply filters
      if (type) filter.type = type
      if (severity) filter.severity = severity
      if (village) filter.village = new RegExp(village as string, 'i')
      if (acknowledged !== undefined) filter.acknowledged = acknowledged === 'true'
      if (resolved !== undefined) filter.resolved = resolved === 'true'

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit)
      const limitNum = Math.min(Number(limit), 100)

      // Execute queries in parallel
      const [alerts, total] = await Promise.all([
        Alert.find(filter)
          .populate('createdBy', 'name email role village')
          .populate('acknowledgedBy', 'name email')
          .populate('resolvedBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Alert.countDocuments(filter)
      ])

      const totalPages = Math.ceil(total / limitNum)

      logger.info(`Alerts fetched: ${alerts.length} of ${total}`, {
        userId: req.user?._id,
        filters: filter,
        pagination: { page: Number(page), limit: limitNum }
      })

      res.json({
        success: true,
        data: {
          alerts,
          pagination: {
            page: Number(page),
            limit: limitNum,
            total,
            pages: totalPages,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          }
        }
      })
    } catch (error: any) {
      logger.error('Error fetching alerts:', {
        error: error.message,
        userId: req.user?._id,
        query: req.query
      })
      next(error)
    }
  }

  // Get alert by ID
  async getAlertById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await Alert.findById(req.params.id)
        .populate('createdBy', 'name email role village')
        .populate('acknowledgedBy', 'name email')
        .populate('resolvedBy', 'name email')

      if (!alert) {
        throw createError('Alert not found', 404)
      }

      // Check permissions
      if (req.user?.role === 'health_worker' && alert.village !== req.user?.village) {
        throw createError('Access denied', 403)
      }

      res.json({
        success: true,
        data: { alert }
      })
    } catch (error: any) {
      logger.error('Error fetching alert by ID:', error)
      next(error)
    }
  }

  // Acknowledge alert
  async acknowledgeAlert(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await Alert.findByIdAndUpdate(
        req.params.id,
        {
          acknowledged: true,
          acknowledgedBy: req.user?._id,
          acknowledgedAt: new Date()
        },
        { new: true, runValidators: true }
      )
        .populate('createdBy', 'name email role village')
        .populate('acknowledgedBy', 'name email')

      if (!alert) {
        throw createError('Alert not found', 404)
      }

      logger.info(`Alert acknowledged: ${alert._id} by ${req.user?.email}`)

      res.json({
        success: true,
        data: { alert },
        message: 'Alert acknowledged successfully'
      })
    } catch (error: any) {
      logger.error('Error acknowledging alert:', error)
      next(error)
    }
  }

  // Resolve alert
  async resolveAlert(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resolutionNotes } = req.body

      const alert = await Alert.findByIdAndUpdate(
        req.params.id,
        {
          resolved: true,
          resolvedBy: req.user?._id,
          resolvedAt: new Date(),
          resolutionNotes
        },
        { new: true, runValidators: true }
      )
        .populate('createdBy', 'name email role village')
        .populate('acknowledgedBy', 'name email')
        .populate('resolvedBy', 'name email')

      if (!alert) {
        throw createError('Alert not found', 404)
      }

      logger.info(`Alert resolved: ${alert._id} by ${req.user?.email}`)

      res.json({
        success: true,
        data: { alert },
        message: 'Alert resolved successfully'
      })
    } catch (error: any) {
      logger.error('Error resolving alert:', error)
      next(error)
    }
  }

  // Delete alert
  async deleteAlert(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await Alert.findByIdAndDelete(req.params.id)

      if (!alert) {
        throw createError('Alert not found', 404)
      }

      logger.info(`Alert deleted: ${alert._id} by ${req.user?.email}`)

      res.json({
        success: true,
        message: 'Alert deleted successfully'
      })
    } catch (error: any) {
      logger.error('Error deleting alert:', error)
      next(error)
    }
  }

  // Get alert statistics
  async getAlertStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter: any = {}

      // Role-based filtering
      if (req.user?.role === 'health_worker' && req.user?.village) {
        filter.village = req.user.village
      } else if (req.user?.role === 'supervisor' && req.user?.village) {
        filter.village = req.user.village
      }

      const [
        totalAlerts,
        activeAlerts,
        acknowledgedAlerts,
        resolvedAlerts,
        severityStats,
        typeStats,
        villageStats,
        recentAlerts
      ] = await Promise.all([
        Alert.countDocuments(filter),
        Alert.countDocuments({ ...filter, resolved: false }),
        Alert.countDocuments({ ...filter, acknowledged: true, resolved: false }),
        Alert.countDocuments({ ...filter, resolved: true }),
        Alert.aggregate([
          { $match: filter },
          { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]),
        Alert.aggregate([
          { $match: filter },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Alert.aggregate([
          { $match: filter },
          { $group: { _id: '$village', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        Alert.find(filter)
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('createdBy', 'name email')
      ])

      // Calculate trends (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const trendData = await Alert.aggregate([
        {
          $match: {
            ...filter,
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])

      res.json({
        success: true,
        data: {
          overview: {
            total: totalAlerts,
            active: activeAlerts,
            acknowledged: acknowledgedAlerts,
            resolved: resolvedAlerts
          },
          severityDistribution: severityStats,
          typeDistribution: typeStats,
          villageDistribution: villageStats,
          recentAlerts,
          trends: trendData
        }
      })
    } catch (error: any) {
      logger.error('Error fetching alert stats:', error)
      next(error)
    }
  }

  // Export alerts
  async exportAlerts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'csv', ...filters } = req.query

      // Build filter object
      const filter: any = {}
      if (req.user?.role === 'health_worker' && req.user?.village) {
        filter.village = req.user.village
      } else if (req.user?.role === 'supervisor' && req.user?.village) {
        filter.village = req.user.village
      }

      // Apply additional filters
      if (filters.type) filter.type = filters.type
      if (filters.severity) filter.severity = filters.severity
      if (filters.village) filter.village = new RegExp(filters.village as string, 'i')
      if (filters.acknowledged !== undefined) filter.acknowledged = filters.acknowledged === 'true'
      if (filters.resolved !== undefined) filter.resolved = filters.resolved === 'true'

      const alerts = await Alert.find(filter)
        .populate('createdBy', 'name email role village')
        .populate('acknowledgedBy', 'name email')
        .populate('resolvedBy', 'name email')
        .sort({ createdAt: -1 })

      if (format === 'csv') {
        // Generate CSV
        const csvHeaders = [
          'ID', 'Title', 'Type', 'Severity', 'Village', 'Status', 'Message',
          'Created By', 'Created At', 'Acknowledged By', 'Acknowledged At',
          'Resolved By', 'Resolved At', 'Resolution Notes'
        ]

        const csvRows = alerts.map(alert => [
          alert._id,
          alert.title,
          alert.type,
          alert.severity,
          alert.village || '',
          alert.resolved ? 'resolved' : alert.acknowledged ? 'acknowledged' : 'active',
          alert.message,
          (alert.createdBy as any)?.name || '',
          alert.createdAt.toISOString(),
          (alert.acknowledgedBy as any)?.name || '',
          alert.acknowledgedAt?.toISOString() || '',
          (alert.resolvedBy as any)?.name || '',
          alert.resolvedAt?.toISOString() || '',
          (alert as any).resolutionNotes || ''
        ])

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n')

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename=alerts-${new Date().toISOString().split('T')[0]}.csv`)
        res.send(csvContent)
      } else {
        // Return JSON
        res.json({
          success: true,
          data: { alerts }
        })
      }

      logger.info(`Alerts exported by ${req.user?.email}: ${alerts.length} alerts`)
    } catch (error: any) {
      logger.error('Error exporting alerts:', error)
      next(error)
    }
  }
}

export const alertController = new AlertController()
