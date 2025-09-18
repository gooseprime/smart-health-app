"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { MapPin, Droplets, AlertTriangle, Activity, FileText } from "lucide-react"

interface Report {
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

// Mock coordinates for villages
const villageCoordinates: Record<string, { lat: number; lng: number }> = {
  "Riverside Village": { lat: 26.1445, lng: 91.7362 },
  "Mountain View": { lat: 26.1545, lng: 91.7462 },
  "Green Valley": { lat: 26.1345, lng: 91.7262 },
  "Sunset Hills": { lat: 26.1645, lng: 91.7562 },
  "Pine Grove": { lat: 26.1245, lng: 91.7162 },
  "Cedar Creek": { lat: 26.1745, lng: 91.7662 },
  "Maple Heights": { lat: 26.1145, lng: 91.7062 },
  "Oak Ridge": { lat: 26.1845, lng: 91.7762 },
}

export function Dashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState("7days")

  useEffect(() => {
    // Load reports from localStorage
    const storedReports = JSON.parse(localStorage.getItem("health-reports") || "[]")
    setReports(storedReports)
  }, [])

  // Generate mock data for demonstration
  const generateMockData = () => {
    const mockReports: Report[] = [
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
      },
      {
        id: "3",
        patientName: "Bob Johnson",
        age: "42",
        village: "Green Valley",
        symptoms: ["Jaundice", "Fatigue"],
        waterTurbidity: "8.5",
        waterPH: "7.8",
        waterContamination: "low",
        notes: "Mild symptoms, monitoring",
        submittedBy: "Health Worker",
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "submitted",
      },
    ]

    const allReports = [...reports, ...mockReports]
    setReports(allReports)
    localStorage.setItem("health-reports", JSON.stringify(allReports))
  }

  useEffect(() => {
    if (reports.length === 0) {
      generateMockData()
    }
  }, [])

  // Calculate statistics
  const totalReports = reports.length
  const recentReports = reports.filter(
    (report) => new Date(report.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  )
  const uniqueVillages = new Set(reports.map((report) => report.village)).size
  const highRiskReports = reports.filter((report) => report.waterContamination === "high").length

  // Symptom frequency data
  const symptomCounts = reports.reduce(
    (acc, report) => {
      report.symptoms.forEach((symptom) => {
        acc[symptom] = (acc[symptom] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const symptomData = Object.entries(symptomCounts)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Water quality distribution
  const waterQualityData = [
    { name: "Low Risk", value: reports.filter((r) => r.waterContamination === "low").length, color: "#4ade80" },
    { name: "Medium Risk", value: reports.filter((r) => r.waterContamination === "medium").length, color: "#facc15" },
    { name: "High Risk", value: reports.filter((r) => r.waterContamination === "high").length, color: "#f87171" },
  ]

  // Village report counts
  const villageData = Object.entries(
    reports.reduce(
      (acc, report) => {
        acc[report.village] = (acc[report.village] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  )
    .map(([village, count]) => ({ village, count }))
    .sort((a, b) => b.count - a.count)

  // Timeline data (last 7 days)
  const timelineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
    const dayReports = reports.filter((report) => new Date(report.submittedAt).toDateString() === date.toDateString())
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      reports: dayReports.length,
      symptoms: dayReports.reduce((sum, report) => sum + report.symptoms.length, 0),
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Health Dashboard</h1>
          <p className="text-muted-foreground">Monitor community health trends and water quality</p>
        </div>
        <Button onClick={generateMockData} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Generate Sample Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalReports}</div>
            <p className="text-xs text-muted-foreground">+{recentReports.length} this week</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Villages Monitored</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{uniqueVillages}</div>
            <p className="text-xs text-muted-foreground">Active monitoring locations</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Areas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{highRiskReports}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Quality</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reports.length > 0
                ? Math.round((reports.filter((r) => r.waterContamination !== "high").length / reports.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Safe water sources</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="water">Water Quality</TabsTrigger>
          <TabsTrigger value="reports">Recent Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Timeline</CardTitle>
                <CardDescription>Daily report submissions over the last week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="reports" stroke="#164e63" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Village Report Distribution</CardTitle>
                <CardDescription>Number of reports by village</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={villageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="village" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#164e63" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Common Symptoms</CardTitle>
                <CardDescription>Frequency of reported symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={symptomData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="symptom" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Symptom Severity Indicators</CardTitle>
                <CardDescription>Track concerning symptom patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {symptomData.slice(0, 5).map((item, index) => (
                  <div key={item.symptom} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.symptom}</span>
                      <span className="text-sm text-muted-foreground">{item.count} cases</span>
                    </div>
                    <Progress
                      value={(item.count / Math.max(...symptomData.map((d) => d.count))) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="water" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Water Contamination Levels</CardTitle>
                <CardDescription>Distribution of water quality assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={waterQualityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {waterQualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Water Quality Alerts</CardTitle>
                <CardDescription>Areas requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reports
                  .filter((report) => report.waterContamination === "high")
                  .slice(0, 5)
                  .map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div>
                        <p className="font-medium text-red-800">{report.village}</p>
                        <p className="text-sm text-red-600">
                          pH: {report.waterPH}, Turbidity: {report.waterTurbidity}
                        </p>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>
                  ))}
                {reports.filter((report) => report.waterContamination === "high").length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No high-risk water quality alerts</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Health Reports</CardTitle>
              <CardDescription>Latest submissions from health workers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports
                  .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                  .slice(0, 10)
                  .map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{report.patientName}</p>
                          <Badge variant="outline">{report.village}</Badge>
                          <Badge
                            variant={
                              report.waterContamination === "high"
                                ? "destructive"
                                : report.waterContamination === "medium"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {report.waterContamination} risk
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Age: {report.age} | Symptoms: {report.symptoms.join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted by {report.submittedBy} on {new Date(report.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">pH: {report.waterPH}</p>
                        <p className="text-xs text-muted-foreground">Turbidity: {report.waterTurbidity}</p>
                      </div>
                    </div>
                  ))}
                {reports.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No reports submitted yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
