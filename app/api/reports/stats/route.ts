// API route for report statistics
import type { NextRequest } from "next/server"
import { reportController } from "../../../../backend/controllers/ReportController"

export async function GET(request: NextRequest) {
  return reportController.getReportStats(request)
}
