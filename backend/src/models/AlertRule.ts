import mongoose, { Document, Schema } from 'mongoose'

export interface IAlertRule extends Document {
  _id: string
  name: string
  description: string
  type: 'water_contamination' | 'disease_outbreak' | 'water_shortage' | 'infrastructure' | 'system'
  conditions: {
    field: string
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'between'
    value: any
    threshold?: number
  }[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  lastTriggered?: Date
  triggerCount: number
  villages: string[]
  notificationSettings: {
    email: boolean
    sms: boolean
    push: boolean
    webhook?: string
  }
}

const alertRuleSchema = new Schema<IAlertRule>({
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true,
    maxlength: [100, 'Rule name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Rule description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['water_contamination', 'disease_outbreak', 'water_shortage', 'infrastructure', 'system'],
    required: [true, 'Rule type is required']
  },
  conditions: [{
    field: {
      type: String,
      required: true,
      trim: true
    },
    operator: {
      type: String,
      enum: ['equals', 'greater_than', 'less_than', 'contains', 'between'],
      required: true
    },
    value: {
      type: Schema.Types.Mixed,
      required: true
    },
    threshold: {
      type: Number
    }
  }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Rule severity is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  lastTriggered: {
    type: Date
  },
  triggerCount: {
    type: Number,
    default: 0
  },
  villages: [{
    type: String,
    trim: true
  }],
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    webhook: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
alertRuleSchema.index({ type: 1 })
alertRuleSchema.index({ isActive: 1 })
alertRuleSchema.index({ createdBy: 1 })
alertRuleSchema.index({ villages: 1 })

// Virtual for rule ID
alertRuleSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

export const AlertRule = mongoose.model<IAlertRule>('AlertRule', alertRuleSchema)
