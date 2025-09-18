"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Settings, Save, RotateCcw, MapPin, Bell, Plus, Trash2, Edit, Download, Upload, Users, Shield, Database, Activity, BarChart3, Clock, AlertCircle, EyeOff } from "lucide-react"
import { apiClient } from "@/lib/api"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface AlertRule {
  id: string
  name: string
  description: string
  condition: string
  threshold: number
  severity: "low" | "medium" | "high" | "critical"
  isActive: boolean
}

interface VillageSettings {
  name: string
  severity: "low" | "medium" | "high" | "critical"
  customThresholds: {
    outbreakThreshold: number
    waterQualityThreshold: number
    alertFrequency: number
  }
  isCustomized: boolean
}

const defaultAlertRules: AlertRule[] = [
  {
    id: "outbreak-diarrhea",
    name: "Diarrhea Outbreak",
    description: "More than X diarrhea cases in a village within 7 days",
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
    description: "More than X fever cases in a village within 3 days",
    condition: "symptom_count",
    threshold: 3,
    severity: "medium",
    isActive: true,
  },
  {
    id: "jaundice-alert",
    name: "Jaundice Cases",
    description: "Any jaundice cases reported",
    condition: "symptom_count",
    threshold: 1,
    severity: "high",
    isActive: true,
  },
]

const defaultVillages: VillageSettings[] = [
  {
    name: "Riverside Village",
    severity: "high",
    customThresholds: {
      outbreakThreshold: 5,
      waterQualityThreshold: 1,
      alertFrequency: 24
    },
    isCustomized: false
  },
  {
    name: "Mountain View",
    severity: "critical",
    customThresholds: {
      outbreakThreshold: 3,
      waterQualityThreshold: 1,
      alertFrequency: 12
    },
    isCustomized: false
  },
  {
    name: "Green Valley",
    severity: "low",
    customThresholds: {
      outbreakThreshold: 8,
      waterQualityThreshold: 2,
      alertFrequency: 48
    },
    isCustomized: false
  },
  {
    name: "Sunset Hills",
    severity: "medium",
    customThresholds: {
      outbreakThreshold: 6,
      waterQualityThreshold: 1,
      alertFrequency: 24
    },
    isCustomized: false
  },
  {
    name: "Pine Grove",
    severity: "low",
    customThresholds: {
      outbreakThreshold: 10,
      waterQualityThreshold: 3,
      alertFrequency: 72
    },
    isCustomized: false
  },
  {
    name: "Cedar Creek",
    severity: "high",
    customThresholds: {
      outbreakThreshold: 4,
      waterQualityThreshold: 1,
      alertFrequency: 18
    },
    isCustomized: false
  },
  {
    name: "Maple Heights",
    severity: "medium",
    customThresholds: {
      outbreakThreshold: 7,
      waterQualityThreshold: 2,
      alertFrequency: 36
    },
    isCustomized: false
  },
  {
    name: "Oak Ridge",
    severity: "low",
    customThresholds: {
      outbreakThreshold: 12,
      waterQualityThreshold: 4,
      alertFrequency: 96
    },
    isCustomized: false
  }
]

interface SystemSettings {
  globalThresholds: {
    defaultOutbreakThreshold: number
    defaultWaterQualityThreshold: number
    alertRetentionDays: number
    syncFrequencyMinutes: number
  }
  notifications: {
    emailAlerts: boolean
    smsAlerts: boolean
    pushNotifications: boolean
    alertFrequency: number
  }
  security: {
    sessionTimeout: number
    requireTwoFactor: boolean
    auditLogging: boolean
  }
}

