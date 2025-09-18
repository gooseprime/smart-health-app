import mongoose from 'mongoose'
import { logger } from '../utils/logger'

// MongoDB connection configuration
const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-health-monitor'
    
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    }

    await mongoose.connect(mongoUri, options)
    
    logger.info('MongoDB connected successfully')
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error)
    })
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected')
    })
    
  } catch (error) {
    logger.warn('MongoDB connection failed, running in offline mode:', error)
    // Don't throw error, allow server to start without MongoDB
  }
}

// Database configuration for different environments
export const databaseConfig = {
  development: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-health-monitor-dev',
    options: {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  production: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-health-monitor',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: process.env.NODE_ENV === 'production',
    }
  },
  test: {
    uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/smart-health-monitor-test',
    options: {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  }
}

export const getDbConfig = () => {
  const env = process.env.NODE_ENV || "development"
  return databaseConfig[env as keyof typeof databaseConfig]
}

export { connectDatabase }
