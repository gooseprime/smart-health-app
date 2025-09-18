"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Bell, CheckCircle, Clock, MapPin, TrendingUp, Users, Zap } from "lucide-react"

interface AlertRule {
  id: string
  name: string
  description: string
  condition: string
  threshold: number
  severity: "low" | "medium" | "high" | "critical"
  isActive: boolean
}

interface HealthAlert {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  village: string
  affectedCount: number
  createdAt: string
  status: "active" | "acknowledged" | "resolved"
  ruleId: string
  data: any
}

const defaultAlertRules: AlertRule[] = [
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
  },
  {
    id: "fever-cluster",
    name: "Fever Cluster",
    description: "More than 3 fever cases in a village within 3 days",
    condition: "symptom_count",
    threshold: 3,
    severity: "medium",
    isActive: true,
  },
  {
    id: "jaundice-alert",
    name: "Jaundice Cases",
    description: "Any jaundice cases reported",
    condition: "symptom_presence",
    threshold: 1,
    severity: "high",
    isActive: true,
  },
]

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>(defaultAlertRules)
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    // Load reports and generate alerts
    const storedReports = JSON.parse(localStorage.getItem("health-reports") || "[]")
    setReports(storedReports)
    generateAlerts(storedReports)
  }, [])

  const generateAlerts = (reportData: any[]) => {
    const newAlerts: HealthAlert[] = []

    // Group reports by village
    const villageReports = reportData.reduce((acc, report) => {
      if (!acc[report.village]) acc[report.village] = []
      acc[report.village].push(report)
      return acc
    }, {})

    Object.entries(villageReports).forEach(([village, villageReportList]: [string, any]) => {
      const recentReports = villageReportList.filter(
        (report: any) => new Date(report.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      )

      // Check for diarrhea outbreak
      const diarrheaCases = recentReports.filter((report: any) => report.symptoms.includes("Diarrhea"))
      if (diarrheaCases.length >= 5) {
        newAlerts.push({
          id: `outbreak-${village}-${Date.now()}`,
          title: "Diarrhea Outbreak Alert",
          description: `${diarrheaCases.length} diarrhea cases reported in ${village} within the last 7 days`,
          severity: "high",
          village,
          affectedCount: diarrheaCases.length,
          createdAt: new Date().toISOString(),
          status: "active",
          ruleId: "outbreak-diarrhea",
          data: { cases: diarrheaCases.length, symptom: "Diarrhea" },
        })
      }

      // Check for fever cluster
      const feverCases = recentReports
        .filter((report: any) => report.symptoms.includes("Fever"))
        .filter((report: any) => new Date(report.submittedAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
      if (feverCases.length >= 3) {
        newAlerts.push({
          id: `fever-${village}-${Date.now()}`,
          title: "Fever Cluster Detected",
          description: `${feverCases.length} fever cases reported in ${village} within the last 3 days`,
          severity: "medium",
          village,
          affectedCount: feverCases.length,
          createdAt: new Date().toISOString(),
          status: "active",
          ruleId: "fever-cluster",
          data: { cases: feverCases.length, symptom: "Fever" },
        })
      }

      // Check for jaundice cases
      const jaundiceCases = recentReports.filter((report: any) => report.symptoms.includes("Jaundice"))
      if (jaundiceCases.length > 0) {
        newAlerts.push({
          id: `jaundice-${village}-${Date.now()}`,
          title: "Jaundice Cases Reported",
          description: `${jaundiceCases.length} jaundice case(s) reported in ${village}`,
          severity: "high",
          village,
          affectedCount: jaundiceCases.length,
          createdAt: new Date().toISOString(),
          status: "active",
          ruleId: "jaundice-alert",
          data: { cases: jaundiceCases.length, symptom: "Jaundice" },
        })
      }

      // Check for high water contamination
      const highContaminationReports = recentReports.filter((report: any) => report.waterContamination === "high")
      if (highContaminationReports.length > 0) {
        newAlerts.push({
          id: `water-${village}-${Date.now()}`,
          title: "High Water Contamination",
          description: `High water contamination detected in ${village}`,
          severity: "critical",
          village,
          affectedCount: highContaminationReports.length,
          createdAt: new Date().toISOString(),
          status: "active",
          ruleId: "water-contamination",
          data: { reports: highContaminationReports.length },
        })
      }
    })

    setAlerts(newAlerts)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Zap className="w-4 h-4" />
      case "high":
        return <AlertTriangle className="w-4 h-4" />
      case "medium":
        return <TrendingUp className="w-4 h-4" />
      case "low":
        return <Bell className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status: "acknowledged" } : alert)))
  }

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status: "resolved" } : alert)))
  }

  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const acknowledgedAlerts = alerts.filter((alert) => alert.status === "acknowledged")
  const resolvedAlerts = alerts.filter((alert) => alert.status === "resolved")

  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === "critical").length
  const highAlerts = activeAlerts.filter((alert) => alert.severity === "high").length
  const totalAffected = activeAlerts.reduce((sum, alert) => sum + alert.affectedCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Health Alerts</h1>
          <p className="text-muted-foreground">Monitor and respond to health emergencies</p>
        </div>
        <Button
          onClick={() => generateAlerts(reports)}
          variant="outline"
          className="transition-all duration-200 hover:scale-105"
        >
          <Bell className="w-4 h-4 mr-2" />
          Refresh Alerts
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Zap className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Highest priority</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People Affected</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalAffected}</div>
            <p className="text-xs text-muted-foreground">Across all active alerts</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {alerts.length > 0
                ? Math.round(((acknowledgedAlerts.length + resolvedAlerts.length) / alerts.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Alerts addressed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="relative">
            Active
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-green-700">No Active Alerts</h3>
                  <p className="text-muted-foreground">All health indicators are within normal ranges.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeAlerts
                .sort((a, b) => {
                  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
                  return severityOrder[b.severity] - severityOrder[a.severity]
                })
                .map((alert) => (
                  <Card
                    key={alert.id}
                    className={`border-l-4 ${getSeverityColor(alert.severity)} transition-all duration-200 hover:shadow-lg`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getSeverityIcon(alert.severity)}
                            <CardTitle className="text-lg">{alert.title}</CardTitle>
                            <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">{alert.description}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="transition-all duration-200 hover:scale-105"
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                            className="transition-all duration-200 hover:scale-105"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>
                            <strong>Location:</strong> {alert.village}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>
                            <strong>Affected:</strong> {alert.affectedCount} people
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>
                            <strong>Created:</strong> {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="acknowledged" className="space-y-4">
          {acknowledgedAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No acknowledged alerts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {acknowledgedAlerts.map((alert) => (
                <Card key={alert.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <Badge variant="secondary">Acknowledged</Badge>
                        </div>
                        <CardDescription>{alert.description}</CardDescription>
                      </div>
                      <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No resolved alerts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resolvedAlerts.map((alert) => (
                <Card key={alert.id} className="opacity-50">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Resolved
                      </Badge>
                    </div>
                    <CardDescription>{alert.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Rules Configuration</CardTitle>
              <CardDescription>Manage automated alert triggers and thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                    <p className="text-xs text-muted-foreground">Threshold: {rule.threshold}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setAlertRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r)))
                    }
                  >
                    {rule.isActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
