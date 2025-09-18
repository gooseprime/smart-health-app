import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smarthealth.monitor',
  appName: 'Smart Health Monitor',
  webDir: 'out',
  server: {
    url: 'http://localhost:3001',
    cleartext: true
  }
};

export default config;
