"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Wifi, WifiOff, RefreshCw, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { syncManager } from "@/lib/sync-manager"

interface SyncStatus {
  isOnline: boolean
  lastSync: Date | null
  pendingReports: number
  syncInProgress: boolean
}

export function OfflineIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSync: null,
    pendingReports: 0,
    syncInProgress: false,
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setSyncStatus)
    return unsubscribe
  }, [])

  const handleForceSync = async () => {
    await syncManager.forcSync()
  }

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return "bg-red-100 text-red-800 border-red-200"
    if (syncStatus.pendingReports > 0) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return <WifiOff className="w-3 h-3" />
    if (syncStatus.syncInProgress) return <RefreshCw className="w-3 h-3 animate-spin" />
    if (syncStatus.pendingReports > 0) return <Clock className="w-3 h-3" />
    return <CheckCircle className="w-3 h-3" />
  }

  const getStatusText = () => {
    if (!syncStatus.isOnline) return "Offline"
    if (syncStatus.syncInProgress) return "Syncing..."
    if (syncStatus.pendingReports > 0) return `${syncStatus.pendingReports} pending`
    return "Online"
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="space-y-2">
        {/* Status Badge */}
        <Badge
          variant="outline"
          className={`${getStatusColor()} cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg`}
          onClick={() => setShowDetails(!showDetails)}
        >
          {getStatusIcon()}
          <span className="ml-1">{getStatusText()}</span>
        </Badge>

        {/* Detailed Status Card */}
        {showDetails && (
          <Card className="w-80 shadow-xl border-0 bg-white/95 backdrop-blur-sm animate-in slide-in-from-bottom-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm">
                {syncStatus.isOnline ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span>Connection Status</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {syncStatus.isOnline ? "Connected to server" : "Working offline"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                <Badge variant={syncStatus.isOnline ? "default" : "destructive"}>
                  {syncStatus.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>

              {/* Pending Reports */}
              {syncStatus.pendingReports > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending Reports</span>
                    <Badge variant="secondary">{syncStatus.pendingReports}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reports will sync automatically when connection is restored
                  </div>
                </div>
              )}

              {/* Sync Progress */}
              {syncStatus.syncInProgress && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm font-medium">Syncing data...</span>
                  </div>
                  <Progress value={undefined} className="h-1" />
                </div>
              )}

              {/* Last Sync */}
              {syncStatus.lastSync && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last sync</span>
                  <span>{syncStatus.lastSync.toLocaleTimeString()}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleForceSync}
                  disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
                  className="flex-1 transition-all duration-200 hover:scale-105 bg-transparent"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${syncStatus.syncInProgress ? "animate-spin" : ""}`} />
                  Sync Now
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </div>

              {/* Offline Mode Info */}
              {!syncStatus.isOnline && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Offline Mode Active</p>
                      <p>
                        You can continue submitting reports. They'll be saved locally and synced when you're back
                        online.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
