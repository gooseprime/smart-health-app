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
import { AlertTriangle, Settings, Save, RotateCcw, MapPin, Bell } from "lucide-react"

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

export function AdminSettings() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>(defaultAlertRules)
  const [villageSettings, setVillageSettings] = useState<VillageSettings[]>(defaultVillages)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load saved settings from localStorage
    const savedRules = localStorage.getItem("admin-alert-rules")
    const savedVillages = localStorage.getItem("admin-village-settings")
    
    if (savedRules) {
      setAlertRules(JSON.parse(savedRules))
    }
    if (savedVillages) {
      setVillageSettings(JSON.parse(savedVillages))
    }
  }, [])

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

  const saveSettings = () => {
    localStorage.setItem("admin-alert-rules", JSON.stringify(alertRules))
    localStorage.setItem("admin-village-settings", JSON.stringify(villageSettings))
    setHasChanges(false)
    // In a real app, this would also sync to the backend
    alert("Settings saved successfully!")
  }

  const resetToDefaults = () => {
    setAlertRules(defaultAlertRules)
    setVillageSettings(defaultVillages)
    setHasChanges(true)
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Settings</h1>
          <p className="text-muted-foreground">Configure alert thresholds and village-specific settings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetToDefaults} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="alert-rules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alert-rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="village-settings">Village Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alert-rules" className="space-y-4">
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
                <div key={rule.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(rule.severity)}>
                        {rule.severity.toUpperCase()}
                      </Badge>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => updateAlertRule(rule.id, 'isActive', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`threshold-${rule.id}`}>Threshold</Label>
                      <Input
                        id={`threshold-${rule.id}`}
                        type="number"
                        value={rule.threshold}
                        onChange={(e) => updateAlertRule(rule.id, 'threshold', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`severity-${rule.id}`}>Severity Level</Label>
                      <Select
                        value={rule.severity}
                        onValueChange={(value) => updateAlertRule(rule.id, 'severity', value)}
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
                      <Label htmlFor={`condition-${rule.id}`}>Condition</Label>
                      <Select
                        value={rule.condition}
                        onValueChange={(value) => updateAlertRule(rule.id, 'condition', value)}
                      >
                        <SelectTrigger>
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

        <TabsContent value="village-settings" className="space-y-4">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>System-wide configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-outbreak-threshold">Default Outbreak Threshold</Label>
                  <Input
                    id="default-outbreak-threshold"
                    type="number"
                    defaultValue="5"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="default-water-threshold">Default Water Quality Threshold</Label>
                  <Input
                    id="default-water-threshold"
                    type="number"
                    defaultValue="1"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="alert-retention">Alert Retention (days)</Label>
                  <Input
                    id="alert-retention"
                    type="number"
                    defaultValue="30"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="sync-frequency">Sync Frequency (minutes)</Label>
                  <Input
                    id="sync-frequency"
                    type="number"
                    defaultValue="15"
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
