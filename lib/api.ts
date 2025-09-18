/**
 * Dummy API Endpoints
 * 
 * This module provides mock API endpoints that simulate backend functionality.
 * When the real backend is ready, these can be easily replaced with actual
 * HTTP calls to the backend services.
 */

import { Report, AlertRule, VillageSettings } from './data-layer'

// Mock data storage (in a real app, this would be a database)
let mockReports: Report[] = []
let mockAlertRules: AlertRule[] = []
let mockVillageSettings: VillageSettings[] = []

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock authentication token
let mockAuthToken: string | null = null

export class ApiClient {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string = '/api', apiKey?: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Simulate network delay
    await delay(500 + Math.random() * 1000)

    // Simulate occasional network errors
    if (Math.random() < 0.05) {
      throw new Error('Network error: Unable to connect to server')
    }

    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Authentication endpoints - using mock API for static export
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    return mockApi.login(email, password)
  }

  async logout(): Promise<void> {
    return mockApi.logout()
  }

  async getCurrentUser(): Promise<any> {
    return mockApi.getCurrentUser()
  }

  // Reports endpoints - using mock API for static export
  async getReports(): Promise<Report[]> {
    return mockApi.getReports()
  }

  async getReport(id: string): Promise<Report> {
    const reports = await mockApi.getReports()
    const report = reports.find(r => r.id === id)
    if (!report) throw new Error('Report not found')
    return report
  }

  async createReport(report: Omit<Report, 'id' | 'submittedAt' | 'status'>): Promise<Report> {
    return mockApi.createReport(report)
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    return mockApi.updateReport(id, updates)
  }

  async deleteReport(id: string): Promise<void> {
    return mockApi.deleteReport(id)
  }

  async exportReports(format: 'csv' | 'excel'): Promise<Blob> {
    // Mock export functionality for static export
    const reports = await mockApi.getReports()
    const csvContent = reports.map(report => 
      `${report.id},${report.patientName},${report.village},${report.symptoms.join(';')},${report.waterContamination}`
    ).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    return blob
  }

  // Statistics endpoints - using mock API for static export
  async getStatistics(): Promise<{
    totalReports: number
    recentReports: number
    uniqueVillages: number
    highRiskReports: number
    waterQualityPercentage: number
  }> {
    return mockApi.getStatistics()
  }

  async getReportStats(): Promise<{
    reportsByVillage: Record<string, number>
    reportsByDate: Array<{ date: string; count: number }>
    symptomFrequency: Record<string, number>
    waterQualityDistribution: Record<string, number>
  }> {
    // Mock implementation for report stats
    const reports = await mockApi.getReports()
    const reportsByVillage: Record<string, number> = {}
    const reportsByDate: Array<{ date: string; count: number }> = []
    const symptomFrequency: Record<string, number> = {}
    const waterQualityDistribution: Record<string, number> = {}

    reports.forEach(report => {
      // Count by village
      reportsByVillage[report.village] = (reportsByVillage[report.village] || 0) + 1
      
      // Count symptoms
      report.symptoms.forEach(symptom => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1
      })
      
      // Count water quality
      waterQualityDistribution[report.waterContamination] = (waterQualityDistribution[report.waterContamination] || 0) + 1
    })

    return {
      reportsByVillage,
      reportsByDate,
      symptomFrequency,
      waterQualityDistribution
    }
  }

  // Alert Rules endpoints - using mock API for static export
  async getAlertRules(): Promise<AlertRule[]> {
    return mockApi.getAlertRules()
  }

  async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    const newRule: AlertRule = {
      ...rule,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
    const rules = await mockApi.getAlertRules()
    rules.push(newRule)
    await mockApi.saveAlertRules(rules)
    return newRule
  }

  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    const rules = await mockApi.getAlertRules()
    const index = rules.findIndex(r => r.id === id)
    if (index === -1) throw new Error('Alert rule not found')
    rules[index] = { ...rules[index], ...updates }
    await mockApi.saveAlertRules(rules)
    return rules[index]
  }

  async deleteAlertRule(id: string): Promise<void> {
    const rules = await mockApi.getAlertRules()
    const filteredRules = rules.filter(r => r.id !== id)
    await mockApi.saveAlertRules(filteredRules)
  }

  // Village Settings endpoints - using mock API for static export
  async getVillageSettings(): Promise<VillageSettings[]> {
    return mockApi.getVillageSettings()
  }

  async updateVillageSettings(settings: VillageSettings[]): Promise<VillageSettings[]> {
    await mockApi.saveVillageSettings(settings)
    return settings
  }

  async getVillageSetting(villageName: string): Promise<VillageSettings> {
    const settings = await mockApi.getVillageSettings()
    const setting = settings.find(s => s.name === villageName)
    if (!setting) throw new Error('Village setting not found')
    return setting
  }

  // Alerts endpoints - using mock API for static export
  async getAlerts(): Promise<any[]> {
    // Mock alerts based on reports
    const reports = await mockApi.getReports()
    const alerts = []
    
    // Generate alerts based on high-risk reports
    const highRiskReports = reports.filter(r => r.waterContamination === 'high')
    highRiskReports.forEach(report => {
      alerts.push({
        id: `alert-${report.id}`,
        type: 'water_contamination',
        severity: 'high',
        message: `High water contamination detected in ${report.village}`,
        reportId: report.id,
        timestamp: report.submittedAt,
        acknowledged: false,
        resolved: false
      })
    })
    
    return alerts
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    // Mock acknowledgment - in a real app, this would update the alert status
    await delay(200)
  }

  async resolveAlert(alertId: string): Promise<void> {
    // Mock resolution - in a real app, this would update the alert status
    await delay(200)
  }

  // Health check endpoint - using mock API for static export
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  }
}

