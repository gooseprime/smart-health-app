import { Report } from '../models/Report'
import { Alert } from '../models/Alert'
import { logger } from '../utils/logger'
import { Types } from 'mongoose'

export interface ReportFilters {
  status?: string
  severity?: string
  village?: string
  dateFrom?: Date
  dateTo?: Date
  submittedBy?: Types.ObjectId
}

export interface PaginationOptions {
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface ReportStats {
  overview: {
    total: number
    pending: number
    reviewed: number
    flagged: number
  }
  severityDistribution: Array<{ _id: string; count: number }>
  villageDistribution: Array<{ _id: string; count: number }>
  recentReports: any[]
  trends: Array<{ _id: { year: number; month: number; day: number }; count: number }>
}

export class ReportService {
  // Create a new report
  async createReport(reportData: any): Promise<any> {
    try {
      const report = new Report(reportData)
      await report.save()
      
      // Populate submittedBy field
      await report.populate('submittedBy', 'name email role village')
      
      logger.info(`Report created: ${report._id}`)
      return report
    } catch (error: any) {
      logger.error('Error creating report:', error)
      throw error
    }
  }

  // Get reports with filtering and pagination
  async getReports(filters: ReportFilters, pagination: PaginationOptions): Promise<{
    reports: any[]
    total: number
    pagination: any
  }> {
    try {
      const { page, limit, sortBy, sortOrder } = pagination
      const skip = (page - 1) * limit

      // Build filter object
      const filter: any = {}
      if (filters.status) filter.status = filters.status
      if (filters.severity) filter.severity = filters.severity
      if (filters.village) filter.village = new RegExp(filters.village, 'i')
      if (filters.submittedBy) filter.submittedBy = filters.submittedBy
      if (filters.dateFrom || filters.dateTo) {
        filter.submittedAt = {}
        if (filters.dateFrom) filter.submittedAt.$gte = filters.dateFrom
        if (filters.dateTo) filter.submittedAt.$lte = filters.dateTo
      }

      // Build sort object
      const sort: any = {}
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1

      // Execute queries in parallel
      const [reports, total] = await Promise.all([
        Report.find(filter)
          .populate('submittedBy', 'name email role village')
          .populate('reviewedBy', 'name email role')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Report.countDocuments(filter)
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        reports,
        total,
        pagination: {
          page,
          limit,
          total,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error: any) {
      logger.error('Error fetching reports:', error)
      throw error
    }
  }

  // Get report by ID
  async getReportById(id: string): Promise<any> {
    try {
      const report = await Report.findById(id)
        .populate('submittedBy', 'name email role village')
        .populate('reviewedBy', 'name email role')

      if (!report) {
        throw new Error('Report not found')
      }

      return report
    } catch (error: any) {
      logger.error('Error fetching report by ID:', error)
      throw error
    }
  }

  // Update report
  async updateReport(id: string, updateData: any, reviewedBy: Types.ObjectId): Promise<any> {
    try {
      const report = await Report.findByIdAndUpdate(
        id,
        {
          ...updateData,
          reviewedBy,
          reviewedAt: new Date()
        },
        { new: true, runValidators: true }
      )
        .populate('submittedBy', 'name email role village')
        .populate('reviewedBy', 'name email role')

      if (!report) {
        throw new Error('Report not found')
      }

      logger.info(`Report updated: ${report._id}`)
      return report
    } catch (error: any) {
      logger.error('Error updating report:', error)
      throw error
    }
  }

  // Delete report
  async deleteReport(id: string): Promise<boolean> {
    try {
      const result = await Report.findByIdAndDelete(id)
      
      if (!result) {
        throw new Error('Report not found')
      }

      logger.info(`Report deleted: ${id}`)
      return true
    } catch (error: any) {
      logger.error('Error deleting report:', error)
      throw error
    }
  }

  // Get report statistics
  async getReportStats(filters: ReportFilters): Promise<ReportStats> {
    try {
      // Build filter object
      const filter: any = {}
      if (filters.status) filter.status = filters.status
      if (filters.severity) filter.severity = filters.severity
      if (filters.village) filter.village = new RegExp(filters.village, 'i')
      if (filters.submittedBy) filter.submittedBy = filters.submittedBy

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

      return {
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
    } catch (error: any) {
      logger.error('Error fetching report stats:', error)
      throw error
    }
  }

  // Check alert conditions
  async checkAlertConditions(report: any): Promise<void> {
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

      // Check for outbreak patterns
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
    } catch (error: any) {
      logger.error('Error checking alert conditions:', error)
      throw error
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
    } catch (error: any) {
      logger.error('Error creating alert:', error)
      throw error
    }
  }

  // Export reports
  async exportReports(filters: ReportFilters, format: 'csv' | 'json' = 'json'): Promise<any> {
    try {
      // Build filter object
      const filter: any = {}
      if (filters.status) filter.status = filters.status
      if (filters.severity) filter.severity = filters.severity
      if (filters.village) filter.village = new RegExp(filters.village, 'i')
      if (filters.submittedBy) filter.submittedBy = filters.submittedBy
      if (filters.dateFrom || filters.dateTo) {
        filter.submittedAt = {}
        if (filters.dateFrom) filter.submittedAt.$gte = filters.dateFrom
        if (filters.dateTo) filter.submittedAt.$lte = filters.dateTo
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

        return {
          content: csvContent,
          contentType: 'text/csv',
          filename: `reports-${new Date().toISOString().split('T')[0]}.csv`
        }
      } else {
        return {
          content: reports,
          contentType: 'application/json',
          filename: `reports-${new Date().toISOString().split('T')[0]}.json`
        }
      }
    } catch (error: any) {
      logger.error('Error exporting reports:', error)
      throw error
    }
  }
}

export const reportService = new ReportService()
