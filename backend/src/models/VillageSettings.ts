import mongoose, { Document, Schema } from 'mongoose'

export interface IVillageSettings extends Document {
  _id: string
  villageName: string
  population: number
  coordinates: {
    latitude: number
    longitude: number
  }
  healthFacilities: {
    name: string
    type: 'hospital' | 'clinic' | 'health_center' | 'pharmacy'
    contact: string
    capacity: number
  }[]
  waterSources: {
    name: string
    type: 'well' | 'borehole' | 'river' | 'tap' | 'tank'
    status: 'active' | 'maintenance' | 'contaminated' | 'dry'
    lastTested?: Date
    testResults?: {
      phLevel: number
      contaminationLevel: 'low' | 'medium' | 'high'
      bacteriaCount: number
    }
  }[]
  emergencyContacts: {
    name: string
    role: string
    phone: string
    email?: string
  }[]
  thresholds: {
    waterContamination: {
      low: number
      medium: number
      high: number
    }
    diseaseOutbreak: {
      casesPerWeek: number
      severityThreshold: 'mild' | 'moderate' | 'severe'
    }
    waterShortage: {
      daysWithoutWater: number
      populationAffected: number
    }
  }
  lastUpdated: Date
  updatedBy: mongoose.Types.ObjectId
}

const villageSettingsSchema = new Schema<IVillageSettings>({
  villageName: {
    type: String,
    required: [true, 'Village name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Village name cannot exceed 100 characters']
  },
  population: {
    type: Number,
    required: [true, 'Population is required'],
    min: [0, 'Population cannot be negative']
  },
  coordinates: {
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
    }
  },
  healthFacilities: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'health_center', 'pharmacy'],
      required: true
    },
    contact: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: [0, 'Capacity cannot be negative']
    }
  }],
  waterSources: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['well', 'borehole', 'river', 'tap', 'tank'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'contaminated', 'dry'],
      default: 'active'
    },
    lastTested: {
      type: Date
    },
    testResults: {
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
      }
    }
  }],
  emergencyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  }],
  thresholds: {
    waterContamination: {
      low: {
        type: Number,
        default: 10,
        min: [0, 'Threshold cannot be negative']
      },
      medium: {
        type: Number,
        default: 50,
        min: [0, 'Threshold cannot be negative']
      },
      high: {
        type: Number,
        default: 100,
        min: [0, 'Threshold cannot be negative']
      }
    },
    diseaseOutbreak: {
      casesPerWeek: {
        type: Number,
        default: 5,
        min: [1, 'Cases per week must be at least 1']
      },
      severityThreshold: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        default: 'moderate'
      }
    },
    waterShortage: {
      daysWithoutWater: {
        type: Number,
        default: 3,
        min: [1, 'Days without water must be at least 1']
      },
      populationAffected: {
        type: Number,
        default: 50,
        min: [1, 'Population affected must be at least 1']
      }
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Updated by is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
villageSettingsSchema.index({ villageName: 1 })
villageSettingsSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 })
villageSettingsSchema.index({ updatedBy: 1 })

// Virtual for village settings ID
villageSettingsSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Pre-save middleware to update lastUpdated
villageSettingsSchema.pre('save', function(next) {
  this.lastUpdated = new Date()
  next()
})

export const VillageSettings = mongoose.model<IVillageSettings>('VillageSettings', villageSettingsSchema)
