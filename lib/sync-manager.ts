"use client"

import { offlineStorage } from "./offline-storage"

interface SyncStatus {
  isOnline: boolean
  lastSync: Date | null
  pendingReports: number
  syncInProgress: boolean
}

class SyncManager {
  private listeners: ((status: SyncStatus) => void)[] = []
  private status: SyncStatus = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastSync: null,
    pendingReports: 0,
    syncInProgress: false,
  }

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline.bind(this))
      window.addEventListener("offline", this.handleOffline.bind(this))

      // Check for pending reports on initialization
      this.updatePendingCount()

      // Auto-sync when coming online
      if (this.status.isOnline) {
        setTimeout(() => this.syncPendingReports(), 1000)
      }
    }
  }

  private handleOnline() {
    this.status.isOnline = true
    this.notifyListeners()
    this.syncPendingReports()
  }

  private handleOffline() {
    this.status.isOnline = false
    this.notifyListeners()
  }

  private async updatePendingCount() {
    try {
      const unsyncedReports = await offlineStorage.getUnsyncedReports()
      this.status.pendingReports = unsyncedReports.length
      this.notifyListeners()
    } catch (error) {
      console.error("Failed to update pending count:", error)
    }
  }

  async saveReportOffline(reportData: any): Promise<string> {
    try {
      const reportId = await offlineStorage.saveReport(reportData)
      await this.updatePendingCount()

      // Try to sync immediately if online
      if (this.status.isOnline) {
        setTimeout(() => this.syncPendingReports(), 500)
      }

      return reportId
    } catch (error) {
      console.error("Failed to save report offline:", error)
      throw error
    }
  }

  async syncPendingReports(): Promise<void> {
    if (this.status.syncInProgress || !this.status.isOnline) {
      return
    }

    this.status.syncInProgress = true
    this.notifyListeners()

    try {
      const unsyncedReports = await offlineStorage.getUnsyncedReports()

      for (const report of unsyncedReports) {
        try {
          // Simulate API call - in real app, this would be actual API endpoint
          await this.syncReportToServer(report)
          await offlineStorage.markReportSynced(report.id)

          // Also save to localStorage for immediate UI updates
          const existingReports = JSON.parse(localStorage.getItem("health-reports") || "[]")
          const syncedReport = {
            ...report.data,
            id: report.id,
            submittedAt: new Date(report.timestamp).toISOString(),
            status: "synced",
          }
          existingReports.push(syncedReport)
          localStorage.setItem("health-reports", JSON.stringify(existingReports))
        } catch (error) {
          console.error(`Failed to sync report ${report.id}:`, error)
          // Continue with other reports even if one fails
        }
      }

      this.status.lastSync = new Date()
      await this.updatePendingCount()
    } catch (error) {
      console.error("Sync process failed:", error)
    } finally {
      this.status.syncInProgress = false
      this.notifyListeners()
    }
  }

  private async syncReportToServer(report: any): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simulate occasional network failures
    if (Math.random() < 0.1) {
      throw new Error("Network error during sync")
    }

    // In a real app, this would be:
    // const response = await fetch('/api/reports', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report.data)
    // })
    // if (!response.ok) throw new Error('Sync failed')
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener)
    listener(this.status) // Send current status immediately

    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.status))
  }

  getStatus(): SyncStatus {
    return { ...this.status }
  }

  async forcSync(): Promise<void> {
    await this.syncPendingReports()
  }
}

export const syncManager = new SyncManager()
