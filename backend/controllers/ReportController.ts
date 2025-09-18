// Backend API controller for report endpoints
import { type NextRequest, NextResponse } from "next/server"
import { reportService } from "../services/ReportService"
import type { ReportCreateInput, ReportUpdateInput } from "../models/Report"

export class ReportController {
  async createReport(request: NextRequest): Promise<NextResponse> {
    try {
      const data: ReportCreateInput = await request.json()

      // Validate required fields
      if (!data.patient_name || !data.age || !data.symptoms || !data.submitted_by) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const report = await reportService.createReport(data)
      return NextResponse.json(report, { status: 201 })
    } catch (error) {
      console.error("Error creating report:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  async getReports(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const filters = {
        status: searchParams.get("status") || undefined,
        location: searchParams.get("location") || undefined,
        dateFrom: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined,
        dateTo: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
      }

      const reports = await reportService.getReports(filters)
      return NextResponse.json(reports)
    } catch (error) {
      console.error("Error fetching reports:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  async getReportById(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const report = await reportService.getReportById(params.id)
      if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 })
      }
      return NextResponse.json(report)
    } catch (error) {
      console.error("Error fetching report:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  async updateReport(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const data: ReportUpdateInput = await request.json()
      const report = await reportService.updateReport(params.id, data)

      if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 })
      }

      return NextResponse.json(report)
    } catch (error) {
      console.error("Error updating report:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  async deleteReport(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const success = await reportService.deleteReport(params.id)
      if (!success) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 })
      }
      return NextResponse.json({ message: "Report deleted successfully" })
    } catch (error) {
      console.error("Error deleting report:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  async getReportStats(request: NextRequest): Promise<NextResponse> {
    try {
      const stats = await reportService.getReportStats()
      return NextResponse.json(stats)
    } catch (error) {
      console.error("Error fetching report stats:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}

export const reportController = new ReportController()
