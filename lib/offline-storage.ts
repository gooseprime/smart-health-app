"use client"

interface OfflineReport {
  id: string
  data: any
  timestamp: number
  synced: "pending" | "synced" // Changed from boolean to string for IndexedDB compatibility
}

class OfflineStorage {
  private dbName = "smart-health-db"
  private version = 2 // Increment version to trigger database upgrade
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Delete old stores if they exist to recreate with new schema
        if (db.objectStoreNames.contains("reports")) {
          db.deleteObjectStore("reports")
        }
        if (db.objectStoreNames.contains("syncQueue")) {
          db.deleteObjectStore("syncQueue")
        }

        // Create reports store with new schema
        const reportsStore = db.createObjectStore("reports", { keyPath: "id" })
        reportsStore.createIndex("synced", "synced", { unique: false })
        reportsStore.createIndex("timestamp", "timestamp", { unique: false })

        // Create sync queue store
        const syncStore = db.createObjectStore("syncQueue", { keyPath: "id" })
        syncStore.createIndex("timestamp", "timestamp", { unique: false })
      }
    })
  }

  async saveReport(reportData: any): Promise<string> {
    if (!this.db) await this.init()

    const report: OfflineReport = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: reportData,
      timestamp: Date.now(),
      synced: "pending", // Use string instead of boolean
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["reports"], "readwrite")
      const store = transaction.objectStore("reports")
      const request = store.add(report)

      request.onsuccess = () => resolve(report.id)
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedReports(): Promise<OfflineReport[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["reports"], "readonly")
      const store = transaction.objectStore("reports")
      const index = store.index("synced")
      const request = index.getAll(IDBKeyRange.only("pending")) // Use string value

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markReportSynced(reportId: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["reports"], "readwrite")
      const store = transaction.objectStore("reports")
      const getRequest = store.get(reportId)

      getRequest.onsuccess = () => {
        const report = getRequest.result
        if (report) {
          report.synced = "synced" // Use string instead of boolean
          const updateRequest = store.put(report)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async getAllReports(): Promise<OfflineReport[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["reports"], "readonly")
      const store = transaction.objectStore("reports")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async clearSyncedReports(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["reports"], "readwrite")
      const store = transaction.objectStore("reports")
      const index = store.index("synced")
      const request = index.openCursor(IDBKeyRange.only("synced")) // Use string value

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineStorage = new OfflineStorage()
