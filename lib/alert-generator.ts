import { apiClient } from './api'

export interface HealthReport {
  id: string
  patientName: string
  age: number
  village: string
  symptoms: string[]
  waterTurbidity: string
  waterPH: string
  waterContamination: string
  notes: string
  submittedAt: string
  submittedBy: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface AlertRule {
  id: string
  name: string
  description: string
  condition: string
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  timeWindow: number // in hours
}

export interface GeneratedAlert {
  id: string
  title: string
  type: 'water_contamination' | 'disease_outbreak' | 'water_shortage' | 'infrastructure' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  village: string
  reportIds: string[]
  affectedCount: number
  createdAt: string
  status: 'active' | 'acknowledged' | 'resolved'
  data: {
    pattern: string
    confidence: number
    recommendations: string[]
  }
}

class AlertGenerator {
  private alertRules: AlertRule[] = [
    {
      id: 'diarrhea-outbreak',
      name: 'Diarrhea Outbreak',
      description: 'Multiple diarrhea cases in a village within 24 hours',
      condition: 'symptom_count',
      threshold: 3,
      severity: 'high',
      isActive: true,
      timeWindow: 24
    },
    {
      id: 'water-contamination-high',
      name: 'High Water Contamination',
      description: 'Multiple reports of high water contamination in a village',
      condition: 'water_contamination',
      threshold: 2,
      severity: 'critical',
      isActive: true,
      timeWindow: 48
    },
    {
      id: 'fever-cluster',
      name: 'Fever Cluster',
      description: 'Multiple fever cases in a village within 12 hours',
      condition: 'symptom_count',
      threshold: 4,
      severity: 'medium',
      isActive: true,
      timeWindow: 12
    },
    {
      id: 'water-ph-abnormal',
      name: 'Abnormal Water pH',
      description: 'Multiple reports of abnormal water pH levels',
      condition: 'water_ph',
      threshold: 2,
      severity: 'medium',
      isActive: true,
      timeWindow: 24
    },
    {
      id: 'severe-symptoms',
      name: 'Severe Symptoms Cluster',
      description: 'Multiple cases with severe symptoms in a village',
      condition: 'severity_count',
      threshold: 2,
      severity: 'critical',
      isActive: true,
      timeWindow: 6
    }
  ]

  // Analyze reports and generate alerts
  async generateAlertsFromReports(reports: HealthReport[]): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = []
    
    // Group reports by village
    const reportsByVillage = this.groupReportsByVillage(reports)
    
    // Check each alert rule
    for (const rule of this.alertRules) {
      if (!rule.isActive) continue
      
      for (const [village, villageReports] of Object.entries(reportsByVillage)) {
        const recentReports = this.getRecentReports(villageReports, rule.timeWindow)
        
        if (recentReports.length === 0) continue
        
        const alert = await this.checkAlertRule(rule, recentReports, village)
        if (alert) {
          alerts.push(alert)
        }
      }
    }
    
    return alerts
  }

  // Group reports by village
  private groupReportsByVillage(reports: HealthReport[]): Record<string, HealthReport[]> {
    return reports.reduce((acc, report) => {
      if (!acc[report.village]) {
        acc[report.village] = []
      }
      acc[report.village].push(report)
      return acc
    }, {} as Record<string, HealthReport[]>)
  }

