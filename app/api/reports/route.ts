// API route handlers using the backend structure
import type { NextRequest } from "next/server"
import { reportController } from "../../../backend/controllers/ReportController"

export async function GET(request: NextRequest) {
  return reportController.getReports(request)
}

export async function POST(request: NextRequest) {
  return reportController.createReport(request)
}