// Mock API implementation functions
export const mockApi = {
  // Reports
  async getReports(): Promise<Report[]> {
    await delay(300)
    return [...mockReports]
  },

  async createReport(report: Omit<Report, 'id' | 'submittedAt' | 'status'>): Promise<Report> {
    await delay(500)
    const newReport: Report = {
      ...report,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    }
    mockReports.push(newReport)
    return newReport
  },

  async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    await delay(400)
    const index = mockReports.findIndex(r => r.id === id)
    if (index === -1) throw new Error('Report not found')
    mockReports[index] = { ...mockReports[index], ...updates }
    return mockReports[index]
  },

  async deleteReport(id: string): Promise<void> {
    await delay(300)
    mockReports = mockReports.filter(r => r.id !== id)
  },

  // Statistics
  async getStatistics() {
    await delay(200)
    const totalReports = mockReports.length
    const recentReports = mockReports.filter(
      (report) => new Date(report.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    const uniqueVillages = new Set(mockReports.map((report) => report.village)).size
    const highRiskReports = mockReports.filter((report) => report.waterContamination === "high").length
    const waterQualityPercentage = mockReports.length > 0
      ? Math.round((mockReports.filter((r) => r.waterContamination !== "high").length / mockReports.length) * 100)
      : 0

    return {
      totalReports,
      recentReports,
      uniqueVillages,
      highRiskReports,
      waterQualityPercentage
    }
  },

  // Alert Rules
  async getAlertRules(): Promise<AlertRule[]> {
    await delay(200)
    return [...mockAlertRules]
  },

  async saveAlertRules(rules: AlertRule[]): Promise<void> {
    await delay(300)
    mockAlertRules = [...rules]
  },

  // Village Settings
  async getVillageSettings(): Promise<VillageSettings[]> {
    await delay(200)
    return [...mockVillageSettings]
  },

  async saveVillageSettings(settings: VillageSettings[]): Promise<void> {
    await delay(300)
    mockVillageSettings = [...settings]
  },

  // Authentication
  async login(email: string, password: string) {
    await delay(800)
    if (email === 'admin@health.gov' && password === 'admin123') {
      mockAuthToken = 'mock-jwt-token-' + Date.now()
      return {
        token: mockAuthToken,
        user: {
          id: '1',
          email: 'admin@health.gov',
          name: 'Health Administrator',
          role: 'admin'
        }
      }
    }
    throw new Error('Invalid credentials')
  },

  async logout() {
    await delay(200)
    mockAuthToken = null
  },

  async getCurrentUser() {
    await delay(100)
    if (!mockAuthToken) {
      throw new Error('Not authenticated')
    }
    return {
      id: '1',
      email: 'admin@health.gov',
      name: 'Health Administrator',
      role: 'admin'
    }
  }
}

// Initialize with some mock data
export const initializeMockData = () => {
  // Add some sample reports
  mockReports = [
    {
      id: "1",
      patientName: "John Doe",
      age: "35",
      village: "Riverside Village",
      symptoms: ["Diarrhea", "Fever", "Nausea"],
      waterTurbidity: "15.2",
      waterPH: "6.8",
      waterContamination: "medium",
      notes: "Patient reports symptoms started 3 days ago",
      submittedBy: "Health Worker",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "submitted",
    },
    {
      id: "2",
      patientName: "Jane Smith",
      age: "28",
      village: "Mountain View",
      symptoms: ["Vomiting", "Abdominal Pain"],
      waterTurbidity: "22.1",
      waterPH: "7.2",
      waterContamination: "high",
      notes: "Severe symptoms, referred to clinic",
      submittedBy: "Health Worker",
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "submitted",
    }
  ]

  // Add default alert rules
  mockAlertRules = [
    {
      id: "outbreak-diarrhea",
      name: "Diarrhea Outbreak",
      description: "More than 5 diarrhea cases in a village within 7 days",
      condition: "symptom_count",
      threshold: 5,
      severity: "high",
      isActive: true,
    },
    {
      id: "water-contamination",
      name: "High Water Contamination",
      description: "Water contamination level marked as high",
      condition: "water_quality",
      threshold: 1,
      severity: "critical",
      isActive: true,
    }
  ]

  // Add default village settings
  mockVillageSettings = [
    {
      name: "Riverside Village",
      severity: "high",
      customThresholds: {
        outbreakThreshold: 5,
        waterQualityThreshold: 1,
        alertFrequency: 24
      },
      isCustomized: false
    },
    {
      name: "Mountain View",
      severity: "critical",
      customThresholds: {
        outbreakThreshold: 3,
        waterQualityThreshold: 1,
        alertFrequency: 12
      },
      isCustomized: false
    }
  ]
}

// Initialize mock data
initializeMockData()

// Create a default API client instance
export const apiClient = new ApiClient()

// Export types for use in other modules
export type { Report, AlertRule, VillageSettings }
