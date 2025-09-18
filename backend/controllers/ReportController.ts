import { Request, Response, NextFunction } from 'express'
import { Report } from '../models/Report'
import { Alert } from '../models/Alert'
import { createError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'
import { AuthRequest } from '../middleware/auth'

export class ReportController {
  // Create new report
  async createReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reportData = {
        ...req.body,
        submittedBy: req.user?._id
      }

      const report = new Report(reportData)
      await report.save()

      // Populate submittedBy field
      await report.populate('submittedBy', 'name email role village')

      // Check for alert conditions
      await this.checkAlertConditions(report)

      logger.info(`New report created: ${report._id} by ${req.user?.email}`)

      res.status(201).json({
        success: true,
        data: { report }
      })
    } catch (error) {
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
      const filter: any = {}

      // Role-based filtering
      if (req.user?.role === 'health_worker') {
        filter.submittedBy = req.user._id
      } else if (req.user?.role === 'supervisor' && req.user?.village) {
        filter.village = req.user.village
      }

      // Apply filters
      if (status) filter.status = status
      if (severity) filter.severity = severity
      if (village) filter.village = new RegExp(village as string, 'i')
      if (dateFrom || dateTo) {
        filter.submittedAt = {}
        if (dateFrom) filter.submittedAt.$gte = new Date(dateFrom as string)
        if (dateTo) filter.submittedAt.$lte = new Date(dateTo as string)
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit)

      // Build sort object
      const sort: any = {}
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1

      // Execute query
      const reports = await Report.find(filter)
        .populate('submittedBy', 'name email role village')
        .populate('reviewedBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))

      const total = await Report.countDocuments(filter)

      res.json({
        success: true,
        data: {
          reports,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      })
    } catch (error) {
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
          report.submittedBy?.name || '',
          report.submittedAt.toISOString(),
          report.reviewedBy?.name || '',
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
