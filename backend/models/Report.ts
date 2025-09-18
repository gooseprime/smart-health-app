import mongoose, { Document, Schema } from 'mongoose'

export interface IReport extends Document {
  _id: string
  patientName: string
  age: number
  gender: "male" | "female" | "other"
  symptoms: string[]
  severity: "mild" | "moderate" | "severe"
  village: string
  location: {
    latitude: number
    longitude: number
    address: string
  }
  waterTestResults?: {
    phLevel: number
    contaminationLevel: "low" | "medium" | "high"
    bacteriaCount: number
    testDate: Date
  }
  submittedBy: mongoose.Types.ObjectId
  submittedAt: Date
  status: "pending" | "reviewed" | "flagged" | "resolved"
  notes?: string
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  priority: "low" | "medium" | "high" | "critical"
  tags: string[]
  attachments?: string[]
}

const reportSchema = new Schema<IReport>({
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    maxlength: [100, 'Patient name cannot exceed 100 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age cannot exceed 150']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  symptoms: [{
    type: String,
    required: true,
    trim: true
  }],
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    required: [true, 'Severity is required']
  },
  village: {
    type: String,
    required: [true, 'Village is required'],
    trim: true,
    maxlength: [100, 'Village name cannot exceed 100 characters']
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    }
  },
  waterTestResults: {
    phLevel: {
      type: Number,
      min: [0, 'pH level cannot be negative'],
      max: [14, 'pH level cannot exceed 14']
    },
    contaminationLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    bacteriaCount: {
      type: Number,
      min: [0, 'Bacteria count cannot be negative']
    },
    testDate: {
      type: Date,
      default: Date.now
    }
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitted by is required']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'flagged', 'resolved'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    type: String // File paths or URLs
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
reportSchema.index({ submittedBy: 1 })
reportSchema.index({ village: 1 })
reportSchema.index({ status: 1 })
reportSchema.index({ severity: 1 })
reportSchema.index({ submittedAt: -1 })
reportSchema.index({ 'location.latitude': 1, 'location.longitude': 1 })

// Virtual for report ID
reportSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Pre-save middleware to set priority based on severity
reportSchema.pre('save', function(next) {
  if (this.isModified('severity')) {
    switch (this.severity) {
      case 'mild':
        this.priority = 'low'
        break
      case 'moderate':
        this.priority = 'medium'
        break
      case 'severe':
        this.priority = 'high'
        break
    }
  }
  next()
})

export const Report = mongoose.model<IReport>('Report', reportSchema)
