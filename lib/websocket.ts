import { io, Socket } from 'socket.io-client'

class WebSocketManager {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isEnabled = true

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Skip WebSocket connection in production or if disabled
      if (typeof window === 'undefined' || !this.isEnabled) {
        console.log('WebSocket disabled or server-side rendering')
        resolve()
        return
      }

      try {
        const serverUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
        
        this.socket = io(serverUrl, {
          auth: {
            token: token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null)
          },
          transports: ['websocket', 'polling'],
          timeout: 5000,
          forceNew: true
        })

        this.socket.on('connect', () => {
          console.log('WebSocket connected:', this.socket?.id)
          this.isConnected = true
          this.reconnectAttempts = 0
          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason)
          this.isConnected = false
          
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            this.handleReconnect()
          }
        })

        this.socket.on('connect_error', (error) => {
          console.warn('WebSocket connection error:', error.message)
          this.isConnected = false
          this.isEnabled = false // Disable WebSocket if connection fails
          resolve() // Don't reject, just resolve to allow app to continue
        })

        // Set up event listeners
        this.setupEventListeners()

      } catch (error) {
        console.warn('Failed to initialize WebSocket:', error)
        this.isEnabled = false
        resolve() // Don't reject, just resolve to allow app to continue
      }
    })
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Listen for new alerts
    this.socket.on('new-alert', (alert) => {
      console.log('New alert received:', alert)
      this.emit('new-alert', alert)
    })

    // Listen for alert updates
    this.socket.on('alert-updated', (alert) => {
      console.log('Alert updated:', alert)
      this.emit('alert-updated', alert)
    })

    // Listen for report updates
    this.socket.on('report-updated', (report) => {
      console.log('Report updated:', report)
      this.emit('report-updated', report)
    })

    // Listen for system notifications
    this.socket.on('system-notification', (notification) => {
      console.log('System notification:', notification)
      this.emit('system-notification', notification)
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect()
      }
    }, delay)
  }

  // Join user-specific room
  joinUserRoom(userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-user-room', userId)
      console.log('Joined user room:', userId)
    }
  }

  // Join admin room
  joinAdminRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-admin-room')
      console.log('Joined admin room')
    }
  }

  // Join village-specific room
  joinVillageRoom(villageName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-village-room', villageName)
      console.log('Joined village room:', villageName)
    }
  }

  // Emit custom events
  emit(event: string, data?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    }
  }

  // Listen for custom events
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // Remove event listener
  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback)
      } else {
        this.socket.off(event)
      }
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      console.log('WebSocket disconnected')
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket
  }

  // Enable/disable WebSocket
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    if (!enabled && this.socket) {
      this.disconnect()
    }
  }

  // Check if WebSocket is enabled
  isWebSocketEnabled(): boolean {
    return this.isEnabled
  }
}

// Create singleton instance
export const wsManager = new WebSocketManager()

// React hook for WebSocket
export const useWebSocket = () => {
  const connect = (token?: string) => wsManager.connect(token)
  const disconnect = () => wsManager.disconnect()
  const joinUserRoom = (userId: string) => wsManager.joinUserRoom(userId)
  const joinAdminRoom = () => wsManager.joinAdminRoom()
  const joinVillageRoom = (villageName: string) => wsManager.joinVillageRoom(villageName)
  const emit = (event: string, data?: any) => wsManager.emit(event, data)
  const on = (event: string, callback: (data: any) => void) => wsManager.on(event, callback)
  const off = (event: string, callback?: (data: any) => void) => wsManager.off(event, callback)
  const isConnected = () => wsManager.getConnectionStatus()

  return {
    connect,
    disconnect,
    joinUserRoom,
    joinAdminRoom,
    joinVillageRoom,
    emit,
    on,
    off,
    isConnected
  }
}

export default wsManager
