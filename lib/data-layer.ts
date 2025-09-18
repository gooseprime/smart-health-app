/**
 * Data Layer Abstraction
 * 
 * This module provides a flexible data layer that can work with localStorage
 * for offline functionality and can be easily swapped to use a backend API
 * when available.
 */

export interface Report {
  id: string
  patientName: string
  age: string
  village: string
  symptoms: string[]
  waterTurbidity: string
  waterPH: string
  waterContamination: string
  notes: string
  submittedBy: string
  submittedAt: string
  status: string
}

export interface AlertRule {
  id: string
  name: string
  description: string
  condition: string
  threshold: number
  severity: "low" | "medium" | "high" | "critical"
  isActive: boolean
}

export interface VillageSettings {
  name: string
  severity: "low" | "medium" | "high" | "critical"
  customThresholds: {
    outbreakThreshold: number
    waterQualityThreshold: number
    alertFrequency: number
  }
  isCustomized: boolean
}

export interface DataLayerConfig {
  useBackend: boolean
  apiBaseUrl?: string
  apiKey?: string
  offlineMode: boolean
}

class DataLayer {
  private config: DataLayerConfig
  private cache: Map<string, any> = new Map()

  constructor(config: DataLayerConfig) {
    this.config = config
  }

  // Reports API
  async getReports(): Promise<Report[]> {
    if (this.config.useBackend && this.config.apiBaseUrl) {
      return this.fetchFromBackend('/api/reports')
    }
    return this.getFromLocalStorage('health-reports', [])
  }

  async saveReport(report: Omit<Report, 'id' | 'submittedAt' | 'status'>): Promise<Report> {
    const newReport: Report = {
      ...report,
      id: this.generateId(),
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    }

    if (this.config.useBackend && this.config.apiBaseUrl) {
      return this.postToBackend('/api/reports', newReport)
    }

    const reports = await this.getReports()
    reports.push(newReport)
    this.saveToLocalStorage('health-reports', reports)
    return newReport
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    if (this.config.useBackend && this.config.apiBaseUrl) {
      return this.putToBackend(`/api/reports/${id}`, updates)
    }

    const reports = await this.getReports()
    const index = reports.findIndex(r => r.id === id)
    if (index === -1) throw new Error('Report not found')
    
    reports[index] = { ...reports[index], ...updates }
    this.saveToLocalStorage('health-reports', reports)
    return reports[index]
  }

  async deleteReport(id: string): Promise<void> {
    if (this.config.useBackend && this.config.apiBaseUrl) {
      return this.deleteFromBackend(`/api/reports/${id}`)
    }

    const reports = await this.getReports()
    const filteredReports = reports.filter(r => r.id !== id)
    this.saveToLocalStorage('health-reports', filteredReports)
  }

  // Alert Rules API
  async getAlertRules(): Promise<AlertRule[]> {
    if (this.config.useBackend && this.config.apiBaseUrl) {
      return this.fetchFromBackend('/api/alert-rules')
    }
    return this.getFromLocalStorage('admin-alert-rules', [])
  }

  async saveAlertRules(rules: AlertRule[]): Promise<void> {
    if (this.config.useBackend && this.config.apiBaseUrl) {
      return this.postToBackend('/api/alert-rules', rules)
    }
    this.saveToLocalStorage('admin-alert-rules', rules)
  }

  // Village Settings API
  async getVillageSettings(): Promise<VillageSettings[]> {
    if (this.config.useBackend && this.config.apiBaseUrl) {
      return this.fetchFromBackend('/api/village-settings')
    }
    return this.getFromLocalStorage('admin-village-settings', [])
  }

  async saveVillageSettings(settings: VillageSettings[]): Promise<void> {
    if (this.config.useBackend && this.config.apiBaseUrl) {
      return this.postToBackend('/api/village-settings', settings)
    }
    this.saveToLocalStorage('admin-village-settings', settings)
  }

  // Statistics API
  async getStatistics(): Promise<{
    totalReports: number
    recentReports: number
    uniqueVillages: number
    highRiskReports: number
    waterQualityPercentage: number
  }> {
    if (this.config.useBackend && this.config.apiBaseUrl) {
      return this.fetchFromBackend('/api/statistics')
    }

    const reports = await this.getReports()
    const totalReports = reports.length
    const recentReports = reports.filter(
      (report) => new Date(report.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    const uniqueVillages = new Set(reports.map((report) => report.village)).size
    const highRiskReports = reports.filter((report) => report.waterContamination === "high").length
    const waterQualityPercentage = reports.length > 0
      ? Math.round((reports.filter((r) => r.waterContamination !== "high").length / reports.length) * 100)
      : 0

    return {
      totalReports,
      recentReports,
      uniqueVillages,
      highRiskReports,
      waterQualityPercentage
    }
  }

  // Export API
  async exportReports(format: 'csv' | 'excel'): Promise<Blob> {
    if (this.config.useBackend && this.config.apiBaseUrl) {
      const response = await fetch(`${this.config.apiBaseUrl}/api/reports/export?format=${format}`, {
        headers: this.getAuthHeaders()
      })
      return response.blob()
    }

    const reports = await this.getReports()
    return this.generateExportBlob(reports, format)
  }

  // Private helper methods
  private async fetchFromBackend<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, {
      headers: this.getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  private async postToBackend<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  private async putToBackend<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  private async deleteFromBackend(endpoint: string): Promise<void> {
    const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.statusText}`)
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }
    return headers
  }

  private getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage for key ${key}:`, error)
      return defaultValue
    }
  }

  private saveToLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving to localStorage for key ${key}:`, error)
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private generateExportBlob(reports: Report[], format: 'csv' | 'excel'): Blob {
    const headers = [
      'ID', 'Patient Name', 'Age', 'Village', 'Symptoms', 
      'Water Turbidity', 'Water pH', 'Water Contamination', 
      'Notes', 'Submitted By', 'Submitted At', 'Status'
    ]

    const csvData = reports.map(report => [
      report.id,
      report.patientName,
      report.age,
      report.village,
      report.symptoms.join('; '),
      report.waterTurbidity,
      report.waterPH,
      report.waterContamination,
      report.notes,
      report.submittedBy,
      new Date(report.submittedAt).toLocaleDateString(),
      report.status
    ])

    let content: string

    if (format === 'csv') {
      content = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
    } else {
      // Excel format with metadata
      const excelData = [
        ['Health Reports Export'],
        [`Generated on: ${new Date().toLocaleDateString()}`],
        [`Total Reports: ${reports.length}`],
        [''],
        headers,
        ...csvData
      ]

      content = excelData
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
    }

    return new Blob([content], { 
      type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
  }

  // Configuration methods
  updateConfig(newConfig: Partial<DataLayerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): DataLayerConfig {
    return { ...this.config }
  }

  // Cache management
  clearCache(): void {
    this.cache.clear()
  }

  setCacheItem(key: string, value: any): void {
    this.cache.set(key, value)
  }

  getCacheItem<T>(key: string): T | undefined {
    return this.cache.get(key)
  }
}

// Create and export a default instance
const defaultConfig: DataLayerConfig = {
  useBackend: false,
  offlineMode: true
}

export const dataLayer = new DataLayer(defaultConfig)

// Export the class for custom instances
export { DataLayer }
