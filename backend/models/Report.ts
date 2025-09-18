// Report model for backend database operations
export interface Report {
  id: string
  patient_name: string
  age: number
  gender: "male" | "female" | "other"
  symptoms: string[]
  severity: "mild" | "moderate" | "severe"
  location: {
    latitude: number
    longitude: number
    address: string
  }
  water_test_results?: {
    ph_level: number
    contamination_level: "low" | "medium" | "high"
    bacteria_count: number
  }
  submitted_by: string
  submitted_at: Date
  status: "pending" | "reviewed" | "flagged"
  notes?: string
}

export interface ReportCreateInput {
  patient_name: string
  age: number
  gender: "male" | "female" | "other"
  symptoms: string[]
  severity: "mild" | "moderate" | "severe"
  location: {
    latitude: number
    longitude: number
    address: string
  }
  water_test_results?: {
    ph_level: number
    contamination_level: "low" | "medium" | "high"
    bacteria_count: number
  }
  submitted_by: string
  notes?: string
}

export interface ReportUpdateInput {
  status?: "pending" | "reviewed" | "flagged"
  notes?: string
}
