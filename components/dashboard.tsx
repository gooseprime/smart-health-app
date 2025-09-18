"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
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
  Area,
  AreaChart,
} from "recharts"
import { 
  MapPin, 
  Droplets, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Users,
  Shield,
  Clock,
  RefreshCw,
  Eye,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react"
import { MapVisualization } from "./map-visualization"
import { EducationalModules } from "./educational-modules"
import { MultilingualSupport } from "./multilingual-support"
import { dataLayer } from "@/lib/data-layer"
import { apiClient } from "@/lib/api"

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
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Load reports using data layer
    const loadReports = async () => {
      setIsLoading(true)
      try {
        const reports = await dataLayer.getReports()
        setReports(reports)
      } catch (error) {
        console.error('Failed to load reports:', error)
        // Fallback to localStorage if data layer fails
        const storedReports = JSON.parse(localStorage.getItem("health-reports") || "[]")
        setReports(storedReports)
      } finally {
        setIsLoading(false)
      }
    }
    loadReports()
  }, [])

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const reports = await dataLayer.getReports()
      setReports(reports)
    } catch (error) {
      console.error('Failed to refresh reports:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Load data from API
  const loadDataFromAPI = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getReports()
      setReports(response.reports || [])
    } catch (error) {
      console.error('Error loading reports from API:', error)
      // Fallback to local data if API fails
      const localReports = await dataLayer.getReports()
      setReports(localReports)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (reports.length === 0) {
      loadDataFromAPI()
    }
  }, [])

  // Export functionality
  const exportReports = (format: 'csv' | 'excel') => {
    if (reports.length === 0) {
      alert('No reports to export')
      return
    }

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

    if (format === 'csv') {
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `health-reports-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (format === 'excel') {
      // For Excel export, we'll create a more structured format
      const excelData = [
        ['Health Reports Export'],
        [`Generated on: ${new Date().toLocaleDateString()}`],
        [`Total Reports: ${reports.length}`],
        [''],
        headers,
        ...csvData
      ]

      const csvContent = excelData
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `health-reports-${new Date().toISOString().split('T')[0]}.xlsx`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
      {/* Clean Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Health Dashboard</h1>
            </div>
            <p className="text-gray-600 text-base sm:text-lg">Monitor community health trends and water quality in real-time</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {uniqueVillages} villages monitored
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              onClick={refreshData} 
              variant="outline" 
              size="sm"
              disabled={isRefreshing}
              className="w-full sm:w-auto border-gray-300 hover:border-blue-600 hover:bg-blue-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={loadDataFromAPI} variant="outline" size="sm" className="w-full sm:w-auto border-gray-300 hover:border-blue-600 hover:bg-blue-50">
              <Activity className="w-4 h-4 mr-2" />
              Load Data
            </Button>
            <Button onClick={() => exportReports('csv')} variant="outline" size="sm" className="w-full sm:w-auto border-gray-300 hover:border-blue-600 hover:bg-blue-50">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={() => exportReports('excel')} variant="outline" size="sm" className="w-full sm:w-auto border-gray-300 hover:border-blue-600 hover:bg-blue-50">
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Reports Card */}
        <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalReports}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">+{recentReports.length}</span>
              <span className="text-gray-500">this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Villages Monitored Card */}
        <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Villages Monitored</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{uniqueVillages}</div>
            <div className="flex items-center gap-1 text-sm">
              <Shield className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">Active</span>
              <span className="text-gray-500">monitoring</span>
            </div>
          </CardContent>
        </Card>

        {/* High Risk Areas Card */}
        <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Risk Areas</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{highRiskReports}</div>
            <div className="flex items-center gap-1 text-sm">
              <AlertTriangle className="h-3 w-3 text-red-600" />
              <span className="text-red-600 font-medium">Critical</span>
              <span className="text-gray-500">attention needed</span>
            </div>
          </CardContent>
        </Card>

        {/* Water Quality Card */}
        <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Water Quality</CardTitle>
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Droplets className="h-5 w-5 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {reports.length > 0
                ? Math.round((reports.filter((r) => r.waterContamination !== "high").length / reports.length) * 100)
                : 0}%
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Droplets className="h-3 w-3 text-cyan-600" />
              <span className="text-cyan-600 font-medium">Safe</span>
              <span className="text-gray-500">water sources</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            <p className="text-gray-600">Comprehensive health data visualization and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 hover:border-blue-600 hover:bg-blue-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 hover:border-blue-600 hover:bg-blue-50">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 bg-gray-100 p-1 rounded-lg gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Map View</span>
              <span className="sm:hidden">Map</span>
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Symptoms</span>
              <span className="sm:hidden">Symptoms</span>
            </TabsTrigger>
            <TabsTrigger value="water" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Droplets className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Water Quality</span>
              <span className="sm:hidden">Water</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Education</span>
              <span className="sm:hidden">Edu</span>
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Languages</span>
              <span className="sm:hidden">Lang</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
          </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Timeline Chart */}
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <LineChartIcon className="w-5 h-5 text-blue-600" />
                      Report Timeline
                    </CardTitle>
                    <CardDescription>Daily report submissions over the last week</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="reports" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fill="url(#colorReports)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Enhanced Village Distribution Chart */}
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Village Distribution
                    </CardTitle>
                    <CardDescription>Number of reports by village</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <MapPin className="w-3 h-3 mr-1" />
                    {uniqueVillages} villages
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={villageData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="village" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <MapVisualization />
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Symptoms Chart */}
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5 text-orange-600" />
                      Most Common Symptoms
                    </CardTitle>
                    <CardDescription>Frequency of reported symptoms</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    <Activity className="w-3 h-3 mr-1" />
                    {symptomData.length} symptoms
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={symptomData} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      type="number" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      dataKey="symptom" 
                      type="category" 
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#f97316"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Enhanced Severity Indicators */}
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Severity Indicators
                    </CardTitle>
                    <CardDescription>Track concerning symptom patterns</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Monitoring
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {symptomData.slice(0, 5).map((item, index) => (
                  <div key={item.symptom} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">{item.symptom}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-orange-600">{item.count}</span>
                        <span className="text-xs text-muted-foreground">cases</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress
                        value={(item.count / Math.max(...symptomData.map((d) => d.count))) * 100}
                        className="h-3 bg-gray-200"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span>
                        <span>{Math.max(...symptomData.map((d) => d.count))}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="water" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Water Quality Pie Chart */}
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <PieChartIcon className="w-5 h-5 text-cyan-600" />
                      Water Contamination Levels
                    </CardTitle>
                    <CardDescription>Distribution of water quality assessments</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                    <Droplets className="w-3 h-3 mr-1" />
                    Quality Check
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={waterQualityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {waterQualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Enhanced Water Quality Alerts */}
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Water Quality Alerts
                    </CardTitle>
                    <CardDescription>Areas requiring immediate attention</CardDescription>
                  </div>
                  <Badge variant="destructive" className="bg-red-100 text-red-700">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {reports.filter((report) => report.waterContamination === "high").length} alerts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {reports
                  .filter((report) => report.waterContamination === "high")
                  .slice(0, 5)
                  .map((report) => (
                    <div
                      key={report.id}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <p className="font-semibold text-red-900">{report.village}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-red-700">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">pH:</span> {report.waterPH}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Turbidity:</span> {report.waterTurbidity}
                          </span>
                        </div>
                      </div>
                      <Badge variant="destructive" className="group-hover:scale-105 transition-transform">
                        High Risk
                      </Badge>
                    </div>
                  ))}
                {reports.filter((report) => report.waterContamination === "high").length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-lg font-medium text-green-700">All Clear!</p>
                    <p className="text-sm text-gray-500">No high-risk water quality alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="border border-gray-200 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Recent Health Reports
                  </CardTitle>
                  <CardDescription>Latest submissions from health workers</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    <FileText className="w-3 h-3 mr-1" />
                    {reports.length} total
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports
                  .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                  .slice(0, 10)
                  .map((report) => (
                    <div
                      key={report.id}
                      className="group flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {report.patientName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{report.patientName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                {report.village}
                              </Badge>
                              <Badge
                                variant={
                                  report.waterContamination === "high"
                                    ? "destructive"
                                    : report.waterContamination === "medium"
                                      ? "secondary"
                                      : "default"
                                }
                                className="text-xs"
                              >
                                {report.waterContamination} risk
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="ml-13 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Age:</span> {report.age} | 
                            <span className="font-medium ml-1">Symptoms:</span> {report.symptoms.join(", ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Submitted by</span> {report.submittedBy} on {new Date(report.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-semibold">pH: {report.waterPH}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-muted-foreground">Turbidity: {report.waterTurbidity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                {reports.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">No Reports Yet</p>
                    <p className="text-sm text-gray-500">Health reports will appear here once submitted</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Educational Modules Tab */}
        <TabsContent value="education" className="space-y-6">
          <EducationalModules />
        </TabsContent>

        {/* Multilingual Support Tab */}
        <TabsContent value="languages" className="space-y-6">
          <MultilingualSupport />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
