import mongoose, { Document, Schema } from 'mongoose'

export interface IAlert extends Document {
  _id: string
  title: string
  type: 'water_contamination' | 'disease_outbreak' | 'water_shortage' | 'infrastructure' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  village?: string
  reportId?: mongoose.Types.ObjectId
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  acknowledged: boolean
  acknowledgedBy?: mongoose.Types.ObjectId
  acknowledgedAt?: Date
  resolved: boolean
  resolvedBy?: mongoose.Types.ObjectId
  resolvedAt?: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  metadata?: Record<string, any>
}

const alertSchema = new Schema<IAlert>({
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['water_contamination', 'disease_outbreak', 'water_shortage', 'infrastructure', 'system'],
    required: [true, 'Alert type is required']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Alert severity is required']
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  village: {
    type: String,
    trim: true,
    maxlength: [100, 'Village name cannot exceed 100 characters']
  },
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: {
    type: Date
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
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
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
alertSchema.index({ type: 1 })
alertSchema.index({ severity: 1 })
alertSchema.index({ village: 1 })
alertSchema.index({ acknowledged: 1 })
alertSchema.index({ resolved: 1 })
alertSchema.index({ createdAt: -1 })
alertSchema.index({ priority: 1 })

// Virtual for alert ID
alertSchema.virtual('id').get(function() {
  return this._id.toString()
})

// Pre-save middleware to set priority based on severity
alertSchema.pre('save', function(next) {
  if (this.isModified('severity')) {
    switch (this.severity) {
      case 'low':
        this.priority = 'low'
        break
      case 'medium':
        this.priority = 'medium'
        break
      case 'high':
        this.priority = 'high'
        break
      case 'critical':
        this.priority = 'critical'
        break
    }
  }
  next()
})

export const Alert = mongoose.model<IAlert>('Alert', alertSchema)
