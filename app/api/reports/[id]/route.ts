// API route handlers for individual reports
import type { NextRequest } from "next/server"
import { reportController } from "../../../../backend/controllers/ReportController"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return reportController.getReportById(request, { params })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return reportController.updateReport(request, { params })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return reportController.deleteReport(request, { params })
}