export function AdminSettings() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>(defaultAlertRules)
  const [villageSettings, setVillageSettings] = useState<VillageSettings[]>(defaultVillages)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    globalThresholds: {
      defaultOutbreakThreshold: 5,
      defaultWaterQualityThreshold: 1,
      alertRetentionDays: 30,
      syncFrequencyMinutes: 15
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      alertFrequency: 24
    },
    security: {
      sessionTimeout: 60,
      requireTwoFactor: false,
      auditLogging: true
    }
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>({})
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const [rulesData, villagesData, statsData] = await Promise.all([
        apiClient.getAlertRules(),
        apiClient.getVillageSettings(),
        apiClient.getAlertStats()
      ])
      setAlertRules(rulesData || [])
      setVillageSettings(villagesData || [])
      setAnalyticsData(statsData || {})
    } catch (error) {
      console.error("Error loading settings:", error)
      // Fallback to localStorage
      const savedRules = localStorage.getItem("admin-alert-rules")
      const savedVillages = localStorage.getItem("admin-village-settings")
      
      if (savedRules) {
        setAlertRules(JSON.parse(savedRules))
      } else {
        setAlertRules(defaultAlertRules)
      }
      if (savedVillages) {
        setVillageSettings(JSON.parse(savedVillages))
      } else {
        setVillageSettings(defaultVillages)
      }
      setAnalyticsData(generateMockAnalytics())
    }
    setIsLoading(false)
  }

  const generateMockAnalytics = () => {
    return {
      totalRules: alertRules.length,
      activeRules: alertRules.filter(rule => rule.isActive).length,
      totalVillages: villageSettings.length,
      customizedVillages: villageSettings.filter(village => village.isCustomized).length,
      ruleUsage: alertRules.map(rule => ({
        name: rule.name,
        usage: Math.floor(Math.random() * 100),
        severity: rule.severity
      })),
      villageDistribution: villageSettings.map(village => ({
        name: village.name,
        severity: village.severity,
        threshold: village.customThresholds.outbreakThreshold
      })),
      systemHealth: {
        uptime: '99.9%',
        responseTime: '120ms',
        errorRate: '0.1%',
        activeUsers: Math.floor(Math.random() * 50) + 20
      }
    }
  }

  const updateAlertRule = (ruleId: string, field: keyof AlertRule, value: any) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    ))
    setHasChanges(true)
  }

  const updateVillageSetting = (villageName: string, field: keyof VillageSettings, value: any) => {
    setVillageSettings(prev => prev.map(village => 
      village.name === villageName ? { ...village, [field]: value } : village
    ))
    setHasChanges(true)
  }

  const updateVillageThreshold = (villageName: string, thresholdType: keyof VillageSettings['customThresholds'], value: number) => {
    setVillageSettings(prev => prev.map(village => 
      village.name === villageName 
        ? { 
            ...village, 
            customThresholds: { 
              ...village.customThresholds, 
              [thresholdType]: value 
            },
            isCustomized: true
          } 
        : village
    ))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    try {
      await Promise.all([
        apiClient.saveAlertRules(alertRules),
        apiClient.saveVillageSettings(villageSettings)
      ])
      localStorage.setItem("admin-alert-rules", JSON.stringify(alertRules))
      localStorage.setItem("admin-village-settings", JSON.stringify(villageSettings))
      setHasChanges(false)
      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      // Fallback to localStorage
      localStorage.setItem("admin-alert-rules", JSON.stringify(alertRules))
      localStorage.setItem("admin-village-settings", JSON.stringify(villageSettings))
      setHasChanges(false)
      alert("Settings saved locally!")
    }
  }

  const resetToDefaults = () => {
    setAlertRules(defaultAlertRules)
    setVillageSettings(defaultVillages)
    setSystemSettings({
      globalThresholds: {
        defaultOutbreakThreshold: 5,
        defaultWaterQualityThreshold: 1,
        alertRetentionDays: 30,
        syncFrequencyMinutes: 15
      },
      notifications: {
        emailAlerts: true,
        smsAlerts: false,
        pushNotifications: true,
        alertFrequency: 24
      },
      security: {
        sessionTimeout: 60,
        requireTwoFactor: false,
        auditLogging: true
      }
    })
    setHasChanges(true)
  }

  const addNewRule = () => {
    if (newRule.name && newRule.description && newRule.threshold) {
      const rule: AlertRule = {
        id: Date.now().toString(),
        name: newRule.name,
        description: newRule.description,
        condition: newRule.condition || "symptom_count",
        threshold: newRule.threshold,
        severity: newRule.severity || "medium",
        isActive: true
      }
      setAlertRules(prev => [...prev, rule])
      setNewRule({})
      setHasChanges(true)
    }
  }

  const deleteRule = (ruleId: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== ruleId))
    setHasChanges(true)
  }

  const exportSettings = async () => {
    try {
      const settings = {
        alertRules,
        villageSettings,
        systemSettings,
        analytics: analyticsData,
        exportedAt: new Date().toISOString(),
        version: '2.1.0',
        features: {
          aiPatternDetection: true,
          waterQualityMonitoring: true,
          multilingualSupport: true,
          realTimeAlerts: true,
          educationalModules: true
        }
      }
      
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smart-health-admin-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Also save to backend if available
      try {
        await apiClient.exportSettings(settings)
      } catch (error) {
        console.warn('Backend export failed, using local export only')
      }
    } catch (error) {
      console.error('Error exporting settings:', error)
    }
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string)
          if (settings.alertRules) setAlertRules(settings.alertRules)
          if (settings.villageSettings) setVillageSettings(settings.villageSettings)
          if (settings.systemSettings) setSystemSettings(settings.systemSettings)
          setHasChanges(true)
          alert("Settings imported successfully!")
        } catch (error) {
          alert("Error importing settings. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
  }


  const getSeverityColor = (severity: string) => {
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

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Admin Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Configure alert thresholds, village settings, and system preferences</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowAnalytics(!showAnalytics)} variant="outline" className="w-full sm:w-auto">
            {showAnalytics ? <EyeOff className="w-4 h-4 mr-2" /> : <BarChart3 className="w-4 h-4 mr-2" />}
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </Button>
          <Button onClick={exportSettings} variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={resetToDefaults} variant="outline" className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={!hasChanges} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Alert Rules Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData.ruleUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="active" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Village Customization</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData.villageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="customized" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="alert-rules" className="space-y-4 w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          <TabsTrigger value="alert-rules" className="text-xs sm:text-sm">Alert Rules</TabsTrigger>
          <TabsTrigger value="village-settings" className="text-xs sm:text-sm">Village Settings</TabsTrigger>
          <TabsTrigger value="system-settings" className="text-xs sm:text-sm">System Settings</TabsTrigger>
          <TabsTrigger value="ai-ml" className="text-xs sm:text-sm">AI/ML Config</TabsTrigger>
          <TabsTrigger value="water-quality" className="text-xs sm:text-sm">Water Quality</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="alert-rules" className="space-y-4 px-0 sm:px-2">
          {/* Add New Rule Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add New Alert Rule</span>
              </CardTitle>
              <CardDescription>
                Create custom alert rules for specific health conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-rule-name" className="text-sm font-medium">Rule Name</Label>
                  <Input
                    id="new-rule-name"
                    placeholder="Enter rule name"
                    value={newRule.name || ""}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-rule-threshold" className="text-sm font-medium">Threshold</Label>
                  <Input
                    id="new-rule-threshold"
                    type="number"
                    placeholder="Enter threshold"
                    value={newRule.threshold || ""}
                    onChange={(e) => setNewRule(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="new-rule-severity" className="text-sm font-medium">Severity</Label>
                  <Select
                    value={newRule.severity || "medium"}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-rule-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="new-rule-description"
                  placeholder="Describe the alert condition"
                  value={newRule.description || ""}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full min-h-[100px]"
                />
              </div>
              <div className="flex justify-center sm:justify-start">
                <Button onClick={addNewRule} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Rule
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Alert Rules Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure thresholds and conditions for health alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {alertRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 break-words">{rule.description}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                      <Badge variant={getSeverityColor(rule.severity)} className="text-xs">
                        {rule.severity.toUpperCase()}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => updateAlertRule(rule.id, 'isActive', checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor={`threshold-${rule.id}`} className="text-sm font-medium">Threshold</Label>
                      <Input
                        id={`threshold-${rule.id}`}
                        type="number"
                        value={rule.threshold}
                        onChange={(e) => updateAlertRule(rule.id, 'threshold', parseInt(e.target.value))}
                        min="1"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`severity-${rule.id}`} className="text-sm font-medium">Severity Level</Label>
                      <Select
                        value={rule.severity}
                        onValueChange={(value) => updateAlertRule(rule.id, 'severity', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <Label htmlFor={`condition-${rule.id}`} className="text-sm font-medium">Condition</Label>
                      <Select
                        value={rule.condition}
                        onValueChange={(value) => updateAlertRule(rule.id, 'condition', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="symptom_count">Symptom Count</SelectItem>
                          <SelectItem value="water_quality">Water Quality</SelectItem>
                          <SelectItem value="time_based">Time Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="village-settings" className="space-y-4 px-0 sm:px-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Village-Specific Settings</span>
              </CardTitle>
              <CardDescription>
                Configure individual village severity levels and custom thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {villageSettings.map((village) => (
                <div key={village.name} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{village.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {village.isCustomized ? "Custom settings applied" : "Using default settings"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(village.severity)}>
                        {village.severity.toUpperCase()}
                      </Badge>
                      {village.isCustomized && (
                        <Badge variant="outline">Customized</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`severity-${village.name}`}>Severity Level</Label>
                      <Select
                        value={village.severity}
                        onValueChange={(value) => updateVillageSetting(village.name, 'severity', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`outbreak-${village.name}`}>Outbreak Threshold</Label>
                      <Input
                        id={`outbreak-${village.name}`}
                        type="number"
                        value={village.customThresholds.outbreakThreshold}
                        onChange={(e) => updateVillageThreshold(village.name, 'outbreakThreshold', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`water-${village.name}`}>Water Quality Threshold</Label>
                      <Input
                        id={`water-${village.name}`}
                        type="number"
                        value={village.customThresholds.waterQualityThreshold}
                        onChange={(e) => updateVillageThreshold(village.name, 'waterQualityThreshold', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`frequency-${village.name}`}>Alert Frequency (hours)</Label>
                      <Input
                        id={`frequency-${village.name}`}
                        type="number"
                        value={village.customThresholds.alertFrequency}
                        onChange={(e) => updateVillageThreshold(village.name, 'alertFrequency', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="system-settings" className="space-y-4 px-0 sm:px-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>System Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure global system settings and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-outbreak-threshold">Default Outbreak Threshold</Label>
                  <Input
                    id="default-outbreak-threshold"
                    type="number"
                    value={systemSettings.globalThresholds.defaultOutbreakThreshold}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      globalThresholds: {
                        ...prev.globalThresholds,
                        defaultOutbreakThreshold: parseInt(e.target.value)
                      }
                    }))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="default-water-threshold">Default Water Quality Threshold</Label>
                  <Input
                    id="default-water-threshold"
                    type="number"
                    value={systemSettings.globalThresholds.defaultWaterQualityThreshold}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      globalThresholds: {
                        ...prev.globalThresholds,
                        defaultWaterQualityThreshold: parseInt(e.target.value)
                      }
                    }))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="alert-retention">Alert Retention (days)</Label>
                  <Input
                    id="alert-retention"
                    type="number"
                    value={systemSettings.globalThresholds.alertRetentionDays}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      globalThresholds: {
                        ...prev.globalThresholds,
                        alertRetentionDays: parseInt(e.target.value)
                      }
                    }))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="sync-frequency">Sync Frequency (minutes)</Label>
                  <Input
                    id="sync-frequency"
                    type="number"
                    value={systemSettings.globalThresholds.syncFrequencyMinutes}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      globalThresholds: {
                        ...prev.globalThresholds,
                        syncFrequencyMinutes: parseInt(e.target.value)
                      }
                    }))}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Configure security and access control settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={systemSettings.security.sessionTimeout}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      security: {
                        ...prev.security,
                        sessionTimeout: parseInt(e.target.value)
                      }
                    }))}
                    min="5"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={systemSettings.security.requireTwoFactor}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      security: {
                        ...prev.security,
                        requireTwoFactor: checked
                      }
                    }))}
                  />
                  <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={systemSettings.security.auditLogging}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      security: {
                        ...prev.security,
                        auditLogging: checked
                      }
                    }))}
                  />
                  <Label htmlFor="audit-logging">Enable Audit Logging</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 px-0 sm:px-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>
                Configure how and when alerts are sent to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-alerts">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send alerts via email</p>
                  </div>
                  <Switch
                    checked={systemSettings.notifications.emailAlerts}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        emailAlerts: checked
                      }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-alerts">SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send alerts via SMS</p>
                  </div>
                  <Switch
                    checked={systemSettings.notifications.smsAlerts}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        smsAlerts: checked
                      }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send push notifications to mobile devices</p>
                  </div>
                  <Switch
                    checked={systemSettings.notifications.pushNotifications}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        pushNotifications: checked
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="alert-frequency">Alert Frequency (hours)</Label>
                  <Input
                    id="alert-frequency"
                    type="number"
                    value={systemSettings.notifications.alertFrequency}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        alertFrequency: parseInt(e.target.value)
                      }
                    }))}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI/ML Configuration Tab */}
        <TabsContent value="ai-ml" className="space-y-4 px-0 sm:px-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>AI/ML Pattern Detection</span>
              </CardTitle>
              <CardDescription>
                Configure AI models for outbreak prediction and pattern detection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ai-enabled">AI Pattern Detection</Label>
                    <p className="text-sm text-muted-foreground">Enable AI-powered outbreak prediction</p>
                  </div>
                  <Switch
                    checked={systemSettings.ai?.enabled || false}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      ai: {
                        ...prev.ai,
                        enabled: checked
                      }
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
                  <Input
                    id="confidence-threshold"
                    type="number"
                    value={systemSettings.ai?.confidenceThreshold || 75}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      ai: {
                        ...prev.ai,
                        confidenceThreshold: parseInt(e.target.value)
                      }
                    }))}
                    min="50"
                    max="95"
                  />
                  <p className="text-sm text-muted-foreground">Minimum confidence level for AI predictions</p>
                </div>

                <div>
                  <Label htmlFor="model-version">AI Model Version</Label>
                  <Select
                    value={systemSettings.ai?.modelVersion || 'SmartHealth-v2.1'}
                    onValueChange={(value) => setSystemSettings(prev => ({
                      ...prev,
                      ai: {
                        ...prev.ai,
                        modelVersion: value
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SmartHealth-v2.1">SmartHealth v2.1 (Latest)</SelectItem>
                      <SelectItem value="SmartHealth-v2.0">SmartHealth v2.0</SelectItem>
                      <SelectItem value="SmartHealth-v1.5">SmartHealth v1.5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pattern Detection Features</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={systemSettings.ai?.features?.outbreakPrediction || false}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({
                          ...prev,
                          ai: {
                            ...prev.ai,
                            features: {
                              ...prev.ai?.features,
                              outbreakPrediction: checked
                            }
                          }
                        }))}
                      />
                      <Label>Outbreak Prediction</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={systemSettings.ai?.features?.waterContamination || false}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({
                          ...prev,
                          ai: {
                            ...prev.ai,
                            features: {
                              ...prev.ai?.features,
                              waterContamination: checked
                            }
                          }
                        }))}
                      />
                      <Label>Water Contamination Detection</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={systemSettings.ai?.features?.seasonalTrends || false}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({
                          ...prev,
                          ai: {
                            ...prev.ai,
                            features: {
                              ...prev.ai?.features,
                              seasonalTrends: checked
                            }
                          }
                        }))}
                      />
                      <Label>Seasonal Trend Analysis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={systemSettings.ai?.features?.riskAssessment || false}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({
                          ...prev,
                          ai: {
                            ...prev.ai,
                            features: {
                              ...prev.ai?.features,
                              riskAssessment: checked
                            }
                          }
                        }))}
                      />
                      <Label>Risk Assessment</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Water Quality Monitoring Tab */}
        <TabsContent value="water-quality" className="space-y-4 px-0 sm:px-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Water Quality Monitoring</span>
              </CardTitle>
              <CardDescription>
                Configure water quality sensors and testing protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="water-monitoring">Water Quality Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Enable automated water quality monitoring</p>
                  </div>
                  <Switch
                    checked={systemSettings.waterQuality?.enabled || false}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({
                      ...prev,
                      waterQuality: {
                        ...prev.waterQuality,
                        enabled: checked
                      }
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="testing-frequency">Testing Frequency (hours)</Label>
                  <Input
                    id="testing-frequency"
                    type="number"
                    value={systemSettings.waterQuality?.testingFrequency || 24}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      waterQuality: {
                        ...prev.waterQuality,
                        testingFrequency: parseInt(e.target.value)
                      }
                    }))}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Water Quality Parameters</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={systemSettings.waterQuality?.parameters?.turbidity || false}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({
                          ...prev,
                          waterQuality: {
                            ...prev.waterQuality,
                            parameters: {
                              ...prev.waterQuality?.parameters,
                              turbidity: checked
                            }
                          }
                        }))}
                      />
                      <Label>Turbidity</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={systemSettings.waterQuality?.parameters?.ph || false}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({
                          ...prev,
                          waterQuality: {
                            ...prev.waterQuality,
                            parameters: {
                              ...prev.waterQuality?.parameters,
                              ph: checked
                            }
                          }
                        }))}
                      />
                      <Label>pH Level</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={systemSettings.waterQuality?.parameters?.bacteria || false}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({
                          ...prev,
                          waterQuality: {
                            ...prev.waterQuality,
                            parameters: {
                              ...prev.waterQuality?.parameters,
                              bacteria: checked
                            }
                          }
                        }))}
                      />
                      <Label>Bacterial Presence</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={systemSettings.waterQuality?.parameters?.chlorine || false}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({
                          ...prev,
                          waterQuality: {
                            ...prev.waterQuality,
                            parameters: {
                              ...prev.waterQuality?.parameters,
                              chlorine: checked
                            }
                          }
                        }))}
                      />
                      <Label>Chlorine Level</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="contamination-threshold">Contamination Alert Threshold</Label>
                  <Select
                    value={systemSettings.waterQuality?.contaminationThreshold || 'medium'}
                    onValueChange={(value) => setSystemSettings(prev => ({
                      ...prev,
                      waterQuality: {
                        ...prev.waterQuality,
                        contaminationThreshold: value
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Immediate Alert)</SelectItem>
                      <SelectItem value="medium">Medium (Standard Alert)</SelectItem>
                      <SelectItem value="high">High (Delayed Alert)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
