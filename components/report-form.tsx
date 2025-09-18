"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, MapPin, Thermometer, Droplets, CheckCircle, AlertCircle, Loader2, WifiOff } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { syncManager } from "@/lib/sync-manager"

interface ReportData {
  patientName: string
  age: string
  village: string
  symptoms: string[]
  waterTurbidity: string
  waterPH: string
  waterContamination: string
  notes: string
}

const symptomsList = [
  "Diarrhea",
  "Fever",
  "Vomiting",
  "Jaundice",
  "Abdominal Pain",
  "Nausea",
  "Headache",
  "Dehydration",
  "Fatigue",
  "Loss of Appetite",
]

const villages = [
  "Riverside Village",
  "Mountain View",
  "Green Valley",
  "Sunset Hills",
  "Pine Grove",
  "Cedar Creek",
  "Maple Heights",
  "Oak Ridge",
]

export function ReportForm() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isOfflineSubmit, setIsOfflineSubmit] = useState(false)
  const [formData, setFormData] = useState<ReportData>({
    patientName: "",
    age: "",
    village: "",
    symptoms: [],
    waterTurbidity: "",
    waterPH: "",
    waterContamination: "",
    notes: "",
  })

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: checked ? [...prev.symptoms, symptom] : prev.symptoms.filter((s) => s !== symptom),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsOfflineSubmit(false)

    try {
      const reportId = await syncManager.saveReportOffline({
        ...formData,
        submittedBy: user?.name,
        submittedAt: new Date().toISOString(),
        status: "submitted",
      })

      const syncStatus = syncManager.getStatus()
      setIsOfflineSubmit(!syncStatus.isOnline)

      setIsSubmitting(false)
      setSubmitSuccess(true)

      setTimeout(() => {
        setFormData({
          patientName: "",
          age: "",
          village: "",
          symptoms: [],
          waterTurbidity: "",
          waterPH: "",
          waterContamination: "",
          notes: "",
        })
        setSubmitSuccess(false)
        setIsOfflineSubmit(false)
      }, 3000)
    } catch (error) {
      console.error("Failed to submit report:", error)
      setIsSubmitting(false)
    }
  }

  const formProgress = () => {
    const fields = [
      formData.patientName,
      formData.age,
      formData.village,
      formData.symptoms.length > 0,
      formData.waterTurbidity,
      formData.waterPH,
      formData.waterContamination,
    ]
    const completed = fields.filter(Boolean).length
    return (completed / fields.length) * 100
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className={`border-green-200 ${isOfflineSubmit ? "bg-blue-50" : "bg-green-50"}`}>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {isOfflineSubmit ? (
                <>
                  <WifiOff className="w-16 h-16 text-blue-600 mx-auto animate-pulse" />
                  <h3 className="text-xl font-semibold text-blue-800">Report Saved Offline!</h3>
                  <p className="text-blue-700">
                    Your report has been saved locally and will be automatically synced when you're back online.
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Offline Mode - Will Sync Later
                  </Badge>
                </>
              ) : (
                <>
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto animate-bounce" />
                  <h3 className="text-xl font-semibold text-green-800">Report Submitted Successfully!</h3>
                  <p className="text-green-700">
                    Your health report has been recorded and will be reviewed by the admin team.
                  </p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Report ID: #{Date.now().toString().slice(-6)}
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Submit Health Report</h1>
        <p className="text-muted-foreground">
          Record patient symptoms and water quality data for community health monitoring
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Form Progress</span>
              <span className="font-medium">{Math.round(formProgress())}% Complete</span>
            </div>
            <Progress value={formProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Patient Information</span>
              </CardTitle>
              <CardDescription>Basic patient details and location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Enter patient's full name"
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                  placeholder="Patient's age"
                  required
                  min="0"
                  max="120"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village/Location *</Label>
                <Select
                  value={formData.village}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, village: value }))}
                >
                  <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                    <SelectValue placeholder="Select village" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village} value={village}>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{village}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span>Water Quality</span>
              </CardTitle>
              <CardDescription>Water test results and contamination levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="turbidity">Turbidity (NTU) *</Label>
                <Input
                  id="turbidity"
                  type="number"
                  value={formData.waterTurbidity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, waterTurbidity: e.target.value }))}
                  placeholder="0-100"
                  required
                  min="0"
                  step="0.1"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ph">pH Level *</Label>
                <Input
                  id="ph"
                  type="number"
                  value={formData.waterPH}
                  onChange={(e) => setFormData((prev) => ({ ...prev, waterPH: e.target.value }))}
                  placeholder="0-14"
                  required
                  min="0"
                  max="14"
                  step="0.1"
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contamination">Contamination Level *</Label>
                <Select
                  value={formData.waterContamination}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, waterContamination: value }))}
                >
                  <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                    <SelectValue placeholder="Select contamination level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Low</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Medium</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>High</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              <span>Symptoms Checklist</span>
            </CardTitle>
            <CardDescription>Select all symptoms reported by the patient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {symptomsList.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={formData.symptoms.includes(symptom)}
                    onCheckedChange={(checked) => handleSymptomChange(symptom, checked as boolean)}
                    className="transition-all duration-200 hover:scale-110"
                  />
                  <Label
                    htmlFor={symptom}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {symptom}
                  </Label>
                </div>
              ))}
            </div>
            {formData.symptoms.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.symptoms.map((symptom) => (
                  <Badge key={symptom} variant="secondary" className="bg-red-100 text-red-800">
                    {symptom}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>Any additional observations or comments</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter any additional observations, treatment given, or other relevant information..."
              className="min-h-[100px] transition-all duration-200 focus:scale-[1.01]"
            />
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || formProgress() < 85}
            className="w-full md:w-auto px-8 transition-all duration-200 hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Submit Health Report
              </>
            )}
          </Button>
        </div>

        {formProgress() < 85 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please complete at least 85% of the form before submitting. Missing required fields: Patient info,
              symptoms, and water quality data.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  )
}
