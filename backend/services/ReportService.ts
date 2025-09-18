// Backend service for report operations
import type { Report, ReportCreateInput, ReportUpdateInput } from "../models/Report"

export class ReportService {
  // In a real app, this would connect to your database (PostgreSQL, MongoDB, etc.)
  private reports: Report[] = []

  async createReport(data: ReportCreateInput): Promise<Report> {
    const report: Report = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      submitted_at: new Date(),
      status: "pending",
    }

    this.reports.push(report)

    // Check for outbreak patterns
    await this.checkOutbreakPatterns(report)

    return report
  }

  async getReports(filters?: {
    status?: string
    location?: string
    dateFrom?: Date
    dateTo?: Date
  }): Promise<Report[]> {
    let filteredReports = [...this.reports]

    if (filters?.status) {
      filteredReports = filteredReports.filter((r) => r.status === filters.status)
    }

    if (filters?.dateFrom) {
      filteredReports = filteredReports.filter((r) => r.submitted_at >= filters.dateFrom!)
    }

    if (filters?.dateTo) {
      filteredReports = filteredReports.filter((r) => r.submitted_at <= filters.dateTo!)
    }

    return filteredReports.sort((a, b) => b.submitted_at.getTime() - a.submitted_at.getTime())
  }

  async getReportById(id: string): Promise<Report | null> {
    return this.reports.find((r) => r.id === id) || null
  }

  async updateReport(id: string, data: ReportUpdateInput): Promise<Report | null> {
    const reportIndex = this.reports.findIndex((r) => r.id === id)
    if (reportIndex === -1) return null

    this.reports[reportIndex] = {
      ...this.reports[reportIndex],
      ...data,
    }

    return this.reports[reportIndex]
  }

  async deleteReport(id: string): Promise<boolean> {
    const reportIndex = this.reports.findIndex((r) => r.id === id)
    if (reportIndex === -1) return false

    this.reports.splice(reportIndex, 1)
    return true
  }

  async getReportStats(): Promise<{
    total: number
    pending: number
    reviewed: number
    flagged: number
    bySymptom: Record<string, number>
    bySeverity: Record<string, number>
  }> {
    const stats = {
      total: this.reports.length,
      pending: this.reports.filter((r) => r.status === "pending").length,
      reviewed: this.reports.filter((r) => r.status === "reviewed").length,
      flagged: this.reports.filter((r) => r.status === "flagged").length,
      bySymptom: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    }

    // Count symptoms
    this.reports.forEach((report) => {
      report.symptoms.forEach((symptom) => {
        stats.bySymptom[symptom] = (stats.bySymptom[symptom] || 0) + 1
      })
      stats.bySeverity[report.severity] = (stats.bySeverity[report.severity] || 0) + 1
    })

    return stats
  }

  private async checkOutbreakPatterns(newReport: Report): Promise<void> {
    // Simple outbreak detection logic
    const recentReports = this.reports.filter((r) => {
      const daysDiff = (Date.now() - r.submitted_at.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7 // Last 7 days
    })

    // Check for symptom clusters
    const symptomCounts: Record<string, number> = {}
    recentReports.forEach((report) => {
      report.symptoms.forEach((symptom) => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1
      })
    })

    // Alert if any symptom appears in more than 5 reports in a week
    Object.entries(symptomCounts).forEach(([symptom, count]) => {
      if (count >= 5) {
        this.triggerOutbreakAlert(symptom, count)
      }
    })
  }

  private async triggerOutbreakAlert(symptom: string, count: number): Promise<void> {
    // In a real app, this would send notifications to health officials
    console.log(`OUTBREAK ALERT: ${symptom} reported ${count} times in the last 7 days`)
  }
}

export const reportService = new ReportService()
