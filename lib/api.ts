/**
 * API Client for Smart Health Monitor
 * 
 * This module provides API endpoints that connect to the backend services.
 * Handles authentication, data fetching, and error management.
 */

import { Report, AlertRule, VillageSettings } from './data-layer'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const isDevelopment = process.env.NODE_ENV === 'development'

// Authentication token management
let authToken: string | null = null

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return authToken
}

// Set auth token
const setAuthToken = (token: string | null): void => {
  authToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }
  }
}

// HTTP request helper
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken()
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    const response = await makeRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    setAuthToken(response.token)
    return response
  }

  async register(userData: {
    name: string
    email: string
    password: string
    role?: string
    village?: string
    phone?: string
  }): Promise<{ user: any; token: string }> {
    const response = await makeRequest<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    
    setAuthToken(response.token)
    return response
  }

  async logout(): Promise<void> {
    try {
      await makeRequest('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('Logout request failed:', error)
    } finally {
      setAuthToken(null)
    }
  }

  async getCurrentUser(): Promise<any> {
    return makeRequest<any>('/auth/me')
  }

  async refreshToken(): Promise<{ token: string }> {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No token to refresh')
    }
    
    const response = await makeRequest<{ token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
    
    setAuthToken(response.token)
    return response
  }

  // Reports endpoints
  async getReports(filters?: {
    status?: string
    severity?: string
    village?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }): Promise<{ reports: Report[]; pagination: any }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const endpoint = queryString ? `/reports?${queryString}` : '/reports'
    
    return makeRequest<{ reports: Report[]; pagination: any }>(endpoint)
  }

  async createReport(reportData: Partial<Report>): Promise<Report> {
    return makeRequest<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    })
  }

  async updateReport(id: string, reportData: Partial<Report>): Promise<Report> {
    return makeRequest<Report>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData)
    })
  }

  async deleteReport(id: string): Promise<void> {
    return makeRequest<void>(`/reports/${id}`, {
      method: 'DELETE'
    })
  }

  async getReportById(id: string): Promise<Report> {
    return makeRequest<Report>(`/reports/${id}`)
  }

  async getReportStats(): Promise<any> {
    return makeRequest<any>('/reports/stats')
  }

  async exportReports(format: 'csv' | 'json' = 'csv', filters?: any): Promise<any> {
    const params = new URLSearchParams({ format, ...filters })
    return makeRequest<any>(`/reports/export?${params.toString()}`)
  }

  // Alerts endpoints
  async getAlerts(filters?: {
    type?: string
    severity?: string
    village?: string
    acknowledged?: boolean
    resolved?: boolean
    page?: number
    limit?: number
  }): Promise<{ alerts: any[]; pagination: any }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const endpoint = queryString ? `/alerts?${queryString}` : '/alerts'
    
    return makeRequest<{ alerts: any[]; pagination: any }>(endpoint)
  }

  async getAlertById(id: string): Promise<any> {
    return makeRequest<any>(`/alerts/${id}`)
  }

  async acknowledgeAlert(id: string): Promise<void> {
    return makeRequest<void>(`/alerts/${id}/acknowledge`, {
      method: 'POST'
    })
  }

  async resolveAlert(id: string, resolutionNotes?: string): Promise<void> {
    return makeRequest<void>(`/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNotes })
    })
  }

  async deleteAlert(id: string): Promise<void> {
    return makeRequest<void>(`/alerts/${id}`, {
      method: 'DELETE'
    })
  }

  async getAlertStats(): Promise<any> {
    return makeRequest<any>('/alerts/stats')
  }

  async exportAlerts(format: 'csv' | 'json' = 'csv'): Promise<any> {
    return makeRequest<any>(`/alerts/export?format=${format}`)
  }

  // Alert Rules endpoints
  async getAlertRules(): Promise<AlertRule[]> {
    return makeRequest<AlertRule[]>('/admin/alert-rules')
  }

  async createAlertRule(ruleData: Partial<AlertRule>): Promise<AlertRule> {
    return makeRequest<AlertRule>('/admin/alert-rules', {
      method: 'POST',
      body: JSON.stringify(ruleData)
    })
  }

  async updateAlertRule(id: string, ruleData: Partial<AlertRule>): Promise<AlertRule> {
    return makeRequest<AlertRule>(`/admin/alert-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ruleData)
    })
  }

  async deleteAlertRule(id: string): Promise<void> {
    return makeRequest<void>(`/admin/alert-rules/${id}`, {
      method: 'DELETE'
    })
  }

  // Village Settings endpoints
  async getVillageSettings(): Promise<VillageSettings[]> {
    return makeRequest<VillageSettings[]>('/admin/village-settings')
  }

  async getVillageSetting(id: string): Promise<VillageSettings> {
    return makeRequest<VillageSettings>(`/admin/village-settings/${id}`)
  }

  async createVillageSettings(settingsData: Partial<VillageSettings>): Promise<VillageSettings> {
    return makeRequest<VillageSettings>('/admin/village-settings', {
      method: 'POST',
      body: JSON.stringify(settingsData)
    })
  }

  async updateVillageSettings(id: string, settingsData: Partial<VillageSettings>): Promise<VillageSettings> {
    return makeRequest<VillageSettings>(`/admin/village-settings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    })
  }

  async deleteVillageSettings(id: string): Promise<void> {
    return makeRequest<void>(`/admin/village-settings/${id}`, {
      method: 'DELETE'
    })
  }

  // System Settings endpoints
  async getSystemSettings(): Promise<any> {
    return makeRequest<any>('/admin/system-settings')
  }

  async updateSystemSettings(settings: any): Promise<any> {
    return makeRequest<any>('/admin/system-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  // Analytics endpoints
  async getAnalyticsOverview(): Promise<any> {
    return makeRequest<any>('/admin/analytics/overview')
  }

  async getReportAnalytics(): Promise<any> {
    return makeRequest<any>('/admin/analytics/reports')
  }

  async getAlertAnalytics(): Promise<any> {
    return makeRequest<any>('/admin/analytics/alerts')
  }

  async getVillageAnalytics(): Promise<any> {
    return makeRequest<any>('/admin/analytics/villages')
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return makeRequest<{ status: string; timestamp: string }>('/health')
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient()

// Export for backward compatibility
export default apiClient