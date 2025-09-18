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

  // Authentication endpoints
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    // Mock authentication
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
  }

  async logout(): Promise<void> {
    mockAuthToken = null
    await delay(200)
  }

  async getCurrentUser(): Promise<any> {
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

  // Reports endpoints
  async getReports(): Promise<Report[]> {
    return this.request<Report[]>('/reports')
  }

  async getReport(id: string): Promise<Report> {
    return this.request<Report>(`/reports/${id}`)
  }

  async createReport(report: Omit<Report, 'id' | 'submittedAt' | 'status'>): Promise<Report> {
    const newReport: Report = {
      ...report,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    }
    
    return this.request<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(newReport)
    })
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    return this.request<Report>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async deleteReport(id: string): Promise<void> {
    return this.request<void>(`/reports/${id}`, {
      method: 'DELETE'
    })
  }

  async exportReports(format: 'csv' | 'excel'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/reports/export?format=${format}`, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    })
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }
    
    return response.blob()
  }

  // Statistics endpoints
  async getStatistics(): Promise<{
    totalReports: number
    recentReports: number
    uniqueVillages: number
    highRiskReports: number
    waterQualityPercentage: number
  }> {
    return this.request('/statistics')
  }

  async getReportStats(): Promise<{
    reportsByVillage: Record<string, number>
    reportsByDate: Array<{ date: string; count: number }>
    symptomFrequency: Record<string, number>
    waterQualityDistribution: Record<string, number>
  }> {
    return this.request('/reports/stats')
  }

  // Alert Rules endpoints
  async getAlertRules(): Promise<AlertRule[]> {
    return this.request<AlertRule[]>('/alert-rules')
  }

  async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    const newRule: AlertRule = {
      ...rule,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
    
    return this.request<AlertRule>('/alert-rules', {
      method: 'POST',
      body: JSON.stringify(newRule)
    })
  }

  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    return this.request<AlertRule>(`/alert-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async deleteAlertRule(id: string): Promise<void> {
    return this.request<void>(`/alert-rules/${id}`, {
      method: 'DELETE'
    })
  }

  // Village Settings endpoints
  async getVillageSettings(): Promise<VillageSettings[]> {
    return this.request<VillageSettings[]>('/village-settings')
  }

  async updateVillageSettings(settings: VillageSettings[]): Promise<VillageSettings[]> {
    return this.request<VillageSettings[]>('/village-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  async getVillageSetting(villageName: string): Promise<VillageSettings> {
    return this.request<VillageSettings>(`/village-settings/${encodeURIComponent(villageName)}`)
  }

  // Alerts endpoints
  async getAlerts(): Promise<any[]> {
    return this.request('/alerts')
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    return this.request(`/alerts/${alertId}/acknowledge`, {
      method: 'POST'
    })
  }

  async resolveAlert(alertId: string): Promise<void> {
    return this.request(`/alerts/${alertId}/resolve`, {
      method: 'POST'
    })
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health')
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

// Create a default API client instance
export const apiClient = new ApiClient()

// Export types for use in other modules
export type { Report, AlertRule, VillageSettings }
