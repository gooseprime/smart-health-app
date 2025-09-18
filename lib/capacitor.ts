import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Preferences } from '@capacitor/preferences'
import { Device } from '@capacitor/device'
import { Network } from '@capacitor/network'
import { SplashScreen } from '@capacitor/splash-screen'

export class NativeFeatures {
  // Camera functionality
  static async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      })
      return image.dataUrl
    } catch (error) {
      console.error('Camera error:', error)
      return null
    }
  }

  static async selectPhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      })
      return image.dataUrl
    } catch (error) {
      console.error('Photo selection error:', error)
      return null
    }
  }

  // File system operations
  static async saveFile(filename: string, data: string) {
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: data,
        directory: Directory.Documents,
        encoding: 'utf8'
      })
      return result.uri
    } catch (error) {
      console.error('File save error:', error)
      return null
    }
  }

  static async readFile(filename: string) {
    try {
      const result = await Filesystem.readFile({
        path: filename,
        directory: Directory.Documents,
        encoding: 'utf8'
      })
      return result.data
    } catch (error) {
      console.error('File read error:', error)
      return null
    }
  }

  // Preferences (local storage)
  static async setPreference(key: string, value: string) {
    try {
      await Preferences.set({ key, value })
      return true
    } catch (error) {
      console.error('Preference save error:', error)
      return false
    }
  }

  static async getPreference(key: string) {
    try {
      const { value } = await Preferences.get({ key })
      return value
    } catch (error) {
      console.error('Preference read error:', error)
      return null
    }
  }

  static async removePreference(key: string) {
    try {
      await Preferences.remove({ key })
      return true
    } catch (error) {
      console.error('Preference remove error:', error)
      return false
    }
  }

  // Device information
  static async getDeviceInfo() {
    try {
      const info = await Device.getInfo()
      return {
        platform: info.platform,
        model: info.model,
        manufacturer: info.manufacturer,
        osVersion: info.osVersion,
        isVirtual: info.isVirtual
      }
    } catch (error) {
      console.error('Device info error:', error)
      return null
    }
  }

  // Network status
  static async getNetworkStatus() {
    try {
      const status = await Network.getStatus()
      return {
        connected: status.connected,
        connectionType: status.connectionType
      }
    } catch (error) {
      console.error('Network status error:', error)
      return { connected: false, connectionType: 'unknown' }
    }
  }

  // Splash screen
  static async hideSplashScreen() {
    try {
      await SplashScreen.hide()
    } catch (error) {
      console.error('Splash screen error:', error)
    }
  }

  static async showSplashScreen() {
    try {
      await SplashScreen.show()
    } catch (error) {
      console.error('Splash screen error:', error)
    }
  }
}

// Network status listener
export function setupNetworkListener(callback: (status: { connected: boolean; connectionType: string }) => void) {
  Network.addListener('networkStatusChange', callback)
}

// Export for easy access
export default NativeFeatures