import { Request, Response, NextFunction } from 'express'
import { body, param, query } from 'express-validator'
import { createError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'
import { AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validateRequest'
import { reportService, ReportFilters, PaginationOptions } from '../services/ReportService'
import { Report } from '../models/Report'
import { Alert } from '../models/Alert'

export class ReportController {
  // Validation methods
  static validateCreateReport = validate([
    body('patientName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Patient name must be between 2 and 100 characters'),
    body('age')
      .isInt({ min: 0, max: 150 })
      .withMessage('Age must be a valid number between 0 and 150'),
    body('gender')
      .isIn(['male', 'female', 'other'])
      .withMessage('Gender must be male, female, or other'),
    body('symptoms')
      .isArray({ min: 1 })
      .withMessage('At least one symptom is required'),
    body('symptoms.*')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Each symptom must be between 2 and 50 characters'),
    body('severity')
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Severity must be low, medium, high, or critical'),
    body('village')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Village name must be between 2 and 100 characters'),
    body('location')
      .optional()
      .isObject()
      .withMessage('Location must be a valid object'),
    body('waterTestResults')
      .optional()
      .isObject()
      .withMessage('Water test results must be a valid object'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes must not exceed 1000 characters')
  ])

  static validateGetReports = validate([
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['pending', 'reviewed', 'flagged', 'resolved'])
      .withMessage('Invalid status value'),
    query('severity')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid severity value'),
    query('dateFrom')
      .optional()
      .isISO8601()
      .withMessage('Date from must be a valid ISO 8601 date'),
    query('dateTo')
      .optional()
      .isISO8601()
      .withMessage('Date to must be a valid ISO 8601 date'),
    query('sortBy')
      .optional()
      .isIn(['submittedAt', 'severity', 'village', 'status'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ])

  static validateReportId = validate([
    param('id')
      .isMongoId()
      .withMessage('Invalid report ID format')
  ])

  static validateUpdateReport = validate([
    param('id')
      .isMongoId()
      .withMessage('Invalid report ID format'),
    body('status')
      .optional()
      .isIn(['pending', 'reviewed', 'flagged', 'resolved'])
      .withMessage('Invalid status value'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes must not exceed 1000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority value')
  ])

  // Create new report
  async createReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate user exists and is active
      if (!req.user?._id) {
        throw createError('User not authenticated', 401)
      }

      const reportData = {
        ...req.body,
        submittedBy: req.user._id,
        submittedAt: new Date()
      }

      // Create report using service
      const report = await reportService.createReport(reportData)

      // Check for alert conditions asynchronously (don't wait)
      reportService.checkAlertConditions(report).catch(error => {
        logger.error('Error checking alert conditions:', error)
      })

      logger.info(`New report created: ${report._id} by ${req.user.email}`, {
        reportId: report._id,
        userId: req.user._id,
        village: report.village,
        severity: report.severity
      })

      res.status(201).json({
        success: true,
        data: { report },
        message: 'Report created successfully'
      })
    } catch (error: any) {
      logger.error('Error creating report:', {
        error: error.message,
        userId: req.user?._id,
        reportData: req.body
      })
      next(error)
    }
  }

  // Get reports with filtering and pagination
  async getReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        status,
        severity,
        village,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
        sortBy = 'submittedAt',
        sortOrder = 'desc'
      } = req.query

      // Build filter object
      const filters: ReportFilters = {}

      // Role-based filtering
      if (req.user?.role === 'health_worker') {
        filters.submittedBy = req.user._id
      } else if (req.user?.role === 'supervisor' && req.user?.village) {
        filters.village = req.user.village
      }

      // Apply filters
      if (status) filters.status = status as string
      if (severity) filters.severity = severity as string
      if (village) filters.village = village as string
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string)
      if (dateTo) filters.dateTo = new Date(dateTo as string)

      // Build pagination options
      const pagination: PaginationOptions = {
        page: Number(page),
        limit: Math.min(Number(limit), 100), // Cap at 100
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      }

      // Get reports using service
      const result = await reportService.getReports(filters, pagination)

      logger.info(`Reports fetched: ${result.reports.length} of ${result.total}`, {
        userId: req.user?._id,
        filters,
        pagination: { page: pagination.page, limit: pagination.limit }
      })

      res.json({
        success: true,
        data: result
      })
    } catch (error: any) {
      logger.error('Error fetching reports:', {
        error: error.message,
        userId: req.user?._id,
        query: req.query
      })
      next(error)
    }
  }

  // Get report by ID
  async getReportById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await Report.findById(req.params.id)
        .populate('submittedBy', 'name email role village')
        .populate('reviewedBy', 'name email role')

      if (!report) {
        throw createError('Report not found', 404)
      }

      // Check permissions
      if (req.user?.role === 'health_worker' && report.submittedBy._id.toString() !== req.user._id.toString()) {
        throw createError('Access denied', 403)
      }

      res.json({
        success: true,
        data: { report }
      })
    } catch (error) {
      next(error)
    }
  }

  // Update report
  async updateReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateData = {
        ...req.body,
        reviewedBy: req.user?._id,
        reviewedAt: new Date()
      }

      const report = await Report.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('submittedBy', 'name email role village')
       .populate('reviewedBy', 'name email role')

      if (!report) {
        throw createError('Report not found', 404)
      }

      logger.info(`Report updated: ${report._id} by ${req.user?.email}`)

      res.json({
        success: true,
        data: { report }
      })
    } catch (error) {
      next(error)
    }
  }

  // Delete report
  async deleteReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await Report.findByIdAndDelete(req.params.id)

      if (!report) {
        throw createError('Report not found', 404)
      }

      logger.info(`Report deleted: ${report._id} by ${req.user?.email}`)

      res.json({
        success: true,
        message: 'Report deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  // Get report statistics
  async getReportStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter: any = {}

      // Role-based filtering
      if (req.user?.role === 'health_worker') {
        filter.submittedBy = req.user._id
      } else if (req.user?.role === 'supervisor' && req.user?.village) {
        filter.village = req.user.village
      }

      const [
        totalReports,
        pendingReports,
        reviewedReports,
        flaggedReports,
        severityStats,
        villageStats,
        recentReports
      ] = await Promise.all([
        Report.countDocuments(filter),
        Report.countDocuments({ ...filter, status: 'pending' }),
        Report.countDocuments({ ...filter, status: 'reviewed' }),
        Report.countDocuments({ ...filter, status: 'flagged' }),
        Report.aggregate([
          { $match: filter },
          { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]),
        Report.aggregate([
          { $match: filter },
          { $group: { _id: '$village', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        Report.find(filter)
          .sort({ submittedAt: -1 })
          .limit(5)
          .populate('submittedBy', 'name email')
      ])

      // Calculate trends (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const trendData = await Report.aggregate([
        {
          $match: {
            ...filter,
            submittedAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$submittedAt' },
              month: { $month: '$submittedAt' },
              day: { $dayOfMonth: '$submittedAt' }
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
            total: totalReports,
            pending: pendingReports,
            reviewed: reviewedReports,
            flagged: flaggedReports
          },
          severityDistribution: severityStats,
          villageDistribution: villageStats,
          recentReports,
          trends: trendData
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // Export reports
  async exportReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'csv', ...filters } = req.query

      // Build filter object (same as getReports)
      const filter: any = {}
      if (req.user?.role === 'health_worker') {
        filter.submittedBy = req.user._id
      } else if (req.user?.role === 'supervisor' && req.user?.village) {
        filter.village = req.user.village
      }

      // Apply additional filters
      if (filters.status) filter.status = filters.status
      if (filters.severity) filter.severity = filters.severity
      if (filters.village) filter.village = new RegExp(filters.village as string, 'i')
      if (filters.dateFrom || filters.dateTo) {
        filter.submittedAt = {}
        if (filters.dateFrom) filter.submittedAt.$gte = new Date(filters.dateFrom as string)
        if (filters.dateTo) filter.submittedAt.$lte = new Date(filters.dateTo as string)
      }

      const reports = await Report.find(filter)
        .populate('submittedBy', 'name email role village')
        .populate('reviewedBy', 'name email role')
        .sort({ submittedAt: -1 })

      if (format === 'csv') {
        // Generate CSV
        const csvHeaders = [
          'ID', 'Patient Name', 'Age', 'Gender', 'Symptoms', 'Severity', 'Village',
          'Status', 'Submitted By', 'Submitted At', 'Reviewed By', 'Reviewed At', 'Notes'
        ]

        const csvRows = reports.map(report => [
          report._id,
          report.patientName,
          report.age,
          report.gender,
          report.symptoms.join('; '),
          report.severity,
          report.village,
          report.status,
          (report.submittedBy as any)?.name || '',
          report.submittedAt.toISOString(),
          (report.reviewedBy as any)?.name || '',
          report.reviewedAt?.toISOString() || '',
          report.notes || ''
        ])

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n')

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename=reports-${new Date().toISOString().split('T')[0]}.csv`)
        res.send(csvContent)
      } else {
        // Return JSON
        res.json({
          success: true,
          data: { reports }
        })
      }

      logger.info(`Reports exported by ${req.user?.email}: ${reports.length} reports`)
    } catch (error) {
      next(error)
    }
  }

  // Check alert conditions when a report is created
  private async checkAlertConditions(report: any): Promise<void> {
    try {
      // Check for high contamination
      if (report.waterTestResults?.contaminationLevel === 'high') {
        await this.createAlert({
          title: 'High Water Contamination Detected',
          type: 'water_contamination',
          severity: 'high',
          message: `High water contamination detected in ${report.village}. Patient: ${report.patientName}`,
          village: report.village,
          reportId: report._id,
          createdBy: report.submittedBy
        })
      }

      // Check for severe symptoms
      if (report.severity === 'severe') {
        await this.createAlert({
          title: 'Severe Health Case Reported',
          type: 'disease_outbreak',
          severity: 'high',
          message: `Severe health case reported in ${report.village}. Patient: ${report.patientName}, Symptoms: ${report.symptoms.join(', ')}`,
          village: report.village,
          reportId: report._id,
          createdBy: report.submittedBy
        })
      }

      // Check for outbreak patterns (simplified)
      const recentReports = await Report.find({
        village: report.village,
        submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        _id: { $ne: report._id }
      })

      const symptomCounts: Record<string, number> = {}
      recentReports.forEach(r => {
        r.symptoms.forEach((symptom: string) => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1
        })
      })

      // Add current report symptoms
      report.symptoms.forEach((symptom: string) => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1
      })

      // Check for outbreak threshold
      Object.entries(symptomCounts).forEach(([symptom, count]) => {
        if (count >= 5) {
          this.createAlert({
            title: 'Potential Disease Outbreak',
            type: 'disease_outbreak',
            severity: 'critical',
            message: `Potential outbreak detected: ${symptom} reported ${count} times in ${report.village} in the last 7 days`,
            village: report.village,
            createdBy: report.submittedBy
          })
        }
      })
    } catch (error) {
      logger.error('Error checking alert conditions:', error)
    }
  }

  // Create alert helper
  private async createAlert(alertData: any): Promise<void> {
    try {
      const alert = new Alert(alertData)
      await alert.save()

      // Emit real-time notification
      const io = require('../server').io
      if (io) {
        io.to('admin-room').emit('new-alert', alert)
        if (alertData.village) {
          io.to(`village-${alertData.village}`).emit('new-alert', alert)
        }
      }

      logger.info(`Alert created: ${alert._id}`)
    } catch (error) {
      logger.error('Error creating alert:', error)
    }
  }
}

export const reportController = new ReportController()
