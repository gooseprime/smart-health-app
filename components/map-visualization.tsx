"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, AlertTriangle, Droplets, Activity } from "lucide-react"

interface VillageData {
  name: string
  lat: number
  lng: number
  severity: "low" | "medium" | "high" | "critical"
  reportCount: number
  lastReport: string
  waterQuality: "low" | "medium" | "high"
  symptoms: string[]
}

// Mock coordinates for villages with enhanced data
const villageData: VillageData[] = [
  {
    name: "Riverside Village",
    lat: 26.1445,
    lng: 91.7362,
    severity: "high",
    reportCount: 8,
    lastReport: "2 hours ago",
    waterQuality: "high",
    symptoms: ["Diarrhea", "Fever", "Nausea"]
  },
  {
    name: "Mountain View",
    lat: 26.1545,
    lng: 91.7462,
    severity: "critical",
    reportCount: 12,
    lastReport: "1 hour ago",
    waterQuality: "high",
    symptoms: ["Vomiting", "Abdominal Pain", "Fever"]
  },
  {
    name: "Green Valley",
    lat: 26.1345,
    lng: 91.7262,
    severity: "low",
    reportCount: 3,
    lastReport: "1 day ago",
    waterQuality: "low",
    symptoms: ["Jaundice", "Fatigue"]
  },
  {
    name: "Sunset Hills",
    lat: 26.1645,
    lng: 91.7562,
    severity: "medium",
    reportCount: 5,
    lastReport: "6 hours ago",
    waterQuality: "medium",
    symptoms: ["Fever", "Headache"]
  },
  {
    name: "Pine Grove",
    lat: 26.1245,
    lng: 91.7162,
    severity: "low",
    reportCount: 2,
    lastReport: "2 days ago",
    waterQuality: "low",
    symptoms: ["Cough"]
  },
  {
    name: "Cedar Creek",
    lat: 26.1745,
    lng: 91.7662,
    severity: "high",
    reportCount: 7,
    lastReport: "4 hours ago",
    waterQuality: "high",
    symptoms: ["Diarrhea", "Vomiting"]
  },
  {
    name: "Maple Heights",
    lat: 26.1145,
    lng: 91.7062,
    severity: "medium",
    reportCount: 4,
    lastReport: "8 hours ago",
    waterQuality: "medium",
    symptoms: ["Fever", "Nausea"]
  },
  {
    name: "Oak Ridge",
    lat: 26.1845,
    lng: 91.7762,
    severity: "low",
    reportCount: 1,
    lastReport: "3 days ago",
    waterQuality: "low",
    symptoms: ["Fatigue"]
  }
]

export function MapVisualization() {
  const [selectedVillage, setSelectedVillage] = useState<VillageData | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 26.1445, lng: 91.7362 })
  const [zoom, setZoom] = useState(12)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "default"
      default:
        return "outline"
    }
  }

  const getWaterQualityColor = (quality: string) => {
    switch (quality) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const handleVillageClick = (village: VillageData) => {
    setSelectedVillage(village)
    setMapCenter({ lat: village.lat, lng: village.lng })
    setZoom(15)
  }

  const severityStats = villageData.reduce((acc, village) => {
    acc[village.severity] = (acc[village.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Village Health Map</h2>
          <p className="text-muted-foreground">Monitor village health status and water quality</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Severity Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">Critical</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{severityStats.critical || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">High</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{severityStats.high || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">Medium</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{severityStats.medium || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Low</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{severityStats.low || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Village Health Status Map</CardTitle>
              <CardDescription>Click on villages to view detailed information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 h-96 flex items-center justify-center">
                {/* Simulated Map */}
                <div className="absolute inset-4 bg-white rounded-lg shadow-inner">
                  <div className="relative w-full h-full">
                    {/* Village Markers */}
                    {villageData.map((village, index) => (
                      <button
                        key={village.name}
                        onClick={() => handleVillageClick(village)}
                        className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-125 ${getSeverityColor(village.severity)}`}
                        style={{
                          left: `${20 + (index % 4) * 20}%`,
                          top: `${20 + Math.floor(index / 4) * 30}%`,
                        }}
                        title={village.name}
                      >
                        <MapPin className="w-3 h-3 text-white mx-auto mt-0.5" />
                      </button>
                    ))}
                    
                    {/* Map Legend */}
                    <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                      <h4 className="text-sm font-semibold mb-2">Legend</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Critical</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>High</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Medium</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Low</span>
                        </div>
                      </div>
                    </div>

                    {/* Coordinates Display */}
                    <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg text-xs">
                      <div>Lat: {mapCenter.lat.toFixed(4)}</div>
                      <div>Lng: {mapCenter.lng.toFixed(4)}</div>
                      <div>Zoom: {zoom}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Village Details Panel */}
        <div className="space-y-4">
          {selectedVillage ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>{selectedVillage.name}</span>
                </CardTitle>
                <CardDescription>Village health details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Severity Level</span>
                  <Badge variant={getSeverityBadgeColor(selectedVillage.severity)}>
                    {selectedVillage.severity.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Reports</span>
                  <span className="text-sm font-semibold">{selectedVillage.reportCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Report</span>
                  <span className="text-sm text-muted-foreground">{selectedVillage.lastReport}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Water Quality</span>
                  <span className={`text-sm font-semibold ${getWaterQualityColor(selectedVillage.waterQuality)}`}>
                    {selectedVillage.waterQuality.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium">Common Symptoms</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedVillage.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  View Detailed Reports
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Village</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any village marker on the map to view detailed health information.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="w-4 h-4 mr-2" />
                View All Alerts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Droplets className="w-4 h-4 mr-2" />
                Water Quality Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
