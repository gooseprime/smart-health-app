"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Droplets, Activity, MapPin, Bell } from "lucide-react"
import { alertGenerator, type HealthReport, type GeneratedAlert } from "@/lib/alert-generator"

// Sample health reports for demonstration
const sampleReports: HealthReport[] = [
  {
    id: "1",
    patientName: "John Doe",
    age: 25,
    village: "Riverside Village",
    symptoms: ["Diarrhea", "Fever"],
    waterTurbidity: "high",
    waterPH: "6.2",
    waterContamination: "high",
    notes: "Patient reports severe diarrhea and fever",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    submittedBy: "health_worker_1",
    severity: "high"
  },
  {
    id: "2",
    patientName: "Jane Smith",
    age: 30,
    village: "Riverside Village",
    symptoms: ["Diarrhea", "Vomiting"],
    waterTurbidity: "high",
    waterPH: "6.1",
    waterContamination: "high",
    notes: "Similar symptoms to previous case",
    submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    submittedBy: "health_worker_1",
    severity: "high"
  },
  {
    id: "3",
    patientName: "Bob Johnson",
    age: 45,
    village: "Riverside Village",
    symptoms: ["Diarrhea", "Abdominal Pain"],
    waterTurbidity: "high",
    waterPH: "6.0",
    waterContamination: "severe",
    notes: "Severe diarrhea, suspect water contamination",
    submittedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    submittedBy: "health_worker_2",
    severity: "critical"
  },
  {
    id: "4",
    patientName: "Alice Brown",
    age: 28,
    village: "Mountain View",
    symptoms: ["Fever", "Headache"],
    waterTurbidity: "low",
    waterPH: "7.2",
    waterContamination: "low",
    notes: "Mild fever, no water issues",
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    submittedBy: "health_worker_3",
    severity: "low"
  },
  {
    id: "5",
    patientName: "Charlie Wilson",
    age: 35,
    village: "Mountain View",
    symptoms: ["Fever", "Fatigue"],
    waterTurbidity: "low",
    waterPH: "7.1",
    waterContamination: "low",
    notes: "Fever with fatigue",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    submittedBy: "health_worker_3",
    severity: "medium"
  }
]

export function AlertDemo() {
  const [reports, setReports] = useState<HealthReport[]>(sampleReports)
  const [alerts, setAlerts] = useState<GeneratedAlert[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateAlerts = async () => {
    setIsGenerating(true)
    try {
      const generatedAlerts = await alertGenerator.generateAlertsFromReports(reports)
      setAlerts(generatedAlerts)
      console.log("Generated alerts:", generatedAlerts)
    } catch (error) {
      console.error("Error generating alerts:", error)
    }
    setIsGenerating(false)
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "water_contamination":
        return <Droplets className="w-4 h-4" />
      case "disease_outbreak":
        return <AlertTriangle className="w-4 h-4" />
      case "water_shortage":
        return <Droplets className="w-4 h-4" />
      case "infrastructure":
        return <MapPin className="w-4 h-4" />
      case "system":
        return <Activity className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
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
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  useEffect(() => {
    generateAlerts()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Alert Generation Demo</span>
          </CardTitle>
          <CardDescription>
            This demo shows how alerts are automatically generated from health worker reports.
            The system analyzes patterns in symptoms, water quality, and severity to detect potential health issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-medium mb-2">Health Reports ({reports.length})</h3>
              <div className="space-y-2">
                {reports.map((report) => (
                  <div key={report.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{report.patientName}</div>
                    <div className="text-gray-600">
                      {report.village} • {report.symptoms.join(", ")}
                    </div>
                    <div className="text-xs text-gray-500">
                      Water: {report.waterContamination} • pH: {report.waterPH}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Generated Alerts ({alerts.length})</h3>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded border-l-4 ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {getAlertTypeIcon(alert.type)}
                      <span className="font-medium">{alert.title}</span>
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">{alert.message}</div>
                    <div className="text-xs text-gray-500">
                      {alert.village} • {alert.affectedCount} affected • {alert.reportIds.length} reports
                    </div>
                    {alert.data?.recommendations && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-blue-900">Recommendations:</div>
                        <ul className="text-xs text-blue-800 space-y-1">
                          {alert.data.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Button onClick={generateAlerts} disabled={isGenerating} className="w-full">
            {isGenerating ? "Generating Alerts..." : "Regenerate Alerts"}
          </Button>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How It Works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Diarrhea Outbreak:</strong> 3+ diarrhea cases in a village within 24 hours</li>
              <li>• <strong>Water Contamination:</strong> 2+ high contamination reports within 48 hours</li>
              <li>• <strong>Fever Cluster:</strong> 4+ fever cases within 12 hours</li>
              <li>• <strong>Abnormal pH:</strong> 2+ reports of pH outside 6.5-8.5 range</li>
              <li>• <strong>Severe Symptoms:</strong> 2+ critical/high severity cases within 6 hours</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