  // Get reports within time window
  private getRecentReports(reports: HealthReport[], timeWindowHours: number): HealthReport[] {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000)
    return reports.filter(report => new Date(report.submittedAt) >= cutoffTime)
  }

  // Check if alert rule is triggered
  private async checkAlertRule(rule: AlertRule, reports: HealthReport[], village: string): Promise<GeneratedAlert | null> {
    switch (rule.condition) {
      case 'symptom_count':
        return this.checkSymptomCountRule(rule, reports, village)
      case 'water_contamination':
        return this.checkWaterContaminationRule(rule, reports, village)
      case 'water_ph':
        return this.checkWaterPHRule(rule, reports, village)
      case 'severity_count':
        return this.checkSeverityCountRule(rule, reports, village)
      default:
        return null
    }
  }

  // Check symptom count rule (e.g., diarrhea outbreak)
  private checkSymptomCountRule(rule: AlertRule, reports: HealthReport[], village: string): GeneratedAlert | null {
    const symptomMap: Record<string, string[]> = {
      'diarrhea-outbreak': ['Diarrhea'],
      'fever-cluster': ['Fever']
    }
    
    const symptoms = symptomMap[rule.id] || []
    const matchingReports = reports.filter(report => 
      symptoms.some(symptom => report.symptoms.includes(symptom))
    )
    
    if (matchingReports.length >= rule.threshold) {
      return {
        id: `${rule.id}-${village}-${Date.now()}`,
        title: rule.name,
        type: this.getAlertType(rule.id),
        severity: rule.severity,
        message: this.generateAlertMessage(rule, matchingReports, village),
        village,
        reportIds: matchingReports.map(r => r.id),
        affectedCount: matchingReports.length,
        createdAt: new Date().toISOString(),
        status: 'active',
        data: {
          pattern: this.analyzePattern(matchingReports),
          confidence: this.calculateConfidence(matchingReports, rule.threshold),
          recommendations: this.generateRecommendations(rule.id, matchingReports)
        }
      }
    }
    
    return null
  }

  // Check water contamination rule
  private checkWaterContaminationRule(rule: AlertRule, reports: HealthReport[], village: string): GeneratedAlert | null {
    const contaminatedReports = reports.filter(report => 
      report.waterContamination === 'high' || report.waterContamination === 'severe'
    )
    
    if (contaminatedReports.length >= rule.threshold) {
      return {
        id: `${rule.id}-${village}-${Date.now()}`,
        title: rule.name,
        type: 'water_contamination',
        severity: rule.severity,
        message: this.generateAlertMessage(rule, contaminatedReports, village),
        village,
        reportIds: contaminatedReports.map(r => r.id),
        affectedCount: contaminatedReports.length,
        createdAt: new Date().toISOString(),
        status: 'active',
        data: {
          pattern: this.analyzeWaterPattern(contaminatedReports),
          confidence: this.calculateConfidence(contaminatedReports, rule.threshold),
          recommendations: this.generateWaterRecommendations(contaminatedReports)
        }
      }
    }
    
    return null
  }

  // Check water pH rule
  private checkWaterPHRule(rule: AlertRule, reports: HealthReport[], village: string): GeneratedAlert | null {
    const abnormalPHReports = reports.filter(report => {
      const ph = parseFloat(report.waterPH)
      return ph < 6.5 || ph > 8.5 // Normal pH range is 6.5-8.5
    })
    
    if (abnormalPHReports.length >= rule.threshold) {
      return {
        id: `${rule.id}-${village}-${Date.now()}`,
        title: rule.name,
        type: 'water_contamination',
        severity: rule.severity,
        message: this.generateAlertMessage(rule, abnormalPHReports, village),
        village,
        reportIds: abnormalPHReports.map(r => r.id),
        affectedCount: abnormalPHReports.length,
        createdAt: new Date().toISOString(),
        status: 'active',
        data: {
          pattern: this.analyzePHPattern(abnormalPHReports),
          confidence: this.calculateConfidence(abnormalPHReports, rule.threshold),
          recommendations: this.generatePHRecommendations(abnormalPHReports)
        }
      }
    }
    
    return null
  }

  // Check severity count rule
  private checkSeverityCountRule(rule: AlertRule, reports: HealthReport[], village: string): GeneratedAlert | null {
    const severeReports = reports.filter(report => 
      report.severity === 'high' || report.severity === 'critical'
    )
    
    if (severeReports.length >= rule.threshold) {
      return {
        id: `${rule.id}-${village}-${Date.now()}`,
        title: rule.name,
        type: 'disease_outbreak',
        severity: rule.severity,
        message: this.generateAlertMessage(rule, severeReports, village),
        village,
        reportIds: severeReports.map(r => r.id),
        affectedCount: severeReports.length,
        createdAt: new Date().toISOString(),
        status: 'active',
        data: {
          pattern: this.analyzeSeverityPattern(severeReports),
          confidence: this.calculateConfidence(severeReports, rule.threshold),
          recommendations: this.generateSeverityRecommendations(severeReports)
        }
      }
    }
    
    return null
  }

  // Generate alert message
  private generateAlertMessage(rule: AlertRule, reports: HealthReport[], village: string): string {
    const count = reports.length
    const timeWindow = rule.timeWindow
    
    switch (rule.id) {
      case 'diarrhea-outbreak':
        return `${count} cases of diarrhea reported in ${village} within the last ${timeWindow} hours. This may indicate a waterborne disease outbreak.`
      case 'water-contamination-high':
        return `${count} reports of high water contamination in ${village} within the last ${timeWindow} hours. Immediate water testing and treatment recommended.`
      case 'fever-cluster':
        return `${count} fever cases reported in ${village} within the last ${timeWindow} hours. Monitor for potential infectious disease spread.`
      case 'water-ph-abnormal':
        return `${count} reports of abnormal water pH levels in ${village} within the last ${timeWindow} hours. Water quality assessment needed.`
      case 'severe-symptoms':
        return `${count} cases with severe symptoms reported in ${village} within the last ${timeWindow} hours. Immediate medical attention required.`
      default:
        return `${rule.name} detected in ${village}: ${count} cases within ${timeWindow} hours.`
    }
  }

  // Get alert type based on rule
  private getAlertType(ruleId: string): GeneratedAlert['type'] {
    if (ruleId.includes('water')) return 'water_contamination'
    if (ruleId.includes('outbreak') || ruleId.includes('cluster')) return 'disease_outbreak'
    return 'system'
  }

  // Analyze pattern in reports
  private analyzePattern(reports: HealthReport[]): string {
    const symptoms = reports.flatMap(r => r.symptoms)
    const symptomCounts = symptoms.reduce((acc, symptom) => {
      acc[symptom] = (acc[symptom] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symptom]) => symptom)
    
    return `Common symptoms: ${topSymptoms.join(', ')}`
  }

  // Analyze water pattern
  private analyzeWaterPattern(reports: HealthReport[]): string {
    const contaminationLevels = reports.map(r => r.waterContamination)
    const levelCounts = contaminationLevels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantLevel = Object.entries(levelCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown'
    
    return `Water contamination level: ${dominantLevel}`
  }

  // Analyze pH pattern
  private analyzePHPattern(reports: HealthReport[]): string {
    const phValues = reports.map(r => parseFloat(r.waterPH)).filter(ph => !isNaN(ph))
    if (phValues.length === 0) return 'No valid pH data'
    
    const avgPH = phValues.reduce((sum, ph) => sum + ph, 0) / phValues.length
    const minPH = Math.min(...phValues)
    const maxPH = Math.max(...phValues)
    
    return `pH range: ${minPH.toFixed(1)} - ${maxPH.toFixed(1)}, average: ${avgPH.toFixed(1)}`
  }

  // Analyze severity pattern
  private analyzeSeverityPattern(reports: HealthReport[]): string {
    const severities = reports.map(r => r.severity)
    const severityCounts = severities.reduce((acc, severity) => {
      acc[severity] = (acc[severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantSeverity = Object.entries(severityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown'
    
    return `Dominant severity: ${dominantSeverity}`
  }

  // Calculate confidence score
  private calculateConfidence(reports: HealthReport[], threshold: number): number {
    const ratio = reports.length / threshold
    return Math.min(ratio * 0.8, 1.0) // Max confidence of 80% based on threshold ratio
  }

  // Generate recommendations
  private generateRecommendations(ruleId: string, reports: HealthReport[]): string[] {
    const recommendations: string[] = []
    
    switch (ruleId) {
      case 'diarrhea-outbreak':
        recommendations.push('Test water sources for bacterial contamination')
        recommendations.push('Distribute oral rehydration salts')
        recommendations.push('Advise villagers to boil water before drinking')
        recommendations.push('Monitor for additional cases')
        break
      case 'water-contamination-high':
        recommendations.push('Immediate water source testing required')
        recommendations.push('Consider alternative water sources')
        recommendations.push('Distribute water purification tablets')
        recommendations.push('Notify local health authorities')
        break
      case 'fever-cluster':
        recommendations.push('Monitor for infectious disease symptoms')
        recommendations.push('Isolate suspected cases if possible')
        recommendations.push('Distribute fever-reducing medication')
        recommendations.push('Check for vector-borne disease indicators')
        break
      case 'water-ph-abnormal':
        recommendations.push('Test water pH levels at source')
        recommendations.push('Check for chemical contamination')
        recommendations.push('Consider water treatment options')
        recommendations.push('Monitor for health effects')
        break
      case 'severe-symptoms':
        recommendations.push('Immediate medical assessment required')
        recommendations.push('Arrange emergency transport if needed')
        recommendations.push('Notify nearest health facility')
        recommendations.push('Monitor for symptom progression')
        break
    }
    
    return recommendations
  }

  // Generate water-specific recommendations
  private generateWaterRecommendations(reports: HealthReport[]): string[] {
    return [
      'Test water sources for bacterial and chemical contamination',
      'Distribute water purification tablets or filters',
      'Advise villagers to boil water for at least 1 minute',
      'Consider temporary alternative water sources',
      'Notify local water authority and health department'
    ]
  }

  // Generate pH-specific recommendations
  private generatePHRecommendations(reports: HealthReport[]): string[] {
    return [
      'Test water pH levels at multiple points in the distribution system',
      'Check for chemical contamination or industrial runoff',
      'Consider pH adjustment treatment if necessary',
      'Monitor for health effects in the community',
      'Document pH levels for regulatory reporting'
    ]
  }

  // Generate severity-specific recommendations
  private generateSeverityRecommendations(reports: HealthReport[]): string[] {
    return [
      'Immediate medical assessment for all affected individuals',
      'Arrange emergency transport to nearest health facility',
      'Notify local health authorities and emergency services',
      'Monitor for symptom progression and complications',
      'Consider isolation measures if infectious disease suspected'
    ]
  }

  // Get alert rules
  getAlertRules(): AlertRule[] {
    return this.alertRules
  }

  // Update alert rule
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const index = this.alertRules.findIndex(rule => rule.id === ruleId)
    if (index !== -1) {
      this.alertRules[index] = { ...this.alertRules[index], ...updates }
    }
  }

  // Add new alert rule
  addAlertRule(rule: Omit<AlertRule, 'id'>): void {
    const newRule: AlertRule = {
      ...rule,
      id: `custom-${Date.now()}`
    }
    this.alertRules.push(newRule)
  }
}

export const alertGenerator = new AlertGenerator()
